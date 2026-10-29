-- Migration: Allow anonymous meeting registration via a narrowly scoped RPC
-- Date: 2026-10-28
--
-- Security notes:
-- - Does not disable RLS or grant direct table-write privileges to anon.
-- - Stores only the supplied SHA-256 token hash, never the raw token.
-- - Uses the existing unique index on access_token_hash for concurrency-safe
--   protection against reusing a token hash.
-- - Assumes the function owner is a trusted database role with the required
--   table privileges. Review ownership/privileges before applying.

BEGIN;

CREATE OR REPLACE FUNCTION public.register_anonymous_meeting(
  p_meeting_id uuid,
  p_display_name text,
  p_token_hash text
)
RETURNS TABLE (
  registration_id uuid,
  meeting_id uuid,
  display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_meeting_status text;
  v_trimmed_name text;
  v_reg_id uuid;
BEGIN
  IF p_meeting_id IS NULL
     OR p_token_hash IS NULL
     OR p_display_name IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Invalid registration parameters.';
  END IF;

  IF p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Invalid registration parameters.';
  END IF;

  v_trimmed_name := pg_catalog.btrim(p_display_name);

  IF pg_catalog.char_length(v_trimmed_name) < 1
     OR pg_catalog.char_length(v_trimmed_name) > 100 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Invalid display name.';
  END IF;

  -- Lock the meeting row while validating status and inserting the registration.
  -- This prevents a concurrent status update from racing past this check.
  SELECT lm.status
    INTO v_meeting_status
  FROM public.live_meetings AS lm
  WHERE lm.id = p_meeting_id
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0002',
      MESSAGE = 'Meeting not found.';
  END IF;

  IF v_meeting_status NOT IN ('scheduled', 'live') THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Meeting is not open for registration.';
  END IF;

  -- The existing unique index on access_token_hash is the concurrency-safe
  -- protection against reuse. Handle only a confirmed token-hash conflict;
  -- re-raise any other unique violation rather than misreporting it.
  BEGIN
    INSERT INTO public.live_meeting_registrations (
      meeting_id,
      user_id,
      display_name,
      access_token_hash
    )
    VALUES (
      p_meeting_id,
      NULL,
      v_trimmed_name,
      p_token_hash
    )
    RETURNING id INTO v_reg_id;
  EXCEPTION
    WHEN unique_violation THEN
      IF EXISTS (
        SELECT 1
        FROM public.live_meeting_registrations AS r
        WHERE r.access_token_hash = p_token_hash
      ) THEN
        RAISE EXCEPTION USING
          ERRCODE = '23505',
          MESSAGE = 'This registration token has already been used.';
      END IF;

      RAISE;
  END;

  RETURN QUERY
  SELECT v_reg_id, p_meeting_id, v_trimmed_name;
END;
$function$;

-- Remove default/public and any previous direct grants before granting only
-- the roles intended to call this RPC.
REVOKE ALL ON FUNCTION public.register_anonymous_meeting(uuid, text, text)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.register_anonymous_meeting(uuid, text, text)
  TO anon, authenticated;

COMMIT;

