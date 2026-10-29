
/**
 * Chat module types.
 *
 * Messages are encrypted on the client before they are sent to the server.
 * The server should store and return ciphertext without decrypting it.
 */

export type ChatSenderRole = "citizen" | "admin";

export type ChatConversationStatus = "open" | "closed";

export type ChatEncryptionVersion = number;

/**
 * Encrypted message payload sent to server actions.
 */
export interface ChatEncryptedPayload {
  ciphertext: string;
  nonce: string;
  encryption_version: ChatEncryptionVersion;
}

/**
 * Conversation metadata returned by the server.
 *
 * The conversation token is a private client-side credential and must
 * never be included in this object.
 */
export interface ChatConversation {
  id: string;
  status: ChatConversationStatus;
  created_at: string;
  updated_at?: string;
  last_message_at: string | null;

  /**
   * Encrypted conversation key metadata.
   * The encrypted key must only be decrypted by an authorized client.
   */
  encrypted_conversation_key?: string;
  encryption_key_id?: string;

  /**
   * Nullable because anonymous citizens do not have an auth.users account.
   */
  participant_user_id?: string | null;

  /**
   * Set when the citizen hides the conversation from their own view.
   */
  citizen_hidden_at?: string | null;

  /**
   * Set when the conversation is deleted for everyone.
   */
  deleted_at?: string | null;
}

/**
 * A message returned by the chat repository.
 *
 * `content` is optional legacy plaintext support only. New messages
 * should use ciphertext, nonce, and encryption_version.
 */
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_role: ChatSenderRole;
  content?: string | null;
  ciphertext: string | null;
  nonce: string | null;
  encryption_version: ChatEncryptionVersion | null;
  created_at: string;
  deleted_at?: string | null;
}

/**
 * Result returned when an anonymous citizen creates a conversation.
 */
export interface CreateAnonymousChatResult {
  conversation_id: string;
  status: ChatConversationStatus;
  created_at: string;
}

/**
 * Anonymous conversation state returned to the citizen client.
 */
export interface AnonymousChatState {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

/**
 * Conversation summary for the admin inbox.
 */
export interface AdminChatConversation {
  id: string;
  status: ChatConversationStatus;
  created_at: string;
  updated_at?: string;
  last_message_at: string | null;
  participant_user_id?: string | null;
  last_message?: ChatMessage | null;
}

/**
 * Admin inbox conversation summary including encrypted conversation key
 * metadata required to decrypt the conversation key on the admin device.
 */
export interface AdminChatConversationSummary {
  id: string;
  status: ChatConversationStatus;
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

/**
 * Result returned when an admin reads a conversation.
 */
export interface AdminChatConversationState {
  conversation: {
    id: string;
    status: ChatConversationStatus;
    encrypted_conversation_key: string | null;
    encryption_key_id: string | null;
  };
  messages: ChatMessage[];
}

/**
 * Public portion of an administrator's encryption key.
 * The private key must never be sent to the server or exposed publicly.
 */
export interface AdminChatPublicKey {
  key_id: string;
  public_key: string;
  algorithm: string;
  created_at?: string;
}

/**
 * Standard result types for chat actions.
 *
 * If your project already defines a shared ActionResult type,
 * use that existing type in action files rather than duplicating it.
 */
export interface ChatActionSuccess<T> {
  success: true;
  data: T;
}

export interface ChatActionFailure {
  success: false;
  error: string;
}

export type ChatActionResult<T> =
  | ChatActionSuccess<T>
  | ChatActionFailure;
