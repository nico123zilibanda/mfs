"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Inbox,
  AlertCircle,
} from "lucide-react";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  deleteAdminChatConversationAction,
  listAdminChatConversationsAction,
} from "@/lib/actions/chat.actions";
import type { AdminChatConversationSummary } from "@/lib/types/chat";

type Filter = "all" | "open" | "closed";

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Mazungumzo yote" },
  { value: "open", label: "Yaliyo wazi" },
  { value: "closed", label: "Yaliyofungwa" },
];

function getConversationLabel(id: string) {
  return `Mazungumzo ${id.slice(0, 8).toUpperCase()}`;
}

function getStatusLabel(status: AdminChatConversationSummary["status"]) {
  return status === "open" ? "Wazi" : "Yamefungwa";
}

function formatLastActivity(value: string | null | undefined) {
  if (!value) return "Bado hakuna ujumbe";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Muda haujulikani";

  return new Intl.DateTimeFormat("sw-TZ", {
    timeZone: "Africa/Dar_es_Salaam",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ConversationSkeleton() {
  return (
    <div className="space-y-3 p-2" aria-label="Inapakia mazungumzo" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border p-3"
        >
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="h-3 w-40 max-w-full" />
            <Skeleton className="h-3 w-28 max-w-full" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function ChatConversationList({ selectedId, onSelect }: Props) {
  const [items, setItems] = useState<AdminChatConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] =
    useState<AdminChatConversationSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (searchTerm: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const result = await listAdminChatConversationsAction({
        search: searchTerm.trim(),
      });

      if (!result.success) {
        setError(result.message ?? "Imeshindikana kupakia mazungumzo.");
        return;
      }

      setItems(result.data);
    } catch {
      setError("Hitilafu isiyotarajiwa imetokea wakati wa kupakia mazungumzo.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Pakia data ya mwanzo, kisha subiri mtumiaji amalize kuandika kabla ya kutafuta.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load(search, true);
    }, search.trim() ? 350 : 0);

    return () => window.clearTimeout(timeout);
  }, [load, search]);

  const handleDelete = useCallback(async () => {
    if (!pendingDelete || deletingId) return;

    const conversation = pendingDelete;
    setDeletingId(conversation.id);
    setError(null);

    try {
      const result = await deleteAdminChatConversationAction({
        conversationId: conversation.id,
      });

      if (!result.success) {
        setError(result.message ?? "Imeshindikana kufuta mazungumzo.");
        return;
      }

      setItems((current) =>
        current.filter((item) => item.id !== conversation.id),
      );

      if (selectedId === conversation.id) onSelect(null);
      setPendingDelete(null);
    } catch {
      setError("Hitilafu isiyotarajiwa imetokea wakati wa kufuta mazungumzo.");
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, deletingId, selectedId, onSelect]);

  const counts = useMemo(
    () => ({
      all: items.length,
      open: items.filter((item) => item.status === "open").length,
      closed: items.filter((item) => item.status === "closed").length,
    }),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter(
        (conversation) =>
          filter === "all" || conversation.status === filter,
      ),
    [items, filter],
  );

  const isSearching = search.trim().length > 0;

  return (
    <TooltipProvider>
      <>
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader className="space-y-4 border-b px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="size-5 shrink-0 text-primary" />
                  <span>Orodha ya mazungumzo</span>
                </CardTitle>
                <CardDescription>
                  Simamia mazungumzo ya wananchi na wasimamizi.
                </CardDescription>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => void load(search, true)}
                    disabled={loading || deletingId !== null}
                    aria-label="Sasisha mazungumzo"
                  >
                    <RefreshCw
                      className={`size-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sasisha orodha</TooltipContent>
              </Tooltip>
            </div>

            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tafuta mazungumzo..."
                aria-label="Tafuta mazungumzo"
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-3 gap-2" aria-label="Chuja mazungumzo">
              {FILTERS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={filter === item.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                  className="min-w-0 gap-1.5 px-2"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="text-xs opacity-80">
                    {counts[item.value]}
                  </span>
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 p-2">
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="size-4" />
                <AlertTitle>Hitilafu</AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-2">
                  <span>{error}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit"
                    disabled={loading}
                    onClick={() => void load(search, true)}
                  >
                    Jaribu tena
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {loading && items.length === 0 ? (
              <ConversationSkeleton />
            ) : filteredItems.length === 0 ? (
              <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-muted">
                    {isSearching ? (
                      <Search className="size-6 text-muted-foreground" />
                    ) : (
                      <Inbox className="size-6 text-muted-foreground" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <p className="font-medium">
                    {isSearching
                      ? "Hakuna mazungumzo yanayolingana na utafutaji"
                      : filter === "all"
                        ? "Bado hakuna mazungumzo"
                        : filter === "open"
                          ? "Hakuna mazungumzo yaliyo wazi"
                          : "Hakuna mazungumzo yaliyofungwa"}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {isSearching
                      ? "Jaribu kutumia neno lingine la utafutaji."
                      : "Mazungumzo mapya ya wananchi yataonekana hapa."}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full pr-2">
                <ul className="space-y-2 pb-2">
                  {filteredItems.map((conversation) => {
                    const selected = selectedId === conversation.id;
                    const deleting = deletingId === conversation.id;

                    return (
                      <li key={conversation.id}>
                        <div
                          className={`group flex items-center gap-1 rounded-xl border p-2 transition-colors ${
                            selected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent hover:border-border hover:bg-muted/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelect(conversation.id)}
                            aria-current={selected ? "true" : undefined}
                            aria-label={`Fungua ${getConversationLabel(conversation.id)}`}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Avatar className="size-11 shrink-0">
                              <AvatarFallback
                                className={
                                  selected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }
                              >
                                <MessageSquare className="size-5" />
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-semibold">
                                  {getConversationLabel(conversation.id)}
                                </span>
                                <Badge
                                  variant={
                                    conversation.status === "open"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="shrink-0"
                                >
                                  {getStatusLabel(conversation.status)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                                <span className="truncate">
                                  Usimbaji fiche kutoka mwisho hadi mwisho
                                </span>
                              </div>

                              <p className="truncate text-xs text-muted-foreground">
                                {formatLastActivity(conversation.last_message_at)}
                              </p>
                            </div>
                          </button>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Futa ${getConversationLabel(conversation.id)} kwa wote`}
                                disabled={deletingId !== null}
                                onClick={() => setPendingDelete(conversation)}
                              >
                                {deleting ? (
                                  <RefreshCw className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Futa mazungumzo kwa wote
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open && deletingId === null) setPendingDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="size-5 text-destructive" />
                Futa mazungumzo kwa wote?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete && (
                  <>
                    Unakaribia kufuta kabisa{" "}
                    <span className="font-medium text-foreground">
                      {getConversationLabel(pendingDelete.id)}
                    </span>{" "}
                    kwa pande zote mbili. Mazungumzo na ujumbe wake huenda
                    visiweze kurejeshwa. Hatua hii haiwezi kutenduliwa.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingId !== null}>
                Ghairi
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingId !== null || pendingDelete === null}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
              >
                {deletingId !== null ? (
                  <>
                    <RefreshCw className="mr-2 size-4 animate-spin" />
                    Inafuta...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 size-4" />
                    Futa kwa wote
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
