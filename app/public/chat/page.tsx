
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createAnonymousChatAction,
  getActiveAdminChatPublicKeyAction,
  readAnonymousChatAction,
} from "@/lib/actions/chat.actions";

import type {
  AdminChatPublicKey,
  ChatEncryptedPayload,
  ChatMessage,
} from "@/lib/types/chat";

import ChatPage from "@/components/chat/ChatPage";

// Implement this module using your chosen, reviewed E2EE protocol.
// Do not replace it with plaintext or base64 encoding.
import {
  createConversationEncryption,
  restoreConversationEncryption,
} from "@/lib/chat/e2ee";

const TOKEN_STORAGE_KEY = "anonymous-chat-credential";
const CONVERSATION_STORAGE_KEY = "anonymous-chat-conversation-id";
const ENCRYPTION_STORAGE_KEY = "anonymous-chat-encryption-state";

interface ChatEncryption {
  encryptMessage: (plaintext: string) => Promise<ChatEncryptedPayload>;
  decryptMessage: (message: ChatMessage) => Promise<string | null>;
}

interface StoredConversation {
  conversationId: string;
  conversationToken: string;
}

function getOrCreateToken(): string {
  const existing = sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (existing) return existing;

  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

  return token;
}

export default function ChatRoute() {
  const [conversation, setConversation] =
    useState<StoredConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryption, setEncryption] = useState<ChatEncryption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeChat = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getOrCreateToken();

      const storedId = sessionStorage.getItem(
        CONVERSATION_STORAGE_KEY,
      );
      const storedEncryption = sessionStorage.getItem(
        ENCRYPTION_STORAGE_KEY,
      );

      if (storedId && storedEncryption) {
        const restored = await restoreConversationEncryption(
          storedEncryption,
        );

        const readResult = await readAnonymousChatAction({
          conversationToken: token,
        });

        if (readResult.success) {
          setConversation({
            conversationId: storedId,
            conversationToken: token,
          });
          setMessages(readResult.data.messages);
          setEncryption(restored);
          setLoading(false);
          return;
        }

        // If the credential no longer grants access, don't silently
        // create a new conversation and lose the user's history.
        throw new Error(
          "Mazungumzo yaliyohifadhiwa hayapatikani. Tafadhali anzisha mazungumzo mapya.",
        );
      }

      const publicKeyResult =
        await getActiveAdminChatPublicKeyAction();

      if (!publicKeyResult.success) {
        throw new Error("Imeshindikana kupata ufunguo wa usimbaji fiche.");
      }

      const adminKey: AdminChatPublicKey | null =
        publicKeyResult.data;

      if (!adminKey) {
        throw new Error(
          "Huduma ya mazungumzo haijawa tayari kupokea ujumbe kwa sasa.",
        );
      }

      // Generates the conversation encryption material in the browser.
      // The private conversation key must remain client-side.
      const setup = await createConversationEncryption(adminKey);

      const createResult = await createAnonymousChatAction({
        conversationToken: token,
        encryptedConversationKey: setup.encryptedConversationKey,
        encryptionKeyId: adminKey.key_id,
      });

      if (!createResult.success) {
        throw new Error("Imeshindikana kuanzisha mazungumzo.");
      }

      const id = createResult.data.conversation_id;

      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id);
      sessionStorage.setItem(
        ENCRYPTION_STORAGE_KEY,
        setup.serializedEncryptionState,
      );

      setConversation({
        conversationId: id,
        conversationToken: token,
      });
      setMessages([]);
      setEncryption(setup.encryption);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Imeshindikana kuanzisha mazungumzo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void initializeChat();
  }, [initializeChat]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <p
          role="status"
          className="text-sm text-slate-600 dark:text-slate-300"
        >
          Inaandaa mazungumzo salama...
        </p>
      </main>
    );
  }

  if (error || !conversation || !encryption) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Mazungumzo hayajapatikana
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {error ?? "Tafadhali jaribu tena."}
          </p>

          <button
            type="button"
            onClick={() => void initializeChat()}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Jaribu tena
          </button>
        </div>
      </main>
    );
  }

  return (
    <ChatPage
      conversationId={conversation.conversationId}
      conversationToken={conversation.conversationToken}
      initialMessages={messages}
      encryptMessage={encryption.encryptMessage}
      decryptMessage={encryption.decryptMessage}
    />
  );
}
