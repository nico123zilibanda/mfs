
"use server";

import { actionFailure, executeAction } from "@/lib/actions/utils";
import type { ActionResult } from "@/lib/types/action-result";

import {
  createAnonymousChatSchema,
  readAnonymousChatSchema,
  sendAnonymousChatMessageSchema,
  sendAdminChatReplySchema,
  deleteChatForMeSchema,
  deleteChatForEveryoneSchema,
  registerAdminChatPublicKeySchema,
  listAdminChatConversationsSchema,
  readAdminChatConversationSchema,
  setChatConversationStatusSchema,
  deleteAdminChatConversationSchema,
} from "@/lib/schemas/chat";

import { chatRepository } from "@/lib/repositories/chat.repository";

import type {
  AdminChatPublicKey,
  AdminChatConversationSummary,
  AdminChatConversationState,
  AnonymousChatState,
  ChatMessage,
  CreateAnonymousChatResult,
} from "@/lib/types/chat";

/**
 * Create a new anonymous citizen conversation.
 */
export async function createAnonymousChatAction(
  input: unknown,
): Promise<ActionResult<CreateAnonymousChatResult>> {
  const validation = createAnonymousChatSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.createAnonymousConversation(validation.data),
    "Failed to create chat conversation.",
  );
}

/**
 * Read an anonymous citizen conversation and its encrypted messages.
 */
export async function readAnonymousChatAction(
  input: unknown,
): Promise<ActionResult<AnonymousChatState>> {
  const validation = readAnonymousChatSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.readAnonymousConversation(validation.data),
    "Failed to load chat conversation.",
  );
}

/**
 * Send an encrypted message from an anonymous citizen.
 */
export async function sendAnonymousChatMessageAction(
  input: unknown,
): Promise<ActionResult<ChatMessage>> {
  const validation = sendAnonymousChatMessageSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.sendAnonymousMessage(validation.data),
    "Failed to send chat message.",
  );
}

/**
 * Send an encrypted reply as an authenticated system administrator.
 *
 * The repository and database RPC must verify administrator permissions.
 */
export async function sendAdminChatReplyAction(
  input: unknown,
): Promise<ActionResult<ChatMessage>> {
  const validation = sendAdminChatReplySchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.sendAdminReply(validation.data),
    "Failed to send administrator reply.",
  );
}

/**
 * Hide an anonymous conversation from the citizen's view.
 *
 * This does not delete the conversation or its messages for administrators.
 */
export async function deleteAnonymousChatForMeAction(
  input: unknown,
): Promise<ActionResult<void>> {
  const validation = deleteChatForMeSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.deleteForMe(validation.data),
    "Failed to hide chat conversation.",
  );
}

/**
 * Permanently delete a conversation.
 *
 * Citizens must provide their conversation credential.
 * An administrator without a credential must be authorized by the
 * authenticated session and the database RPC.
 */
export async function deleteChatForEveryoneAction(
  input: unknown,
): Promise<ActionResult<void>> {
  const validation = deleteChatForEveryoneSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.deleteForEveryone(validation.data),
    "Failed to delete chat conversation.",
  );
}

/**
 * Get the currently active administrator public encryption key.
 *
 * The public key can be shared with citizens to encrypt messages.
 * The administrator's private key must never be returned by this action.
 */
export async function getActiveAdminChatPublicKeyAction(): Promise<
  ActionResult<AdminChatPublicKey | null>
> {
  return executeAction(
    () => chatRepository.getActiveAdminPublicKey(),
    "Failed to retrieve the administrator encryption key.",
  );
}

/**
 * Register an administrator public encryption key.
 *
 * The repository/database must verify system administrator permissions.
 * When `isActive` is true, the key is activated and all other keys are
 * deactivated.
 */
export async function registerAdminChatPublicKeyAction(
  input: unknown,
): Promise<ActionResult<AdminChatPublicKey>> {
  const validation = registerAdminChatPublicKeySchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.registerAdminPublicKey(validation.data),
    "Failed to register administrator encryption key.",
  );
}

/**
 * Initialize the administrator's encryption key pair.
 *
 * Generates a new RSA-OAEP key pair, registers the public key as the
 * active admin encryption key. The private key is never stored on the
 * server; the private key PEM is returned to the caller exactly once
 * and must be persisted client-side only. It is never written to the
 * database or server logs.
 */
export async function initializeAdminEncryptionKeyAction(): Promise<
  ActionResult<{
    keyId: string;
    algorithm: string;
    publicKey: string;
    privateKeyPem: string;
  }>
> {
  return executeAction(
    () => chatRepository.initializeAdminEncryptionKey(),
    "Failed to initialize administrator encryption key.",
  );
}

/**
 * Activate an existing administrator encryption key and deactivate all
 * others. Requires system administrator authorization.
 */
export async function activateAdminChatPublicKeyAction(
  keyId: string,
): Promise<ActionResult<void>> {
  return executeAction(
    () => chatRepository.activateAdminKey(keyId),
    "Failed to activate administrator encryption key.",
  );
}

/**
 * List anonymous citizen conversations visible to an administrator.
 */
export async function listAdminChatConversationsAction(
  input: unknown,
): Promise<ActionResult<AdminChatConversationSummary[]>> {
  const validation = listAdminChatConversationsSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.listAdminConversations(validation.data.search),
    "Failed to list chat conversations.",
  );
}

/**
 * Read an anonymous citizen conversation and all of its messages as
 * an authorized administrator.
 */
export async function readAdminChatConversationAction(
  input: unknown,
): Promise<ActionResult<AdminChatConversationState>> {
  const validation = readAdminChatConversationSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () => chatRepository.readAdminConversation(validation.data.conversationId),
    "Failed to read chat conversation.",
  );
}

/**
 * Update the status of an anonymous citizen conversation.
 */
export async function setChatConversationStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: "open" | "closed" }>> {
  const validation = setChatConversationStatusSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () =>
      chatRepository.setConversationStatus(
        validation.data.conversationId,
        validation.data.status,
      ),
    "Failed to update conversation status.",
  );
}

/**
 * Permanently delete an anonymous citizen conversation and all of its
 * messages. Requires system administrator authorization.
 */
export async function deleteAdminChatConversationAction(
  input: unknown,
): Promise<ActionResult<void>> {
  const validation = deleteAdminChatConversationSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure("Validation failed.");
  }

  return executeAction(
    () =>
      chatRepository.deleteAdminConversation(
        validation.data.conversationId,
      ),
    "Failed to delete chat conversation.",
  );
}
