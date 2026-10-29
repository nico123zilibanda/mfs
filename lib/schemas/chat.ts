
import { z } from "zod";

/**
 * Shared validation rules
 */

const conversationIdSchema = z
  .string()
  .uuid("Invalid conversation ID.");

const conversationTokenSchema = z
  .string()
  .min(32, "Conversation credential is required.")
  .max(512, "Invalid conversation credential.");

const ciphertextSchema = z
  .string()
  .trim()
  .min(1, "Encrypted message is required.")
  .max(100_000, "Encrypted message is too large.");

const nonceSchema = z
  .string()
  .min(1, "Encryption nonce is required.")
  .max(500, "Invalid encryption nonce.");

const encryptionVersionSchema = z
  .number()
  .int("Encryption version must be an integer.")
  .min(1, "Unsupported encryption version.")
  .max(32_767, "Unsupported encryption version.");

const encryptedPayloadSchema = z
  .object({
    ciphertext: ciphertextSchema,
    nonce: nonceSchema,
    encryption_version: encryptionVersionSchema,
  })
  .strict();

/**
 * 1. Create an anonymous conversation.
 *
 * The citizen generates a cryptographically random credential
 * on the client. The raw credential must never be persisted
 * in the database or exposed in logs.
 */
export const createAnonymousChatSchema = z
  .object({
    conversationToken: conversationTokenSchema,

    encryptedConversationKey: z
      .string()
      .min(1, "Encrypted conversation key is required.")
      .max(12_000, "Encrypted conversation key is too large."),

    encryptionKeyId: z
      .string()
      .trim()
      .min(1, "Encryption key ID is required.")
      .max(200, "Encryption key ID is too long."),
  })
  .strict();

export type CreateAnonymousChatInput = z.infer<
  typeof createAnonymousChatSchema
>;

/**
 * 2. Send an encrypted message as an anonymous citizen.
 */
export const sendAnonymousChatMessageSchema = z
  .object({
    conversationToken: conversationTokenSchema,
    payload: encryptedPayloadSchema,
  })
  .strict();

export type SendAnonymousChatMessageInput = z.infer<
  typeof sendAnonymousChatMessageSchema
>;

/**
 * 3. Read an anonymous conversation.
 */
export const readAnonymousChatSchema = z
  .object({
    conversationToken: conversationTokenSchema,
  })
  .strict();

export type ReadAnonymousChatInput = z.infer<
  typeof readAnonymousChatSchema
>;

/**
 * 4. Send an encrypted reply as an administrator.
 *
 * The action and repository must independently enforce
 * the existing system-admin authorization rules.
 */
export const sendAdminChatReplySchema = z
  .object({
    conversationId: conversationIdSchema,
    payload: encryptedPayloadSchema,
  })
  .strict();

export type SendAdminChatReplyInput = z.infer<
  typeof sendAdminChatReplySchema
>;

/**
 * 5. Delete a conversation for the citizen only.
 *
 * The conversation remains available to the admin.
 * The citizen's credential must no longer allow reads or sends.
 */
export const deleteChatForMeSchema = z
  .object({
    conversationToken: conversationTokenSchema,
  })
  .strict();

export type DeleteChatForMeInput = z.infer<
  typeof deleteChatForMeSchema
>;

/**
 * 6. Delete a conversation for everyone.
 *
 * The citizen must provide the conversation credential.
 * Admin deletion must be authorized separately.
 */
export const deleteChatForEveryoneSchema = z
  .object({
    conversationId: conversationIdSchema,
    conversationToken: conversationTokenSchema.optional(),
  })
  .strict();

export type DeleteChatForEveryoneInput = z.infer<
  typeof deleteChatForEveryoneSchema
>;

/**
 * 7. Fetch a conversation by ID for an authorized admin.
 */
export const adminChatConversationSchema = z
  .object({
    conversationId: conversationIdSchema,
  })
  .strict();

export type AdminChatConversationInput = z.infer<
  typeof adminChatConversationSchema
>;

/**
 * 8. Register an administrator's public encryption key.
 *
 * Never accept or store the administrator's private key.
 */
export const registerAdminChatPublicKeySchema = z
  .object({
    keyId: z
      .string()
      .trim()
      .min(1, "Key ID is required.")
      .max(200, "Key ID is too long."),

    algorithm: z
      .string()
      .trim()
      .min(1, "Encryption algorithm is required.")
      .max(100, "Algorithm name is too long."),

    publicKey: z
      .string()
      .trim()
      .min(1, "Public key is required.")
      .max(12_000, "Public key is too large."),

    /**
     * When true, activates this key and deactivates all other admin keys.
     * Defaults to false.
     */
    isActive: z.boolean().optional().default(false),
  })
  .strict();

export type RegisterAdminChatPublicKeyInput = z.infer<
  typeof registerAdminChatPublicKeySchema
>;

/**
 * 9. List admin chat conversations.
 */
export const listAdminChatConversationsSchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(200, "Search query is too long.")
      .optional()
      .default(""),
  })
  .strict();

export type ListAdminChatConversationsInput = z.infer<
  typeof listAdminChatConversationsSchema
>;

/**
 * 10. Read an admin chat conversation.
 */
export const readAdminChatConversationSchema = z
  .object({
    conversationId: conversationIdSchema,
  })
  .strict();

export type ReadAdminChatConversationInput = z.infer<
  typeof readAdminChatConversationSchema
>;

/**
 * 11. Update an admin chat conversation status.
 */
export const setChatConversationStatusSchema = z
  .object({
    conversationId: conversationIdSchema,
    status: z.enum(["open", "closed"], {
      error: "Status must be 'open' or 'closed'.",
    }),
  })
  .strict();

export type SetChatConversationStatusInput = z.infer<
  typeof setChatConversationStatusSchema
>;

/**
 * 12. Delete an admin chat conversation.
 */
export const deleteAdminChatConversationSchema = z
  .object({
    conversationId: conversationIdSchema,
  })
  .strict();

export type DeleteAdminChatConversationInput = z.infer<
  typeof deleteAdminChatConversationSchema
>;
