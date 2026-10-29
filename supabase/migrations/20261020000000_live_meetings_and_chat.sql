-- Migration: Anonymous, end-to-end encrypted Chat with Admin
-- Date: 2026-10-20
--
-- Additive migration. It does not modify live_meetings, live_meeting_registrations,
-- public.feedback, or public.feedback_reference_counter.
--
-- IMPORTANT:
-- 1. Run only after reviewing this migration in a non-production environment.
-- 2. Anonymous chat RPCs are intentionally executable only by service_role.
--    Call them from server-only code (lib/repositories) using a server-only
--    Supabase service-role client. Never expose the service-role key to a browser.
-- 3. Server Actions must validate input, verify the citizen bearer credential,
--    and implement rate limiting / CAPTCHA before invoking these RPCs.
-- 4. This migration does not encrypt historical plaintext messages retroactively.
--    Existing rows remain readable to authorized authenticated users/admins.
-- 5. E2EE requires client-side encryption and a secure admin private-key lifecycle;
--    adding ciphertext columns alone does not implement E2EE.

BEGIN;

-- =========================================================
-- 1. ALLOW ANONYMOUS CONVERSATIONS (WITHOUT AUTH USERS)
-- =========================================================

ALTER TABLE public.chat_conversations
    ALTER COLUMN participant_user_id DROP NOT NULL;

ALTER TABLE public.chat_conversations
    ADD COLUMN IF NOT EXISTS anonymous_access_token_hash text,
    ADD COLUMN IF NOT EXISTS citizen_hidden_at timestamptz,
    ADD COLUMN IF NOT EXISTS encrypted_conversation_key text,
    ADD COLUMN IF NOT EXISTS encryption_key_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_conversations_anon_token_hash
    ON public.chat_conversations (anonymous_access_token_hash)
    WHERE anonymous_access_token_hash IS NOT NULL;

ALTER TABLE public.chat_conversations
    ADD CONSTRAINT chat_conversations_anonymous_token_hash_format_check
    CHECK (
        anonymous_access_token_hash IS NULL
        OR anonymous_access_token_hash ~ '^[0-9a-f]{64}$'
    );

-- Existing authenticated conversations continue to use participant_user_id.
-- Anonymous conversations are created only by the server-side RPC below.

-- =========================================================
-- 2. SUPPORT ENCRYPTED MESSAGES AND BOTH SENDER TYPES
-- =========================================================

ALTER TABLE public.chat_messages
    ALTER COLUMN sender_user_id DROP NOT NULL,
    ALTER COLUMN content DROP NOT NULL;

-- Drop the original inline content constraint, if present, so encrypted
-- messages can have content = NULL while legacy messages remain unchanged.
ALTER TABLE public.chat_messages
    DROP CONSTRAINT IF EXISTS chat_messages_content_check;

ALTER TABLE public.chat_messages
    ADD COLUMN IF NOT EXISTS sender_role text,
    ADD COLUMN IF NOT EXISTS ciphertext text,
    ADD COLUMN IF NOT EXISTS nonce text,
    ADD COLUMN IF NOT EXISTS encryption_version smallint;

-- Best-effort classification of existing messages. Rows remain intact.
UPDATE public.chat_messages AS msg
SET sender_role = CASE
    WHEN msg.sender_user_id = conv.participant_user_id THEN 'citizen'
    ELSE 'admin'
END
FROM public.chat_conversations AS conv
WHERE conv.id = msg.conversation_id
  AND msg.sender_role IS NULL;

-- Defensive fallback for any row that did not join for an unexpected reason.
UPDATE public.chat_messages
SET sender_role = 'citizen'
WHERE sender_role IS NULL;

ALTER TABLE public.chat_messages
    ALTER COLUMN sender_role SET DEFAULT 'citizen',
    ALTER COLUMN sender_role SET NOT NULL;

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_sender_role_check
    CHECK (sender_role IN ('citizen', 'admin'));

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_content_length_check
    CHECK (
        content IS NULL
        OR char_length(btrim(content)) BETWEEN 1 AND 10000
    );

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_ciphertext_length_check
    CHECK (
        ciphertext IS NULL
        OR char_length(ciphertext) BETWEEN 1 AND 100000
    );

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_nonce_length_check
    CHECK (
        nonce IS NULL
        OR char_length(nonce) BETWEEN 1 AND 500
    );

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_encryption_version_check
    CHECK (encryption_version IS NULL OR encryption_version > 0);

-- Every message is either legacy plaintext or a fully encrypted payload.
-- This preserves historical messages and prevents partially populated
-- encrypted payloads from being accepted.
ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_payload_shape_check
    CHECK (
        (
            content IS NOT NULL
            AND ciphertext IS NULL
            AND nonce IS NULL
            AND encryption_version IS NULL
        )
        OR
        (
            content IS NULL
            AND ciphertext IS NOT NULL
            AND nonce IS NOT NULL
            AND encryption_version IS NOT NULL
        )
    );

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created_asc
    ON public.chat_messages (conversation_id, created_at ASC);

-- =========================================================
-- 3. ADMIN PUBLIC ENCRYPTION KEYS
-- =========================================================
-- Only the public key is stored here. The private key must never be stored
-- in this table or sent to the browser. Use a vetted client-side crypto
-- library/protocol and a documented private-key backup/rotation procedure.

CREATE TABLE IF NOT EXISTS public.chat_admin_encryption_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id text NOT NULL UNIQUE
        CHECK (char_length(btrim(key_id)) BETWEEN 1 AND 200),
    algorithm text NOT NULL
        CHECK (char_length(btrim(algorithm)) BETWEEN 1 AND 100),
    public_key text NOT NULL
        CHECK (char_length(btrim(public_key)) BETWEEN 1 AND 12000),
    is_active boolean NOT NULL DEFAULT false,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_admin_encryption_one_active_key
    ON public.chat_admin_encryption_keys (is_active)
    WHERE is_active = true;

ALTER TABLE public.chat_admin_encryption_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.chat_admin_encryption_keys FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.chat_admin_encryption_keys TO authenticated;

CREATE POLICY chat_admin_encryption_keys_admin_read
ON public.chat_admin_encryption_keys
FOR SELECT TO authenticated
USING (public.is_system_admin());

CREATE POLICY chat_admin_encryption_keys_admin_insert
ON public.chat_admin_encryption_keys
FOR INSERT TO authenticated
WITH CHECK (
    public.is_system_admin()
    AND created_by = (SELECT auth.uid())
);

CREATE POLICY chat_admin_encryption_keys_admin_update
ON public.chat_admin_encryption_keys
FOR UPDATE TO authenticated
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Public key material is not secret. Anonymous clients can retrieve only
-- the active public key through this narrow RPC, not query the table.
CREATE OR REPLACE FUNCTION public.get_active_chat_admin_public_key()
RETURNS TABLE (
    key_id text,
    algorithm text,
    public_key text,
    created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT k.key_id, k.algorithm, k.public_key, k.created_at
    FROM public.chat_admin_encryption_keys AS k
    WHERE k.is_active = true
    ORDER BY k.created_at DESC
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_active_chat_admin_public_key() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_chat_admin_public_key() TO anon, authenticated;

-- =========================================================
-- 4. SERVER-ONLY RPC: CREATE ANONYMOUS CONVERSATION
-- =========================================================
-- p_token_hash must be SHA-256 hex of a cryptographically random bearer
-- token generated by the client. Store the raw token only on the citizen's
-- device. Never store/log the raw token on the server.

CREATE OR REPLACE FUNCTION public.create_anonymous_chat_conversation(
    p_token_hash text,
    p_encrypted_conversation_key text,
    p_encryption_key_id text
)
RETURNS TABLE (
    id uuid,
    status text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid conversation credential'
            USING ERRCODE = '22023';
    END IF;

    IF p_encrypted_conversation_key IS NULL
       OR char_length(p_encrypted_conversation_key) NOT BETWEEN 1 AND 12000 THEN
        RAISE EXCEPTION 'Invalid encrypted conversation key envelope'
            USING ERRCODE = '22023';
    END IF;

    IF p_encryption_key_id IS NULL
       OR char_length(btrim(p_encryption_key_id)) NOT BETWEEN 1 AND 200 THEN
        RAISE EXCEPTION 'Invalid encryption key identifier'
            USING ERRCODE = '22023';
    END IF;

    RETURN QUERY
    INSERT INTO public.chat_conversations (
        participant_user_id,
        status,
        anonymous_access_token_hash,
        encrypted_conversation_key,
        encryption_key_id
    )
    VALUES (
        NULL,
        'open',
        p_token_hash,
        p_encrypted_conversation_key,
        p_encryption_key_id
    )
    RETURNING
        chat_conversations.id,
        chat_conversations.status,
        chat_conversations.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.create_anonymous_chat_conversation(text, text, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_anonymous_chat_conversation(text, text, text)
    TO service_role;

-- =========================================================
-- 5. SERVER-ONLY RPC: READ ANONYMOUS ENCRYPTED MESSAGES
-- =========================================================

CREATE OR REPLACE FUNCTION public.read_anonymous_chat_messages(
    p_token_hash text
)
RETURNS TABLE (
    id uuid,
    conversation_id uuid,
    sender_role text,
    ciphertext text,
    nonce text,
    encryption_version smallint,
    created_at timestamptz,
    deleted_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid conversation credential'
            USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.chat_conversations AS c
        WHERE c.anonymous_access_token_hash = p_token_hash
          AND c.participant_user_id IS NULL
          AND c.citizen_hidden_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Conversation not found or no longer available'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        m.id,
        m.conversation_id,
        m.sender_role,
        m.ciphertext,
        m.nonce,
        m.encryption_version,
        m.created_at,
        m.deleted_at
    FROM public.chat_messages AS m
    INNER JOIN public.chat_conversations AS c
        ON c.id = m.conversation_id
    WHERE c.anonymous_access_token_hash = p_token_hash
      AND c.participant_user_id IS NULL
      AND c.citizen_hidden_at IS NULL
      AND m.deleted_at IS NULL
      AND m.ciphertext IS NOT NULL
    ORDER BY m.created_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.read_anonymous_chat_messages(text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_anonymous_chat_messages(text)
    TO service_role;

-- =========================================================
-- 6. SERVER-ONLY RPC: SEND ANONYMOUS ENCRYPTED MESSAGE
-- =========================================================

CREATE OR REPLACE FUNCTION public.send_anonymous_chat_message(
    p_token_hash text,
    p_ciphertext text,
    p_nonce text,
    p_encryption_version smallint
)
RETURNS TABLE (
    id uuid,
    conversation_id uuid,
    sender_role text,
    ciphertext text,
    nonce text,
    encryption_version smallint,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid conversation credential'
            USING ERRCODE = '22023';
    END IF;

    IF p_ciphertext IS NULL OR char_length(p_ciphertext) NOT BETWEEN 1 AND 100000
       OR p_nonce IS NULL OR char_length(p_nonce) NOT BETWEEN 1 AND 500
       OR p_encryption_version IS NULL OR p_encryption_version < 1 THEN
        RAISE EXCEPTION 'Invalid encrypted message payload'
            USING ERRCODE = '22023';
    END IF;

    SELECT c.id
    INTO v_conversation_id
    FROM public.chat_conversations AS c
    WHERE c.anonymous_access_token_hash = p_token_hash
      AND c.participant_user_id IS NULL
      AND c.citizen_hidden_at IS NULL
      AND c.status = 'open'
    FOR UPDATE;

    IF v_conversation_id IS NULL THEN
        RAISE EXCEPTION 'Conversation not found, hidden, or closed'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    INSERT INTO public.chat_messages (
        conversation_id,
        sender_user_id,
        sender_role,
        content,
        ciphertext,
        nonce,
        encryption_version
    )
    VALUES (
        v_conversation_id,
        NULL,
        'citizen',
        NULL,
        p_ciphertext,
        p_nonce,
        p_encryption_version
    )
    RETURNING
        chat_messages.id,
        chat_messages.conversation_id,
        chat_messages.sender_role,
        chat_messages.ciphertext,
        chat_messages.nonce,
        chat_messages.encryption_version,
        chat_messages.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.send_anonymous_chat_message(text, text, text, smallint)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_anonymous_chat_message(text, text, text, smallint)
    TO service_role;

-- =========================================================
-- 7. ADMIN RPC: SEND ENCRYPTED REPLY
-- =========================================================

CREATE OR REPLACE FUNCTION public.send_admin_encrypted_chat_message(
    p_conversation_id uuid,
    p_ciphertext text,
    p_nonce text,
    p_encryption_version smallint
)
RETURNS TABLE (
    id uuid,
    conversation_id uuid,
    sender_role text,
    ciphertext text,
    nonce text,
    encryption_version smallint,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_system_admin() THEN
        RAISE EXCEPTION 'Admin authorization required'
            USING ERRCODE = '42501';
    END IF;

    IF p_ciphertext IS NULL OR char_length(p_ciphertext) NOT BETWEEN 1 AND 100000
       OR p_nonce IS NULL OR char_length(p_nonce) NOT BETWEEN 1 AND 500
       OR p_encryption_version IS NULL OR p_encryption_version < 1 THEN
        RAISE EXCEPTION 'Invalid encrypted message payload'
            USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.chat_conversations AS c
        WHERE c.id = p_conversation_id
          AND c.status = 'open'
    ) THEN
        RAISE EXCEPTION 'Conversation not found or closed'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    INSERT INTO public.chat_messages (
        conversation_id,
        sender_user_id,
        sender_role,
        content,
        ciphertext,
        nonce,
        encryption_version
    )
    VALUES (
        p_conversation_id,
        (SELECT auth.uid()),
        'admin',
        NULL,
        p_ciphertext,
        p_nonce,
        p_encryption_version
    )
    RETURNING
        chat_messages.id,
        chat_messages.conversation_id,
        chat_messages.sender_role,
        chat_messages.ciphertext,
        chat_messages.nonce,
        chat_messages.encryption_version,
        chat_messages.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.send_admin_encrypted_chat_message(uuid, text, text, smallint)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_admin_encrypted_chat_message(uuid, text, text, smallint)
    TO authenticated;

-- =========================================================
-- 8. SERVER-ONLY RPC: DELETE FOR ME
-- =========================================================
-- Hides the conversation for the citizen and disables further reads/sends.
-- It retains the credential hash so the same credential can still request
-- "delete for everyone". Admin history remains available.

CREATE OR REPLACE FUNCTION public.hide_anonymous_chat_for_me(
    p_token_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid conversation credential'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.chat_conversations
    SET citizen_hidden_at = now(),
        updated_at = now()
    WHERE anonymous_access_token_hash = p_token_hash
      AND participant_user_id IS NULL
      AND citizen_hidden_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation not found or already hidden'
            USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.hide_anonymous_chat_for_me(text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hide_anonymous_chat_for_me(text)
    TO service_role;

-- =========================================================
-- 9. DELETE FOR EVERYONE
-- =========================================================
-- Admins may delete any conversation. A citizen must prove possession of
-- the matching conversation credential. ON DELETE CASCADE removes messages.

CREATE OR REPLACE FUNCTION public.delete_chat_for_everyone(
    p_conversation_id uuid,
    p_token_hash text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF public.is_system_admin() THEN
        DELETE FROM public.chat_conversations
        WHERE id = p_conversation_id;
    ELSE
        IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
            RAISE EXCEPTION 'Conversation credential required'
                USING ERRCODE = '42501';
        END IF;

        DELETE FROM public.chat_conversations
        WHERE id = p_conversation_id
          AND participant_user_id IS NULL
          AND anonymous_access_token_hash = p_token_hash;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation not found or deletion not permitted'
            USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_chat_for_everyone(uuid, text)
    FROM PUBLIC, anon, authenticated;
-- Authenticated callers are still checked inside the function:
-- only system admins may delete arbitrary conversations; others must present
-- the matching anonymous conversation credential. Server-side service_role
-- calls are used by the citizen Server Action after its own validation.
GRANT EXECUTE ON FUNCTION public.delete_chat_for_everyone(uuid, text)
    TO service_role, authenticated;

-- =========================================================
-- 10. PRIVILEGE AND POLICY NOTES
-- =========================================================
-- Existing chat RLS policies and grants are intentionally retained for
-- existing authenticated conversations and admin access.
-- Anonymous clients receive no direct table privileges. Anonymous chat
-- data operations go through the narrow server-only RPCs above.
-- Do not add anon table grants or anon RLS policies for chat_messages.

COMMIT;
