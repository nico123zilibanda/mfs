"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCheck,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  readAdminChatConversationAction,
  sendAdminChatReplyAction,
} from "@/lib/actions/chat.actions";

import type {
  AdminChatConversationState,
  ChatMessage,
} from "@/lib/types/chat";

import {
  loadAdminPrivateKey,
  importPrivateKeyFromPem,
  decryptConversationKey,
  importConversationKey,
  decryptWithConversationKey,
  encryptWithConversationKey,
} from "@/lib/chat/e2ee";

type Props = {
  conversationId: string | null;
};

function formatMessageTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("sw-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(date);
}

export default function ChatConversationPanel({
  conversationId,
}: Props) {
  const [state, setState] = useState<AdminChatConversationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, string | null>>({});
  const [reply, setReply] = useState("");
  const [sending, setTumaing] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    if (!conversationId) {
      setState(null);
      setDecrypted({});
      setError(null);
      setWarn(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setWarn(null);
    setDecrypted({});

    try {
      const res = await readAdminChatConversationAction({ conversationId });

      if (requestId !== requestIdRef.current) return;

      if (!res.success) {
        setState(null);
        setError(res.message ?? "Imeshindwa kupakia mazungumzo.");
        return;
      }

      setState(res.data);

      const storedPrivateKey = loadAdminPrivateKey();

      if (!storedPrivateKey) {
        setWarn(
          "Ufunguo binafsi wa msimamizi haupatikani kwenye kivinjari hiki. Rejesha ufunguo sahihi ili kufungua ujumbe uliosimbwa.",
        );
        return;
      }

      const encryptedConversationKey =
        res.data.conversation.encrypted_conversation_key;

      if (!encryptedConversationKey) {
        setWarn(
          "Mazungumzo haya hayana ufunguo wa mazungumzo uliosimbwa. Ujumbe hauwezi kufunguliwa wala kutumwa.",
        );
        return;
      }

      try {
        const privateKey = await importPrivateKeyFromPem(storedPrivateKey);
        const rawConversationKey = await decryptConversationKey(
          encryptedConversationKey,
          privateKey,
        );
        const aesKey = await importConversationKey(rawConversationKey);

        const decryptedMessages: Record<string, string | null> = {};

        for (const message of res.data.messages) {
          if (requestId !== requestIdRef.current) return;

          try {
            decryptedMessages[message.id] = await decryptWithConversationKey(
              message,
              aesKey,
            );
          } catch {
            decryptedMessages[message.id] = null;
          }
        }

        if (requestId !== requestIdRef.current) return;

        setDecrypted(decryptedMessages);

        const failedCount = Object.values(decryptedMessages).filter(
          (message) => message === null,
        ).length;

        if (failedCount > 0) {
          setWarn(
            `${failedCount} message(s) could not be decrypted. Check that the correct admin private key and encryption version are being used.`,
          );
        }
      } catch {
        if (requestId !== requestIdRef.current) return;

        setWarn(
          "Imeshindikana kufungua mazungumzo haya. Huenda ufunguo binafsi haulingani na mazungumzo haya au ufunguo uliosimbwa si sahihi.",
        );
      }
    } catch {
      if (requestId !== requestIdRef.current) return;

      setState(null);
      setError("Hitilafu isiyotarajiwa imetokea wakati wa kupakia mazungumzo.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    void load();

    return () => {
      // Invalidate pending loads/decryption when the selected conversation changes.
      requestIdRef.current += 1;
    };
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state?.messages.length, decrypted]);

  async function handleTuma() {
    const messageText = reply.trim();

    if (!conversationId || !messageText || sending || loading || warn) {
      return;
    }

    const currentConversationId = conversationId;
    const sendRequestId = requestIdRef.current;
    const storedPrivateKey = loadAdminPrivateKey();
    const encryptedConversationKey =
      state?.conversation.encrypted_conversation_key;

    if (!storedPrivateKey || !encryptedConversationKey) {
      setWarn("Funguo za usimbaji hazipatikani. Jibu halikutumwa.");
      return;
    }

    setTumaing(true);
    setError(null);

    try {
      const privateKey = await importPrivateKeyFromPem(storedPrivateKey);
      const rawConversationKey = await decryptConversationKey(
        encryptedConversationKey,
        privateKey,
      );
      const aesKey = await importConversationKey(rawConversationKey);
      const payload = await encryptWithConversationKey(messageText, aesKey);

      // Usitume ujumbe ikiwa mazungumzo yamebadilika wakati wa usimbaji.
      if (sendRequestId !== requestIdRef.current || currentConversationId !== conversationId) {
        return;
      }

      const res = await sendAdminChatReplyAction({
        conversationId: currentConversationId,
        payload,
      });

      if (!res.success) {
        setError(res.message ?? "Imeshindwa kutuma jibu.");
        return;
      }

      setReply("");
      await load();
      inputRef.current?.focus();
    } catch {
      setError(
        "Jibu halikuweza kusimbwa au kutumwa. Kagua ufunguo wa usimbaji kisha ujaribu tena.",
      );
    } finally {
      setTumaing(false);
    }
  }

  if (!conversationId) {
    return (
      <Card className="flex min-h-105 items-center justify-center">
        <CardContent className="flex max-w-sm flex-col items-center gap-3 pt-6 text-center">
          <div className="rounded-full bg-muted p-4">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">Hakuna mazungumzo yaliyochaguliwa</h3>
          <p className="text-sm text-muted-foreground">
            Select a citizen conversation from the inbox to view messages and
            send an encrypted reply.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading && !state) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <Separator />
        <CardContent className="space-y-5 py-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                index % 2 ? "justify-end" : "justify-start"
              }`}
            >
              <Skeleton className="h-16 w-3/5 rounded-2xl" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && !state) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Imeshindikana kufungua mazungumzo</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 size-4" />
            Jaribu tena
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!state) return null;

  const isYamefungwa = state.conversation.status === "closed";

  return (
    <Card className="flex h-[min(760px,calc(100vh-12rem))] min-h-120 flex-col overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback>
                <MessageCircle className="size-5" />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                Mazungumzo ya mwananchi
              </CardTitle>
              <CardDescription className="mt-1 break-all text-xs">
                Kitambulisho: {state.conversation.id}
              </CardDescription>
            </div>
          </div>

          <Badge variant={isYamefungwa ? "secondary" : "default"}>
            {isYamefungwa ? "Yamefungwa" : "Yapo wazi"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <LockKeyhole className="size-3.5" />
            Usimbaji kutoka mwisho hadi mwisho
          </Badge>

          <Badge variant="outline" className="gap-1.5 font-normal">
            <ShieldCheck className="size-3.5" />
            Ujumbe hufunguliwa kwenye kifaa
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => void load()}
            disabled={loading || sending}
          >
            {loading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Onyesha upya
          </Button>
        </div>
      </CardHeader>

      <Separator />

      {warn && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <KeyRound className="size-4" />
            <AlertTitle>Tahadhari ya usimbaji</AlertTitle>
            <AlertDescription className="text-sm">
              {warn}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4 sm:p-6">
          {state.messages.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-muted p-3">
                <MessageCircle className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Bado hakuna ujumbe</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                When the citizen sends a message, it will appear here after
                successful decryption.
              </p>
            </div>
          ) : (
            state.messages.map((message: ChatMessage) => {
              const isAdmin = message.sender_role === "admin";
              const messageText = decrypted[message.id];
              const isDecryptionFailed =
                Object.prototype.hasOwnProperty.call(decrypted, message.id) &&
                messageText === null;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] space-y-1.5 sm:max-w-[75%] ${
                      isAdmin ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 px-1 text-xs text-muted-foreground ${
                        isAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isAdmin && (
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            CT
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span>{isAdmin ? "Wewe (Msimamizi)" : "Mwananchi"}</span>
                      <span>·</span>
                      <span>
                        {formatMessageTime(
                          "created_at" in message
                            ? String(message.created_at ?? "")
                            : null,
                        )}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isAdmin
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm border bg-muted/60"
                      }`}
                    >
                      {messageText !== undefined && messageText !== null ? (
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {messageText}
                        </p>
                      ) : (
                        <div
                          className={`flex items-start gap-2 ${
                            isAdmin ? "text-primary-foreground/90" : ""
                          }`}
                        >
                          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
                          <p className="wrap-break-word">
                            {isDecryptionFailed
                              ? "Imeshindikana kufungua ujumbe huu."
                              : "Ujumbe unafunguliwa…"}
                          </p>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex justify-end px-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <CheckCheck className="size-3.5" />
                          Umetumwa na msimamizi
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <Separator />

      <CardContent className="space-y-3 p-4 sm:p-5">
        {isYamefungwa ? (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Mazungumzo yamefungwa</AlertTitle>
            <AlertDescription>
              This conversation is closed. Reopen it from the conversation
              management controls before replying.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void handleTuma();
              }}
            >
              <Input
                ref={inputRef}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={
                  warn
                    ? "Usimbaji haupatikani"
                    : "Andika jibu litakalosimbwa…"
                }
                autoComplete="off"
                maxLength={10000}
                disabled={sending || loading || !!warn}
                aria-label="Andika jibu"
              />

              <Button
                type="submit"
                disabled={
                  sending ||
                  loading ||
                  !!warn ||
                  !reply.trim() ||
                  isYamefungwa
                }
                aria-label="Tuma jibu lililosimbwa"
              >
                {sending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {sending ? "Inatuma…" : "Tuma"}
                </span>
              </Button>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5" />
              Ujumbe husimbwa kwenye kivinjari chako kabla ya kutumwa.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
