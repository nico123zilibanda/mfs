-- Migration: Anonymous citizen meeting registration foundation
-- Date: 2026-10-27

BEGIN;

-- 1. Make user_id nullable while retaining FK for non-null values.
ALTER TABLE public.live_meeting_registrations
    ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add credential hash column (raw token never stored).
ALTER TABLE public.live_meeting_registrations
    ADD COLUMN IF NOT EXISTS access_token_hash text;

-- Format check: sha256 hex (64 chars) when present.
ALTER TABLE public.live_meeting_registrations
    ADD CONSTRAINT live_meeting_registrations_access_token_hash_format_check
    CHECK (
        access_token_hash IS NULL
        OR access_token_hash ~ '^[0-9a-f]{64}$'
    );

-- 3. display_name validation 1..100 trimmed chars.
ALTER TABLE public.live_meeting_registrations
    DROP CONSTRAINT IF EXISTS live_meeting_registrations_display_name_check;
ALTER TABLE public.live_meeting_registrations
    ADD CONSTRAINT live_meeting_registrations_display_name_check
    CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 100);

-- 4. Uniqueness: authenticated users unique per meeting; anonymous rows cannot rely on (meeting_id,user_id).
-- Drop old unique constraint if exists (name may vary; attempt common).
ALTER TABLE public.live_meeting_registrations
    DROP CONSTRAINT IF EXISTS live_meeting_registrations_meeting_id_user_id_key;

-- Partial unique index for authenticated registrations.
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_meeting_registrations_meeting_user
    ON public.live_meeting_registrations (meeting_id, user_id)
    WHERE user_id IS NOT NULL;

-- Unique access token hash (when present).
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_meeting_registrations_token_hash
    ON public.live_meeting_registrations (access_token_hash)
    WHERE access_token_hash IS NOT NULL;

-- 5. RLS: revoke direct public insert/update/delete; keep select restricted.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.live_meeting_registrations FROM anon, authenticated;
-- service_role retains full access via default.

-- Ensure RLS enabled.
ALTER TABLE public.live_meeting_registrations ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies if any.
DROP POLICY IF EXISTS live_meeting_registrations_public_select ON public.live_meeting_registrations;
DROP POLICY IF EXISTS live_meeting_registrations_anon_insert ON public.live_meeting_registrations;

-- Only admins/authenticated owners can read their own registrations; anonymous via server.
CREATE POLICY live_meeting_registrations_owner_select
ON public.live_meeting_registrations
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_system_admin());

COMMIT;
