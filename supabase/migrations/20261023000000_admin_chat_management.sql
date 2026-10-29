-- Migration: Admin Chat Management RPCs
-- Date: 2026-10-23
--
-- Additive migration. Adds admin-only RPCs for listing, reading, and
-- managing anonymous citizen chat conversations.
--
-- IMPORTANT:
-- 1. Run only after reviewing this migration in a non-production environment.
-- 2. All RPCs below require an authenticated system administrator.
-- 3. This migration does not modify the existing chat tables or the
--    existing 20261020000000_live_meetings_and_chat migration.

BEGIN;

-- =========================================================
-- 1. LIST ADMIN CONVERSATIONS
-- =========================================================
-- Returns conversation summaries for all anonymous citizen chats,
-- ordered by most recent activity. Only system admins may call this.

CREATE OR REPLACE FUNCTION public.list_admin_chat_conversations(
    p_search text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    last_message_at timestamptz,
    participant_user_id uuid,
    encrypted_conversation_key text,
    encryption_key_id text,
    citizen_hidden_at timestamptz,
    deleted_at timestamptz,
    last_message_id uuid,
    last_message_sender_role text,
    last_message_ciphertext text,
    last_message_nonce text,
    last_message_encryption_version smallint,
    last_message_created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_system_admin() THEN
        RAISE EXCEPTION 'Admin authorization required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        c.id,
        c.status,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        c.participant_user_id,
        c.encrypted_conversation_key,
        c.encryption_key_id,
        c.citizen_hidden_at,
        c.deleted_at,
        lm.id AS last_message_id,
        lm.sender_role AS last_message_sender_role,
        lm.ciphertext AS last_message_ciphertext,
        lm.nonce AS last_message_nonce,
        lm.encryption_version AS last_message_encryption_version,
        lm.created_at AS last_message_created_at
    FROM public.chat_conversations AS c
    LEFT JOIN LATERAL (
        SELECT
            m.id,
            m.sender_role,
            m.ciphertext,
            m.nonce,
            m.encryption_version,
            m.created_at
        FROM public.chat_messages AS m
        WHERE m.conversation_id = c.id
          AND m.deleted_at IS NULL
        ORDER BY m.created_at DESC
        LIMIT 1
    ) AS lm ON TRUE
    WHERE c.participant_user_id IS NULL
      AND c.deleted_at IS NULL
      AND (
          p_search IS NULL
          OR p_search = ''
          OR c.id::text ILIKE '%' || p_search || '%'
      )
    ORDER BY
        COALESCE(lm.created_at, c.created_at) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admin_chat_conversations(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_admin_chat_conversations(text) TO authenticated;

-- =========================================================
-- 2. READ ADMIN CONVERSATION MESSAGES
-- =========================================================
-- Returns all non-deleted messages for a conversation. The admin
-- decrypts the conversation key client-side using their private key.

CREATE OR REPLACE FUNCTION public.read_admin_chat_conversation(
    p_conversation_id uuid
)
RETURNS TABLE (
    id uuid,
    conversation_id uuid,
    sender_role text,
    content text,
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
    IF NOT public.is_system_admin() THEN
        RAISE EXCEPTION 'Admin authorization required'
            USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.chat_conversations AS c
        WHERE c.id = p_conversation_id
          AND c.participant_user_id IS NULL
          AND c.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Conversation not found'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        m.id,
        m.conversation_id,
        m.sender_role,
        m.content,
        m.ciphertext,
        m.nonce,
        m.encryption_version,
        m.created_at,
        m.deleted_at
    FROM public.chat_messages AS m
    WHERE m.conversation_id = p_conversation_id
      AND m.deleted_at IS NULL
    ORDER BY m.created_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.read_admin_chat_conversation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_admin_chat_conversation(uuid) TO authenticated;

-- =========================================================
-- 3. UPDATE CONVERSATION STATUS
-- =========================================================
-- Allows an admin to open or close a conversation. Closing a
-- conversation prevents both citizens and admins from sending new
-- messages; existing history remains readable.

CREATE OR REPLACE FUNCTION public.set_chat_conversation_status(
    p_conversation_id uuid,
    p_status text
)
RETURNS TABLE (
    id uuid,
    status text
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

    IF p_status NOT IN ('open', 'closed') THEN
        RAISE EXCEPTION 'Invalid conversation status'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.chat_conversations
    SET status = p_status,
        updated_at = now()
    WHERE id = p_conversation_id
      AND participant_user_id IS NULL
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation not found'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT c.id, c.status
    FROM public.chat_conversations AS c
    WHERE c.id = p_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_chat_conversation_status(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_chat_conversation_status(uuid, text) TO authenticated;

-- =========================================================
-- 4. DELETE ADMIN CONVERSATION
-- =========================================================
-- Hard-deletes a conversation and all of its messages. Requires
-- system administrator authorization.

CREATE OR REPLACE FUNCTION public.delete_admin_chat_conversation(
    p_conversation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_system_admin() THEN
        RAISE EXCEPTION 'Admin authorization required'
            USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.chat_conversations
    WHERE id = p_conversation_id
      AND participant_user_id IS NULL
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation not found'
            USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_admin_chat_conversation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_admin_chat_conversation(uuid) TO authenticated;

COMMIT;