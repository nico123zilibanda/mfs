
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

import { createSupabaseServerClient } from "@/lib/auth/server";
import { ensureFound, throwDatabaseError } from "@/lib/db/errors";

import type {
  AdminChatPublicKey,
  ChatConversation,
  ChatMessage,
  CreateAnonymousChatResult,
} from "@/lib/types/chat";

import type {
  CreateAnonymousChatInput,
  SendAnonymousChatMessageInput,
  ReadAnonymousChatInput,
  SendAdminChatReplyInput,
  DeleteChatForMeInput,
  DeleteChatForEveryoneInput,
} from "@/lib/schemas/chat";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing server-side Supabase service-role configuration.",
  );
}

const serviceRoleClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

const CONVERSATIONS_TABLE = "chat_conversations";
const ADMIN_KEYS_TABLE = "chat_admin_encryption_keys";

type DatabaseMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: "citizen" | "admin";
  ciphertext: string | null;
  nonce: string | null;
  encryption_version: number | null;
  created_at: string;
  deleted_at: string | null;
};

type DatabaseConversationRow = {
  id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string | null;
  participant_user_id: string | null;
  encrypted_conversation_key: string | null;
  encryption_key_id: string | null;
  citizen_hidden_at: string | null;
};

type DatabasePublicKeyRow = {
  key_id: string;
  algorithm: string;
  public_key: string;
  created_at: string;
};

type AdminConversationSummaryRow = {
  id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string | null;
  last_message_at: string | null;
  participant_user_id: string | null;
  encrypted_conversation_key: string | null;
  encryption_key_id: string | null;
  citizen_hidden_at: string | null;
  deleted_at: string | null;
  last_message_id: string | null;
  last_message_sender_role: "citizen" | "admin" | null;
  last_message_ciphertext: string | null;
  last_message_nonce: string | null;
  last_message_encryption_version: number | null;
  last_message_created_at: string | null;
};

type AdminMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: "citizen" | "admin";
  content: string | null;
  ciphertext: string | null;
  nonce: string | null;
  encryption_version: number | null;
  created_at: string;
  deleted_at: string | null;
};

type RpcMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: "citizen" | "admin";
  ciphertext: string;
  nonce: string;
  encryption_version: number;
  created_at: string;
  deleted_at?: string | null;
};

async function hashConversationToken(
  token: string,
): Promise<string> {
  const normalizedToken = token.trim();

  if (
    normalizedToken.length < 32 ||
    normalizedToken.length > 512
  ) {
    throw new Error("Invalid conversation credential.");
  }

  const bytes = new TextEncoder().encode(normalizedToken);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function mapMessage(row: DatabaseMessageRow): ChatMessage {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_role: row.sender_role,
    ciphertext: row.ciphertext,
    nonce: row.nonce,
    encryption_version: row.encryption_version,
    created_at: row.created_at,
    deleted_at: row.deleted_at,
  };
}

function mapRpcMessage(row: RpcMessageRow): ChatMessage {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_role: row.sender_role,
    ciphertext: row.ciphertext,
    nonce: row.nonce,
    encryption_version: row.encryption_version,
    created_at: row.created_at,
    deleted_at: row.deleted_at ?? null,
  };
}

function mapConversation(
  row: DatabaseConversationRow,
  lastMessageAt: string | null,
): ChatConversation {
  return {
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
    last_message_at: lastMessageAt,
    encrypted_conversation_key:
      row.encrypted_conversation_key ?? undefined,
    encryption_key_id: row.encryption_key_id ?? undefined,
    participant_user_id: row.participant_user_id,
    citizen_hidden_at: row.citizen_hidden_at,
  };
}

function mapRpcRows(
  data: RpcMessageRow[] | RpcMessageRow | null,
): ChatMessage[] {
  if (!data) {
    return [];
  }

  return (Array.isArray(data) ? data : [data]).map(mapRpcMessage);
}

/**
 * Admin inbox conversation summary.
 */
export interface AdminChatConversationSummary {
  id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at?: string | null;
  last_message_at: string | null;
  participant_user_id?: string | null;
  encrypted_conversation_key?: string | null;
  encryption_key_id?: string | null;
  citizen_hidden_at?: string | null;
  deleted_at?: string | null;
  last_message?: ChatMessage | null;
}

function mapAdminConversationSummary(
  row: AdminConversationSummaryRow,
): AdminChatConversationSummary {
  const lastMessage =
    row.last_message_id && row.last_message_sender_role
      ? {
          id: row.last_message_id,
          conversation_id: row.id,
          sender_role: row.last_message_sender_role,
          ciphertext: row.last_message_ciphertext,
          nonce: row.last_message_nonce,
          encryption_version: row.last_message_encryption_version,
          created_at: row.last_message_created_at ?? new Date().toISOString(),
        }
      : null;

  return {
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
    last_message_at: row.last_message_at,
    participant_user_id: row.participant_user_id,
    encrypted_conversation_key:
      row.encrypted_conversation_key ?? undefined,
    encryption_key_id: row.encryption_key_id ?? undefined,
    citizen_hidden_at: row.citizen_hidden_at,
    deleted_at: row.deleted_at,
    last_message: lastMessage,
  };
}

function mapAdminMessageRow(row: AdminMessageRow): ChatMessage {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_role: row.sender_role,
    content: row.content,
    ciphertext: row.ciphertext,
    nonce: row.nonce,
    encryption_version: row.encryption_version,
    created_at: row.created_at,
    deleted_at: row.deleted_at,
  };
}

function mapAdminMessageRows(
  data: AdminMessageRow[] | AdminMessageRow | null,
): ChatMessage[] {
  if (!data) {
    return [];
  }

  return (Array.isArray(data) ? data : [data]).map(mapAdminMessageRow);
}

/**
 * List anonymous citizen conversations visible to an administrator.
 *
 * `search` is matched against the conversation UUID. Pass null or an
 * empty string to receive all conversations.
 */
async function listAdminConversations(
  search: string | null,
): Promise<AdminChatConversationSummary[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { data, error } = await supabase.rpc(
    "list_admin_chat_conversations",
    {
      p_search: search && search.trim().length > 0
        ? search.trim()
        : null,
    },
  );

  throwDatabaseError(error, "listing admin chat conversations");

  return mapAdminConversationRows(
    data as AdminConversationSummaryRow[] | AdminConversationSummaryRow | null,
  );
}

function mapAdminConversationRows(
  data:
    | AdminConversationSummaryRow[]
    | AdminConversationSummaryRow
    | null,
): AdminChatConversationSummary[] {
  if (!data) {
    return [];
  }

  return (Array.isArray(data) ? data : [data]).map(
    mapAdminConversationSummary,
  );
}

/**
 * Read an anonymous citizen conversation and all of its messages as
 * an authorized administrator.
 */
async function readAdminConversation(
  conversationId: string,
): Promise<{
  conversation: {
    id: string;
    status: "open" | "closed";
    encrypted_conversation_key: string | null;
    encryption_key_id: string | null;
  };
  messages: ChatMessage[];
}> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { data, error } = await supabase.rpc(
    "read_admin_chat_conversation",
    {
      p_conversation_id: conversationId,
    },
  );

  throwDatabaseError(error, "reading admin chat conversation");

  const messages = mapAdminMessageRows(data);

  // The conversation metadata is carried by the first message row's
  // conversation FK; fetch it separately for clarity.
  const { data: convData, error: convError } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(
      [
        "id",
        "status",
        "encrypted_conversation_key",
        "encryption_key_id",
      ].join(","),
    )
    .eq("id", conversationId)
    .maybeSingle<{
      id: string;
      status: "open" | "closed";
      encrypted_conversation_key: string | null;
      encryption_key_id: string | null;
    }>();

  throwDatabaseError(convError, "fetching admin conversation metadata");

  return {
    conversation: convData ?? {
      id: conversationId,
      status: "open",
      encrypted_conversation_key: null,
      encryption_key_id: null,
    },
    messages,
  };
}

/**
 * Update the status of an anonymous citizen conversation.
 */
async function setConversationStatus(
  conversationId: string,
  status: "open" | "closed",
): Promise<{ id: string; status: "open" | "closed" }> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { data, error } = await supabase.rpc(
    "set_chat_conversation_status",
    {
      p_conversation_id: conversationId,
      p_status: status,
    },
  );

  throwDatabaseError(error, "updating conversation status");

  const row = ensureFound(
    Array.isArray(data) ? data[0] : data,
    "Conversation status",
  ) as { id: string; status: "open" | "closed" };

  return { id: row.id, status: row.status };
}

/**
 * Permanently delete an anonymous citizen conversation and all of its
 * messages. Requires system administrator authorization.
 */
async function deleteAdminConversation(
  conversationId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { error } = await supabase.rpc(
    "delete_admin_chat_conversation",
    {
      p_conversation_id: conversationId,
    },
  );

  throwDatabaseError(error, "deleting admin chat conversation");
}

async function createAnonymousConversation(
  input: CreateAnonymousChatInput,
): Promise<CreateAnonymousChatResult> {
  const tokenHash = await hashConversationToken(
    input.conversationToken,
  );

  const { data, error } = await serviceRoleClient.rpc(
    "create_anonymous_chat_conversation",
    {
      p_token_hash: tokenHash,
      p_encrypted_conversation_key:
        input.encryptedConversationKey,
      p_encryption_key_id: input.encryptionKeyId,
    },
  );

  throwDatabaseError(error, "creating anonymous chat");

  const row = ensureFound(
    Array.isArray(data) ? data[0] : data,
    "Chat conversation",
  ) as {
    id: string;
    status: "open" | "closed";
    created_at: string;
  };

  return {
    conversation_id: row.id,
    status: row.status,
    created_at: row.created_at,
  };
}


async function readAnonymousConversation(
  input: ReadAnonymousChatInput,
): Promise<{
  conversation: ChatConversation;
  messages: ChatMessage[];
}> {
  const tokenHash = await hashConversationToken(
    input.conversationToken,
  );

  const { data: conversationData, error: conversationError } =
    await serviceRoleClient
      .from(CONVERSATIONS_TABLE)
      .select(
        [
          "id",
          "status",
          "created_at",
          "updated_at",
          "participant_user_id",
          "encrypted_conversation_key",
          "encryption_key_id",
          "citizen_hidden_at",
        ].join(","),
      )
      .eq("anonymous_access_token_hash", tokenHash)
      .is("participant_user_id", null)
      .is("citizen_hidden_at", null)
      .maybeSingle<DatabaseConversationRow>();

  throwDatabaseError(
    conversationError,
    "fetching anonymous conversation",
  );

  const conversation = ensureFound(
    conversationData,
    "Chat conversation",
  );

  const { data: messageData, error: messageError } =
    await serviceRoleClient.rpc(
      "read_anonymous_chat_messages",
      {
        p_token_hash: tokenHash,
      },
    );

  throwDatabaseError(messageError, "reading anonymous messages");

  const messages = mapRpcRows(
    messageData as RpcMessageRow[] | RpcMessageRow | null,
  );

  return {
    conversation: mapConversation(
      conversation,
      messages.at(-1)?.created_at ?? null,
    ),
    messages,
  };
}

async function sendAnonymousMessage(
  input: SendAnonymousChatMessageInput,
): Promise<ChatMessage> {
  const tokenHash = await hashConversationToken(
    input.conversationToken,
  );

  const { data, error } = await serviceRoleClient.rpc(
    "send_anonymous_chat_message",
    {
      p_token_hash: tokenHash,
      p_ciphertext: input.payload.ciphertext,
      p_nonce: input.payload.nonce,
      p_encryption_version:
        input.payload.encryption_version,
    },
  );

  throwDatabaseError(error, "sending anonymous chat message");

  const row = ensureFound(
    Array.isArray(data) ? data[0] : data,
    "Chat message",
  ) as RpcMessageRow;

  return mapRpcMessage(row);
}

async function sendAdminReply(
  input: SendAdminChatReplyInput,
): Promise<ChatMessage> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { data, error } = await supabase.rpc(
    "send_admin_encrypted_chat_message",
    {
      p_conversation_id: input.conversationId,
      p_ciphertext: input.payload.ciphertext,
      p_nonce: input.payload.nonce,
      p_encryption_version:
        input.payload.encryption_version,
    },
  );

  throwDatabaseError(error, "sending admin chat reply");

  const row = ensureFound(
    Array.isArray(data) ? data[0] : data,
    "Chat message",
  ) as RpcMessageRow;

  return mapRpcMessage(row);
}


async function deleteForMe(
  input: DeleteChatForMeInput,
): Promise<void> {
  const tokenHash = await hashConversationToken(
    input.conversationToken,
  );

  const { error } = await serviceRoleClient.rpc(
    "hide_anonymous_chat_for_me",
    {
      p_token_hash: tokenHash,
    },
  );

  throwDatabaseError(error, "hiding chat for citizen");
}


async function deleteForEveryone(
  input: DeleteChatForEveryoneInput,
): Promise<void> {
  let supabase: SupabaseClient;

  let tokenHash: string | null = null;

  if (input.conversationToken) {
    tokenHash = await hashConversationToken(
      input.conversationToken,
    );

    supabase = serviceRoleClient;
  } else {
    supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    throwDatabaseError(authError, "verifying administrator");

    ensureFound(authData.user, "Authenticated administrator");
  }

  const { error } = await supabase.rpc(
    "delete_chat_for_everyone",
    {
      p_conversation_id: input.conversationId,
      p_token_hash: tokenHash,
    },
  );

  throwDatabaseError(error, "deleting chat for everyone");
}

async function getActiveAdminPublicKey(): Promise<AdminChatPublicKey | null> {
    const supabase = await createSupabaseServerClient();
  
    const { data, error } = await supabase.rpc(
      "get_active_chat_admin_public_key"
    );
  
    if (error) {
      throwDatabaseError(error, "fetching admin public encryption key");
    }
  
    const row = Array.isArray(data) ? data[0] ?? null : data;
  
    if (!row) {
      return null;
    }
  
    return {
      key_id: row.key_id,
      algorithm: row.algorithm,
      public_key: row.public_key,
      created_at: row.created_at,
    };
  }


async function registerAdminPublicKey(input: {
  keyId: string;
  algorithm: string;
  publicKey: string;
  isActive?: boolean;
}): Promise<AdminChatPublicKey> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  const user = ensureFound(
    authData.user,
    "Authenticated administrator",
  );

  const isActive = input.isActive ?? false;

  const { data, error } = await supabase
    .from(ADMIN_KEYS_TABLE)
    .insert({
      key_id: input.keyId,
      algorithm: input.algorithm,
      public_key: input.publicKey,
      is_active: isActive,
      created_by: user.id,
    })
    .select("key_id, algorithm, public_key, created_at")
    .single<DatabasePublicKeyRow>();

  throwDatabaseError(error, "registering admin public key");

  const row = ensureFound(data, "Administrator public key");

  if (isActive) {
    await activateAdminKey(row.key_id);
  }

  return {
    key_id: row.key_id,
    algorithm: row.algorithm,
    public_key: row.public_key,
    created_at: row.created_at,
  };
}

/**
 * Generate a new RSA-OAEP 2048-bit key pair, register the public key as
 * the active admin encryption key, and hold the private key in server
 * memory. The private key is never written to the database or logs.
 *
 * This operation is idempotent: if an active key already exists, the
 * caller is refused instead of creating a duplicate. Generating a
 * replacement key would orphan existing anonymous conversations whose
 * conversation keys were sealed with the previous public key.
 *
 * Returns the public key metadata and the PEM-encoded private key. The
 * private key PEM must be shown to the administrator exactly once and
 * stored client-side only.
 */
async function initializeAdminEncryptionKey(): Promise<{
  keyId: string;
  algorithm: string;
  publicKey: string;
  privateKeyPem: string;
}> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  // Idempotency guard: an active key already exists. Re-issuing the
  // request would otherwise attempt to insert a second active key and
  // violate the partial unique index on (is_active = true).
  const { data: existingKey, error: existingError } = await supabase
    .from(ADMIN_KEYS_TABLE)
    .select("key_id, algorithm, public_key, created_at")
    .eq("is_active", true)
    .maybeSingle<DatabasePublicKeyRow>();

  throwDatabaseError(existingError, "checking existing admin encryption key");

  if (existingKey) {
    throw new Error(
      "An active administrator encryption key already exists. " +
      "Generating a new key would make existing conversations impossible " +
      "to decrypt.",
    );
  }

  // Generate an RSA-OAEP 2048-bit key pair using Node.js crypto.
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const publicKeyPem = keyPair.publicKey;
  const privateKeyPem = keyPair.privateKey;

  const keyId = crypto.randomUUID();

  const { data, error } = await supabase
    .from(ADMIN_KEYS_TABLE)
    .insert({
      key_id: keyId,
      algorithm: "RSA-OAEP",
      public_key: publicKeyPem,
      is_active: true,
      created_by: authData.user!.id,
    })
    .select("key_id, algorithm, public_key, created_at")
    .single<DatabasePublicKeyRow>();

  if (error) {
    // The unique partial index on (is_active = true) may have been
    // satisfied by a concurrent initialization. Surface a clear error
    // rather than a raw database constraint violation.
    if (
      error.code === "23505" ||
      /duplicate key/i.test(error.message ?? "")
    ) {
      throw new Error(
        "An active administrator encryption key was registered " +
        "concurrently. Reload the page to use the existing key.",
      );
    }

    throwDatabaseError(error, "initializing admin encryption key");
  }

  const row = ensureFound(data, "Administrator public key");

  return {
    keyId: row.key_id,
    algorithm: row.algorithm,
    publicKey: row.public_key,
    privateKeyPem,
  };
}

/**
 * Set the specified key as active and deactivate all other keys.
 * Requires system administrator authorization.
 */
async function activateAdminKey(keyId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  // Deactivate all keys first, then activate the requested one.
  const { error: deactivateError } = await supabase
    .from(ADMIN_KEYS_TABLE)
    .update({ is_active: false })
    .eq("is_active", true);

  throwDatabaseError(deactivateError, "deactivating existing admin keys");

  const { error: activateError } = await supabase
    .from(ADMIN_KEYS_TABLE)
    .update({ is_active: true })
    .eq("key_id", keyId);

  throwDatabaseError(activateError, "activating admin encryption key");
}

/**
 * Fetch a conversation by ID for an administrator, including the
 * encrypted conversation key. The administrator can then decrypt the
 * conversation key using their private key.
 */
async function getConversationForAdmin(
  conversationId: string,
): Promise<{
  id: string;
  status: "open" | "closed";
  encrypted_conversation_key: string | null;
  encryption_key_id: string | null;
} | null> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  throwDatabaseError(authError, "verifying administrator");

  ensureFound(authData.user, "Authenticated administrator");

  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(
      [
        "id",
        "status",
        "encrypted_conversation_key",
        "encryption_key_id",
      ].join(","),
    )
    .eq("id", conversationId)
    .maybeSingle<{
      id: string;
      status: "open" | "closed";
      encrypted_conversation_key: string | null;
      encryption_key_id: string | null;
    }>();

  throwDatabaseError(error, "fetching conversation for admin");

  return data;
}

export const chatRepository = {
  createAnonymousConversation,
  readAnonymousConversation,
  sendAnonymousMessage,
  sendAdminReply,
  deleteForMe,
  deleteForEveryone,
  getActiveAdminPublicKey,
  registerAdminPublicKey,
  initializeAdminEncryptionKey,
  activateAdminKey,
  getConversationForAdmin,
  listAdminConversations,
  readAdminConversation,
  setConversationStatus,
  deleteAdminConversation,
};
