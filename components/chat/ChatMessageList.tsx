
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ShieldCheck, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

import type { ChatMessage } from "@/lib/types/chat";
import ChatMessageBubble from "./ChatMessageBubble";

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId?: string | null;
  currentSenderRole: "citizen" | "admin";

  /**
   * Decrypt an encrypted message locally.
   * Return null if the message cannot be decrypted.
   */
  decryptMessage: (
    message: ChatMessage,
  ) => Promise<string | null>;

  /**
   * Optional callback to retry loading newer messages.
   */
  isLoading?: boolean;
}

export default function ChatMessageList({
  messages,
  currentUserId,
  currentSenderRole,
  decryptMessage,
  isLoading = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const getMessageText = async (
    message: ChatMessage,
  ): Promise<string | null> => {
    // Support legacy plaintext messages only when present.
    if (message.content) {
      return message.content;
    }

    if (!message.ciphertext || !message.nonce) {
      return null;
    }

    return decryptMessage(message);
  };

  return (
    <div
      aria-label="Historia ya mazungumzo"
      aria-live="polite"
      aria-busy={isLoading}
      className="chat-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f8f8fc] px-4 py-5 dark:bg-slate-950 sm:px-7 sm:py-7"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(139,92,246,0.07) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-4">
        <div className="mb-3 flex justify-center">
          <div className="flex max-w-sm items-start gap-2.5 rounded-2xl border border-violet-100 bg-white/90 px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <p>
              Karibu Mlele DC Admin Support. Tafadhali tumia lugha
              ya heshima na usitume nywila au taarifa zako za siri.
            </p>
          </div>
        </div>

        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto my-8 flex max-w-sm flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              <MessageCircle className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Anza mazungumzo
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Tuma ujumbe wako hapa. Unaweza kuuliza swali au
              kuomba msaada kutoka kwa Admin.
            </p>
          </motion.div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage =
              message.sender_role === currentSenderRole;

            const previousMessage = messages[index - 1];

            const showSender =
              index === 0 ||
              previousMessage?.sender_role !== message.sender_role;

            return (
              <EncryptedChatMessage
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                showSender={showSender}
                decryptMessage={getMessageText}
              />
            );
          })
        )}

        {isLoading && (
          <p className="py-2 text-center text-xs text-slate-400">
            Inapakia ujumbe...
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

interface EncryptedChatMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender: boolean;
  decryptMessage: (
    message: ChatMessage,
  ) => Promise<string | null>;
}

function EncryptedChatMessage({
  message,
  isOwnMessage,
  showSender,
  decryptMessage,
}: EncryptedChatMessageProps) {
  const [content, setContent] = useState<string | null>(null);
  const [decryptionFailed, setDecryptionFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const plaintext = await decryptMessage(message);

        if (cancelled) return;

        setContent(plaintext);
        setDecryptionFailed(plaintext === null);
      } catch {
        if (cancelled) return;

        setContent(null);
        setDecryptionFailed(true);
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [message, decryptMessage]);

  const displayMessage: ChatMessage = {
    ...message,
    content:
      content ??
      (decryptionFailed
        ? "Ujumbe huu hauwezi kufunguliwa kwa kutumia ufunguo uliopo."
        : "Inafungua ujumbe..."),
  };

  return (
    <div className="relative">
      {showSender && (
        <p
          className={`mb-1 text-[11px] font-semibold ${
            isOwnMessage
              ? "text-right text-violet-600 dark:text-violet-400"
              : "text-left text-slate-500 dark:text-slate-400"
          }`}
        >
          {isOwnMessage
            ? "Wewe"
            : message.sender_role === "admin"
              ? "Admin"
              : "Mwananchi"}
        </p>
      )}

      <div className={decryptionFailed ? "opacity-80" : undefined}>
        <ChatMessageBubble
          message={displayMessage}
          isOwnMessage={isOwnMessage}
          showSender={false}
        />
      </div>

      {decryptionFailed && (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <LockKeyhole className="h-3 w-3" />
          Ujumbe umesimbwa fiche; haujaweza kufunguliwa.
        </p>
      )}
    </div>
  );
}
