"use client";

import type {
  AdminChatPublicKey,
  ChatEncryptedPayload,
  ChatMessage,
} from "@/lib/types/chat";

const ENCRYPTION_VERSION = 1;

interface ConversationEncryptionState {
  conversationKey: JsonWebKey;
  keyId: string;
  algorithm: string;
}

interface RsaKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

interface PemKeyPair {
  publicKeyPem: string;
  privateKeyPem: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  let bytes: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    bytes = new Uint8Array(buffer);
  } else {
    bytes = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function extractPemBody(pem: string): string {
  const match = pem.match(
    /-----BEGIN [A-Z ]+-----([\s\S]+)-----END [A-Z ]+-----/,
  );
  if (match) {
    return match[1].replace(/\s/g, "");
  }
  return pem.replace(/\s/g, "");
}

async function importAdminPublicKey(
  publicKey: string,
  algorithm: string,
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(extractPemBody(publicKey));

  // Default to RSA-OAEP; the algorithm string from the DB may vary
  // but the key usage is always "encrypt" for sealing the conversation key.
  return crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

export async function createConversationEncryption(
  adminKey: AdminChatPublicKey,
): Promise<{
  encryption: {
    encryptMessage: (plaintext: string) => Promise<ChatEncryptedPayload>;
    decryptMessage: (message: ChatMessage) => Promise<string | null>;
  };
  encryptedConversationKey: string;
  serializedEncryptionState: string;
}> {
  // Generate a symmetric AES-GCM key for this conversation.
  // The private key material never leaves the client.
  const conversationKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  // Import the administrator's public key to seal the conversation key.
  const adminPublicKey = await importAdminPublicKey(
    adminKey.public_key,
    adminKey.algorithm,
  );

  // Export the raw AES key bytes so they can be encrypted with RSA-OAEP.
  const exportedKey = await crypto.subtle.exportKey("raw", conversationKey);

  // Encrypt the conversation key with the admin's public key.
  // Only the administrator (holding the private key) can recover it.
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    adminPublicKey,
    exportedKey,
  );

  const encryptedConversationKey = arrayBufferToBase64(encryptedKey);

  // Serialize the AES key as JWK for client-side persistence in sessionStorage.
  const exportedConversationKey = await crypto.subtle.exportKey(
    "jwk",
    conversationKey,
  );

  const serializedEncryptionState = JSON.stringify({
    conversationKey: exportedConversationKey,
    keyId: adminKey.key_id,
    algorithm: adminKey.algorithm,
  } as ConversationEncryptionState);

  const encryption = {
    encryptMessage: async (
      plaintext: string,
    ): Promise<ChatEncryptedPayload> => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        conversationKey,
        encoded,
      );
      return {
        ciphertext: arrayBufferToBase64(ciphertext),
        nonce: arrayBufferToBase64(iv),
        encryption_version: ENCRYPTION_VERSION,
      };
    },
    decryptMessage: async (
      message: ChatMessage,
    ): Promise<string | null> => {
      if (!message.ciphertext || !message.nonce) {
        return null;
      }
      try {
        const ciphertext = base64ToArrayBuffer(message.ciphertext);
        const nonce = base64ToArrayBuffer(message.nonce);
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: nonce },
          conversationKey,
          ciphertext,
        );
        return new TextDecoder().decode(decrypted);
      } catch {
        return null;
      }
    },
  };

  return {
    encryption,
    encryptedConversationKey,
    serializedEncryptionState,
  };
}

export async function restoreConversationEncryption(
  serializedEncryptionState: string,
): Promise<{
  encryptMessage: (plaintext: string) => Promise<ChatEncryptedPayload>;
  decryptMessage: (message: ChatMessage) => Promise<string | null>;
}> {
  const state = JSON.parse(
    serializedEncryptionState,
  ) as ConversationEncryptionState;

  const conversationKey = await crypto.subtle.importKey(
    "jwk",
    state.conversationKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const encryption = {
    encryptMessage: async (
      plaintext: string,
    ): Promise<ChatEncryptedPayload> => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        conversationKey,
        encoded,
      );
      return {
        ciphertext: arrayBufferToBase64(ciphertext),
        nonce: arrayBufferToBase64(iv),
        encryption_version: ENCRYPTION_VERSION,
      };
    },
    decryptMessage: async (
      message: ChatMessage,
    ): Promise<string | null> => {
      if (!message.ciphertext || !message.nonce) {
        return null;
      }
      try {
        const ciphertext = base64ToArrayBuffer(message.ciphertext);
        const nonce = base64ToArrayBuffer(message.nonce);
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: nonce },
          conversationKey,
          ciphertext,
        );
        return new TextDecoder().decode(decrypted);
      } catch {
        return null;
      }
    },
  };

  return encryption;
}

/**
 * Generate an RSA-OAEP 2048-bit key pair for admin chat encryption.
 * The private key must be kept secret by the administrator and never
 * transmitted to or stored by the server.
 */
export async function generateRsaKeyPair(): Promise<RsaKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  ) as Promise<RsaKeyPair>;
}

/**
 * Export a CryptoKey as a PEM-encoded string (SPKI for public, PKCS#8 for private).
 */
export async function exportKeyToPem(key: CryptoKey): Promise<string> {
  const format = key.type === "public" ? "spki" : "pkcs8";
  const exported = await crypto.subtle.exportKey(format, key);
  const bytes = new Uint8Array(exported);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const header =
    key.type === "public"
      ? "-----BEGIN PUBLIC KEY-----"
      : "-----BEGIN PRIVATE KEY-----";
  const footer =
    key.type === "public"
      ? "-----END PUBLIC KEY-----"
      : "-----END PRIVATE KEY-----";
  // Wrap base64 at 64 characters per line per PEM convention.
  const wrapped = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `${header}\n${wrapped}\n${footer}\n`;
}

/**
 * Import a public key from a PEM-encoded SPKI string.
 */
export async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(extractPemBody(pem));
  return crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

/**
 * Import a private key from a PEM-encoded PKCS#8 string.
 */
export async function importPrivateKeyFromPem(pem: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(extractPemBody(pem));
  return crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
}

/**
 * Generate a complete RSA key pair and return both PEM-encoded keys.
 * The private key PEM should be shown to the administrator once and
 * stored client-side only; it must never be sent to the server.
 */
export async function generateRsaKeyPairPem(): Promise<PemKeyPair> {
  const pair = await generateRsaKeyPair();
  const [publicKeyPem, privateKeyPem] = await Promise.all([
    exportKeyToPem(pair.publicKey),
    exportKeyToPem(pair.privateKey),
  ]);
  return { publicKeyPem, privateKeyPem };
}

/**
 * Decrypt an RSA-OAEP-encrypted conversation key using the admin's private key.
 * The encrypted key is expected to be base64-encoded.
 */
export async function decryptConversationKey(
  encryptedKeyBase64: string,
  privateKey: CryptoKey,
): Promise<Uint8Array> {
  const encryptedKey = base64ToArrayBuffer(encryptedKeyBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKey,
  );
  return new Uint8Array(decrypted);
}

/**
 * Import raw AES key bytes as a CryptoKey for conversation encryption.
 */
export async function importConversationKey(
  rawKey: Uint8Array,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a plaintext message using AES-GCM with the given conversation key.
 */
export async function encryptWithConversationKey(
  plaintext: string,
  conversationKey: CryptoKey,
): Promise<ChatEncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    conversationKey,
    encoded,
  );
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    nonce: arrayBufferToBase64(iv),
    encryption_version: ENCRYPTION_VERSION,
  };
}

/**
 * Decrypt an AES-GCM-encrypted message using the given conversation key.
 */
export async function decryptWithConversationKey(
  message: ChatMessage,
  conversationKey: CryptoKey,
): Promise<string | null> {
  if (!message.ciphertext || !message.nonce) {
    return null;
  }
  try {
    const ciphertext = base64ToArrayBuffer(message.ciphertext);
    const nonce = base64ToArrayBuffer(message.nonce);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      conversationKey,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

const ADMIN_PRIVATE_KEY_STORAGE_KEY = "mfs.adminChatPrivateKeyPem";

/**
 * Persist the administrator's private key PEM in secure browser-local
 * storage. The key never leaves the client.
 */
export function persistAdminPrivateKey(privateKeyPem: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PRIVATE_KEY_STORAGE_KEY, privateKeyPem);
}

export function loadAdminPrivateKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_PRIVATE_KEY_STORAGE_KEY);
}

export function clearAdminPrivateKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_PRIVATE_KEY_STORAGE_KEY);
}

/**
 * Verify that a private key PEM corresponds to the given public key PEM.
 */
export async function verifyPrivateKeyMatchesPublicKey(
  privateKeyPem: string,
  publicKeyPem: string,
): Promise<boolean> {
  try {
    const privateKey = await importPrivateKeyFromPem(privateKeyPem);
    const publicKey = await importPublicKeyFromPem(publicKeyPem);
    const testData = new TextEncoder().encode("mfs-key-check");
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      testData,
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encrypted,
    );
    return new TextDecoder().decode(decrypted) === "mfs-key-check";
  } catch {
    return false;
  }
}
