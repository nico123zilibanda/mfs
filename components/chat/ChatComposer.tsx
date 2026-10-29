
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Paperclip, Send, Smile, LockKeyhole } from "lucide-react";

import { sendAnonymousChatMessageAction } from "@/lib/actions/chat.actions";
import type { ChatEncryptedPayload } from "@/lib/types/chat";

interface ChatComposerProps {
  /**
   * Secret bearer credential for this anonymous conversation.
   * Never use the conversation ID as a substitute.
   */
  conversationToken: string;

  /**
   * Encrypts plaintext locally using the conversation's E2EE key.
   * Must return ciphertext, nonce, and the supported encryption version.
   */
  encryptMessage: (plaintext: string) => Promise<ChatEncryptedPayload>;

  onMessageSent?: () => void | Promise<void>;
  disabled?: boolean;
}

export default function ChatComposer({
  conversationToken,
  encryptMessage,
  onMessageSent,
  disabled = false,
}: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSending = isPending || disabled;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const plaintext = content.trim();

    if (!plaintext || isSending) return;

    setError(null);

    startTransition(async () => {
      try {
        // Encryption happens in the browser before the server action.
        const payload = await encryptMessage(plaintext);

        const result = await sendAnonymousChatMessageAction({
          conversationToken,
          payload,
        });

        if (!result.success) {
          setError(result.message || "Imeshindikana kutuma ujumbe.");
          return;
        }

        setContent("");
        await onMessageSent?.();
      } catch {
        setError(
          "Imeshindikana kutuma ujumbe. Tafadhali jaribu tena.",
        );
      }
    });
  }

  return (
    <div className="border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2 sm:gap-3"
      >
        <div className="flex min-w-0 flex-1 items-end gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:bg-slate-900">
          <button
            type="button"
            aria-label="Viambatisho havijapatikana"
            disabled
            title="Viambatisho havijapatikana kwa sasa"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 opacity-60"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Emoji hazijapatikana"
            disabled
            title="Emoji hazijapatikana kwa sasa"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 opacity-60 sm:flex"
          >
            <Smile className="h-5 w-5" />
          </button>

          <textarea
            rows={1}
            maxLength={10_000}
            required
            disabled={isSending}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Andika ujumbe..."
            aria-label="Andika ujumbe wako"
            aria-describedby={error ? "chat-composer-error" : "chat-composer-security"}
            className="max-h-32 min-h-9 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSending}
          aria-label={isPending ? "Inatuma ujumbe" : "Tuma ujumbe"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? (
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>

      {error && (
        <p
          id="chat-composer-error"
          role="alert"
          className="mx-auto mt-2 max-w-3xl text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <p
        id="chat-composer-security"
        className="mx-auto mt-2 flex max-w-3xl items-center justify-center gap-1.5 text-center text-[10px] text-slate-400"
      >
        <LockKeyhole className="h-3 w-3 shrink-0" />
        Mlele DC Admin Support · Ujumbe hutumwa kwa usimbaji fiche
      </p>
    </div>
  );
}
