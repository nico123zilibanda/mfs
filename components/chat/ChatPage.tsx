
"use client";

import { useCallback, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck } from "lucide-react";

import type {
  ChatEncryptedPayload,
  ChatMessage,
} from "@/lib/types/chat";

import {
  readAnonymousChatAction,
} from "@/lib/actions/chat.actions";

import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatComposer from "./ChatComposer";

interface ChatPageProps {
  conversationId: string;
  conversationToken: string;
  initialMessages: ChatMessage[];

  /**
   * Encrypts a message in the browser before it reaches the server.
   */
  encryptMessage: (
    plaintext: string,
  ) => Promise<ChatEncryptedPayload>;

  /**
   * Decrypts an individual message in the browser.
   */
  decryptMessage: (
    message: ChatMessage,
  ) => Promise<string | null>;
}

export default function ChatPage({
  conversationId,
  conversationToken,
  initialMessages,
  encryptMessage,
  decryptMessage,
}: ChatPageProps) {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);
  const [isRefreshing, startRefresh] = useTransition();
  const [refreshError, setRefreshError] = useState<string | null>(
    null,
  );

  const refreshMessages = useCallback(async () => {
    startRefresh(async () => {
      try {
        const result = await readAnonymousChatAction({
          conversationToken,
        });

        if (!result.success) {
          setRefreshError("Imeshindikana kupakia ujumbe mpya.");
          return;
        }

        // The server returns only messages authorized for this token.
        setMessages(result.data.messages);
        setRefreshError(null);
      } catch {
        setRefreshError("Imeshindikana kuunganisha na mazungumzo.");
      }
    });
  }, [conversationToken]);

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 dark:bg-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 flex items-center gap-3 px-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
              Huduma kwa wananchi
            </p>

            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Chat na Admin
            </h2>
          </div>
        </motion.div>

        <section className="flex h-[min(760px,calc(100dvh-150px))] min-h-115 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950">
          <ChatHeader />

          <ChatMessageList
            messages={messages}
            currentSenderRole="citizen"
            decryptMessage={decryptMessage}
            isLoading={isRefreshing}
          />

          {refreshError && (
            <div
              role="status"
              className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
            >
              {refreshError}
              <button
                type="button"
                onClick={refreshMessages}
                className="ml-2 font-semibold underline underline-offset-2"
              >
                Jaribu tena
              </button>
            </div>
          )}

          <ChatComposer
            conversationToken={conversationToken}
            encryptMessage={encryptMessage}
            onMessageSent={refreshMessages}
          />
        </section>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Kwa masuala ya dharura, tumia njia rasmi za mawasiliano
          zinazotolewa na mamlaka husika.
        </p>
      </div>
    </main>
  );
}
