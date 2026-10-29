
"use client";

import { CheckCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export default function ChatMessageBubble({
  message,
  isOwnMessage,
  showSender = false,
}: ChatMessageBubbleProps) {
  const time = new Intl.DateTimeFormat("sw-TZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.created_at));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%]",
          isOwnMessage
            ? "rounded-br-md bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-slate-100"
            : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        )}
      >
        {showSender && !isOwnMessage && (
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Support
          </div>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>

        <div
          className={cn(
            "mt-2 flex items-center justify-end gap-1.5 text-[10px]",
            isOwnMessage
              ? "text-slate-500 dark:text-slate-400"
              : "text-slate-400 dark:text-slate-500",
          )}
        >
          <time dateTime={message.created_at}>{time}</time>

          {isOwnMessage && (
            <CheckCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
