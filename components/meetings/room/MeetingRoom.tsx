
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestMeetingTokenAction } from "@/lib/actions/meeting.actions";
import type { Meeting } from "@/lib/types/meeting";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useSpeakingParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  isTrackReference,
  useRoomContext,
} from "@livekit/components-react";

import "@livekit/components-styles";

import { RoomEvent, Track } from "livekit-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Loader2Icon,
  AlertCircleIcon,
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  MonitorIcon,
  UsersIcon,
  RadioIcon,
  MessageCircleIcon,
  SendIcon,
  XIcon,
  WifiIcon,
  ShieldCheckIcon,
  ClockIcon,
  HandIcon,
  CrownIcon,
  PresentationIcon,
  UserCheckIcon,
  RefreshCwIcon,
} from "lucide-react";

interface MeetingRoomProps {
  meetingId: string;
  meeting?: Meeting | null;
}

interface MeetingChatMessage {
  id: string;
  senderIdentity: string;
  senderName: string;
  message: string;
  timestamp: number;
  isOwn: boolean;
}

interface RaisedHand {
  identity: string;
  name: string;
  requestedAt: number;
}

type MeetingControlType =
  | "raise_hand"
  | "lower_hand"
  | "promote"
  | "demote";

interface MeetingControlMessage {
  type: MeetingControlType;
  targetIdentity?: string;
  timestamp: number;
}

interface ChatPayload {
  id: string;
  message: string;
  timestamp: number;
}

const CREDENTIAL_KEY = (id: string) =>
  `meeting-credential-${id}`;

const CHAT_TOPIC = "mlele-meeting-chat";
const MEETING_CONTROL_TOPIC = "mlele-meeting-control";

const MAX_CHAT_LENGTH = 2000;

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MW"
  );
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("sw-TZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function getMeetingRole(metadata?: string): string | null {
  if (!metadata) return null;

  try {
    const parsed: unknown = JSON.parse(metadata);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "meetingRole" in parsed &&
      typeof parsed.meetingRole === "string"
    ) {
      return parsed.meetingRole;
    }

    return null;
  } catch {
    return null;
  }
}

function isMeetingControlMessage(
  value: unknown,
): value is MeetingControlMessage {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  const validTypes: MeetingControlType[] = [
    "raise_hand",
    "lower_hand",
    "promote",
    "demote",
  ];

  return (
    typeof data.type === "string" &&
    validTypes.includes(data.type as MeetingControlType) &&
    typeof data.timestamp === "number" &&
    Number.isFinite(data.timestamp) &&
    (
      data.targetIdentity === undefined ||
      typeof data.targetIdentity === "string"
    )
  );
}

function isChatPayload(value: unknown): value is ChatPayload {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  return (
    typeof data.id === "string" &&
    typeof data.message === "string" &&
    data.message.trim().length > 0 &&
    data.message.length <= MAX_CHAT_LENGTH &&
    typeof data.timestamp === "number" &&
    Number.isFinite(data.timestamp)
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MEETING CHAT                              */
/* -------------------------------------------------------------------------- */

function MeetingChat({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const [messages, setMessages] = useState<MeetingChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef(new Set<string>());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: { identity: string; name?: string },
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== CHAT_TOPIC || !participant) return;

      try {
        const decoded = new TextDecoder().decode(payload);
        const data: unknown = JSON.parse(decoded);

        if (!isChatPayload(data)) return;

        if (processedMessageIds.current.has(data.id)) return;

        processedMessageIds.current.add(data.id);

        setMessages((previous) => [
          ...previous,
          {
            id: data.id,
            senderIdentity: participant.identity,
            senderName: participant.name?.trim() || "Mshiriki",
            message: data.message.trim(),
            timestamp: data.timestamp,
            isOwn: participant.identity === localParticipant.identity,
          },
        ]);
      } catch {
        // Ignore invalid or unrelated data packets.
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localParticipant.identity]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();

    if (!trimmed || sending) return;

    if (trimmed.length > MAX_CHAT_LENGTH) {
      toast.error("Ujumbe haupaswi kuzidi herufi 2,000.");
      return;
    }

    const payload: ChatPayload = {
      id: crypto.randomUUID(),
      message: trimmed,
      timestamp: Date.now(),
    };

    setSending(true);

    try {
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(payload)),
        {
          reliable: true,
          topic: CHAT_TOPIC,
        },
      );

      processedMessageIds.current.add(payload.id);

      setMessages((previous) => [
        ...previous,
        {
          id: payload.id,
          senderIdentity: localParticipant.identity,
          senderName: localParticipant.name?.trim() || "Mimi",
          message: trimmed,
          timestamp: payload.timestamp,
          isOwn: true,
        },
      ]);

      setMessage("");
    } catch {
      toast.error("Imeshindwa kutuma ujumbe. Jaribu tena.");
    } finally {
      setSending(false);
    }
  }, [message, sending, room, localParticipant]);

  if (!open) return null;

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <MessageCircleIcon className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Gumzo la Kikao
            </h2>
            <p className="text-xs text-slate-400">
              Ujumbe kwa washiriki wote
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Funga gumzo"
        >
          <XIcon className="size-5" />
        </Button>
      </div>

      <div className="flex items-start gap-2 border-b border-slate-800 bg-blue-500/5 px-4 py-3">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-blue-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          Gumzo hili linapatikana kwa washiriki waliounganishwa
          kwenye kikao hiki.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-900">
              <MessageCircleIcon className="size-6 text-slate-500" />
            </div>

            <p className="font-medium text-slate-300">
              Hakuna ujumbe bado
            </p>

            <p className="mt-1 max-w-52 text-xs leading-relaxed text-slate-500">
              Anza mazungumzo kwa kutuma ujumbe kwa washiriki wa kikao.
            </p>
          </div>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className={`flex gap-2 ${
                item.isOwn ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-slate-800 text-xs text-slate-200">
                  {initials(item.senderName)}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex max-w-[85%] flex-col ${
                  item.isOwn ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    {item.isOwn ? "Wewe" : item.senderName}
                  </span>

                  <span className="text-[10px] text-slate-500">
                    {formatTime(item.timestamp)}
                  </span>
                </div>

                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    item.isOwn
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm bg-slate-800 text-slate-200"
                  }`}
                >
                  {item.message}
                </div>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="border-t border-slate-800 p-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 p-2 focus-within:border-blue-500/70">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Andika ujumbe..."
            rows={1}
            maxLength={MAX_CHAT_LENGTH}
            className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sending}
            className="size-9 shrink-0 rounded-lg bg-blue-600 hover:bg-blue-500"
            aria-label="Tuma ujumbe"
          >
            {sending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-[10px] text-slate-500">
          Enter kutuma • Shift + Enter kwenda mstari mwingine
        </p>
      </form>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MEETING ROOM                                 */
/* -------------------------------------------------------------------------- */

function MeetingRoomInner({
  meeting,
}: {
  meeting: Meeting | null;
}) {
  const router = useRouter();
  const room = useRoomContext();

  const participants = useParticipants();
  const speaking = useSpeakingParticipants();

  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  const [chatOpen, setChatOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [raisedHand, setRaisedHand] = useState(false);

  const [promotedSpeakerIdentity, setPromotedSpeakerIdentity] =
    useState<string | null>(null);

  const [controlLoading, setControlLoading] = useState(false);

  const navigationStarted = useRef(false);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]);

  /* ---------------------------- Moderator role --------------------------- */

  const moderator = useMemo(
    () =>
      participants.find(
        (participant) =>
          getMeetingRole(participant.metadata) === "moderator",
      ) ?? null,
    [participants],
  );

  const isModerator =
    moderator?.identity === localParticipant.identity;

  const moderatorIdentity = moderator?.identity ?? null;

  /* ------------------------------ Stage logic ----------------------------- */

  const screenShareTrack = useMemo(
    () =>
      tracks.find(
        (track) =>
          track.publication.source === Track.Source.ScreenShare &&
          isTrackReference(track),
      ),
    [tracks],
  );

  const screenShareParticipant =
    screenShareTrack?.participant ?? null;

  const promotedSpeaker = useMemo(
    () =>
      promotedSpeakerIdentity
        ? participants.find(
            (participant) =>
              participant.identity === promotedSpeakerIdentity,
          ) ?? null
        : null,
    [participants, promotedSpeakerIdentity],
  );

  const activeSpeaker =
    screenShareParticipant ??
    promotedSpeaker ??
    speaking[0] ??
    null;

  const isScreenSharing = Boolean(screenShareParticipant);

  const activeCameraTrack = useMemo(
    () =>
      activeSpeaker
        ? tracks.find(
            (track) =>
              track.participant.identity === activeSpeaker.identity &&
              track.publication.source === Track.Source.Camera &&
              isTrackReference(track),
          )
        : undefined,
    [tracks, activeSpeaker],
  );

  const activeIsSpeaking = speaking.some(
    (participant) =>
      participant.identity === activeSpeaker?.identity,
  );

  const otherParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.identity !== activeSpeaker?.identity,
      ),
    [participants, activeSpeaker],
  );

  const activeName =
    activeSpeaker?.name?.trim() || "Mzungumzaji";

  /* --------------------------- Control messaging ------------------------- */

  const publishControlMessage = useCallback(
    async (message: MeetingControlMessage) => {
      await localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(message)),
        {
          reliable: true,
          topic: MEETING_CONTROL_TOPIC,
        },
      );
    },
    [localParticipant],
  );

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: { identity: string; name?: string },
      _kind?: unknown,
      topic?: string,
    ) => {
      if (
        topic !== MEETING_CONTROL_TOPIC ||
        !participant
      ) {
        return;
      }

      try {
        const data: unknown = JSON.parse(
          new TextDecoder().decode(payload),
        );

        if (!isMeetingControlMessage(data)) return;

        if (data.type === "raise_hand") {
          setRaisedHands((previous) => {
            const exists = previous.some(
              (item) => item.identity === participant.identity,
            );

            if (exists) return previous;

            return [
              ...previous,
              {
                identity: participant.identity,
                name: participant.name?.trim() || "Mshiriki",
                requestedAt: data.timestamp,
              },
            ].sort(
              (a, b) => a.requestedAt - b.requestedAt,
            );
          });

          return;
        }

        if (data.type === "lower_hand") {
          setRaisedHands((previous) =>
            previous.filter(
              (item) => item.identity !== participant.identity,
            ),
          );

          return;
        }

        // Stage-management messages must originate from the
        // participant identified as moderator by server-issued metadata.
        if (
          !moderatorIdentity ||
          participant.identity !== moderatorIdentity ||
          !data.targetIdentity
        ) {
          return;
        }

        if (data.type === "promote") {
          setPromotedSpeakerIdentity(data.targetIdentity);

          setRaisedHands((previous) =>
            previous.filter(
              (item) => item.identity !== data.targetIdentity,
            ),
          );
        }

        if (data.type === "demote") {
          setPromotedSpeakerIdentity((current) =>
            current === data.targetIdentity ? null : current,
          );
        }
      } catch {
        // Ignore malformed control messages.
      }
    };

    const handleParticipantDisconnected = (
      participant: { identity: string },
    ) => {
      setRaisedHands((previous) =>
        previous.filter(
          (item) => item.identity !== participant.identity,
        ),
      );

      setPromotedSpeakerIdentity((current) =>
        current === participant.identity ? null : current,
      );
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(
      RoomEvent.ParticipantDisconnected,
      handleParticipantDisconnected,
    );

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected,
      );
    };
  }, [room, moderatorIdentity]);

  /* ----------------------------- Raise hand ------------------------------- */

  const handleRaiseHand = useCallback(async () => {
    if (controlLoading) return;

    setControlLoading(true);

    const nextRaisedState = !raisedHand;

    try {
      await publishControlMessage({
        type: nextRaisedState ? "raise_hand" : "lower_hand",
        timestamp: Date.now(),
      });

      setRaisedHand(nextRaisedState);

      // Update the local queue immediately. DataReceived is not
      // guaranteed to echo a participant's own published packet.
      setRaisedHands((previous) => {
        if (nextRaisedState) {
          if (
            previous.some(
              (item) =>
                item.identity === localParticipant.identity,
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            {
              identity: localParticipant.identity,
              name: localParticipant.name?.trim() || "Mimi",
              requestedAt: Date.now(),
            },
          ].sort(
            (a, b) => a.requestedAt - b.requestedAt,
          );
        }

        return previous.filter(
          (item) =>
            item.identity !== localParticipant.identity,
        );
      });

      toast.success(
        nextRaisedState
          ? "Ombi lako la kuzungumza limetumwa."
          : "Umeshusha mkono wako.",
      );
    } catch {
      toast.error("Imeshindwa kutuma ombi. Jaribu tena.");
    } finally {
      setControlLoading(false);
    }
  }, [
    controlLoading,
    raisedHand,
    publishControlMessage,
    localParticipant,
  ]);

  /* --------------------------- Moderator actions ------------------------- */

  const handlePromote = useCallback(
    async (identity: string) => {
      if (!isModerator || controlLoading) return;

      setControlLoading(true);

      try {
        await publishControlMessage({
          type: "promote",
          targetIdentity: identity,
          timestamp: Date.now(),
        });

        setPromotedSpeakerIdentity(identity);

        setRaisedHands((previous) =>
          previous.filter(
            (item) => item.identity !== identity,
          ),
        );

        toast.success("Mshiriki ameruhusiwa kuzungumza.");
      } catch {
        toast.error("Imeshindwa kumruhusu mshiriki.");
      } finally {
        setControlLoading(false);
      }
    },
    [isModerator, controlLoading, publishControlMessage],
  );

  const handleDemote = useCallback(
    async (identity: string) => {
      if (!isModerator || controlLoading) return;

      setControlLoading(true);

      try {
        await publishControlMessage({
          type: "demote",
          targetIdentity: identity,
          timestamp: Date.now(),
        });

        setPromotedSpeakerIdentity((current) =>
          current === identity ? null : current,
        );

        toast.success(
          "Mshiriki amerudishwa kwenye orodha ya washiriki.",
        );
      } catch {
        toast.error("Imeshindwa kumaliza nafasi ya mzungumzaji.");
      } finally {
        setControlLoading(false);
      }
    },
    [isModerator, controlLoading, publishControlMessage],
  );

  /* ------------------------------ Media controls -------------------------- */

  const handleToggleMic = useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(
        !isMicrophoneEnabled,
      );
    } catch {
      toast.error("Imeshindwa kubadilisha mipangilio ya sauti.");
    }
  }, [localParticipant, isMicrophoneEnabled]);

  const handleToggleCam = useCallback(async () => {
    try {
      await localParticipant.setCameraEnabled(
        !isCameraEnabled,
      );
    } catch {
      toast.error("Imeshindwa kubadilisha mipangilio ya kamera.");
    }
  }, [localParticipant, isCameraEnabled]);

  const handleScreenShare = useCallback(async () => {
    try {
      await localParticipant.setScreenShareEnabled(
        !isScreenShareEnabled,
      );
    } catch {
      toast.error("Imeshindwa kushiriki skrini.");
    }
  }, [localParticipant, isScreenShareEnabled]);

  /* ------------------------------- Leave room ----------------------------- */

  const navigateAway = useCallback(() => {
    if (navigationStarted.current) return;

    navigationStarted.current = true;
    router.replace("/public");
  }, [router]);

  const handleLeave = useCallback(async () => {
    if (leaving) return;

    setLeaving(true);

    try {
      await room.disconnect();
    } catch {
      toast.error("Hitilafu imetokea wakati wa kuondoka kwenye kikao.");
    } finally {
      navigateAway();
    }
  }, [leaving, room, navigateAway]);

  const meetingDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("sw-TZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [],
  );

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex h-dvh min-h-150 flex-col overflow-hidden bg-[#080F1D] text-white">
      <TooltipProvider>
        {/* Header */}
        <header className="z-20 flex min-h-19 items-center justify-between border-b border-white/10 bg-[#0D1728] px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <RadioIcon className="size-5 text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                Halmashauri ya Wilaya ya Mlele
              </p>

              <h1 className="truncate text-sm font-semibold text-white md:text-base">
                {meeting?.title || "Chumba cha Mkutano"}
              </h1>
            </div>

            <Badge className="ml-1 shrink-0 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/10">
              <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {isModerator && (
              <Badge className="hidden border border-amber-400/20 bg-amber-500/10 text-amber-300 sm:flex">
                <CrownIcon className="mr-1 size-3.5" />
                Mwenyekiti
              </Badge>
            )}

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:flex">
              <UsersIcon className="size-4 text-slate-400" />
              <span className="text-sm font-medium">
                {participants.length}
              </span>
              <span className="text-xs text-slate-400">
                Washiriki
              </span>
            </div>

            <div className="hidden items-center gap-1.5 text-xs text-emerald-400 md:flex">
              <WifiIcon className="size-4" />
              Imeunganishwa
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLeave()}
              disabled={leaving}
              className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              {leaving ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <PhoneOffIcon className="mr-2 size-4" />
              )}
              <span className="hidden sm:inline">Ondoka</span>
            </Button>
          </div>
        </header>

        {/* Main workspace */}
        <main className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                    Mkutano Unaendelea
                  </h2>
                  <p className="mt-1 text-xs text-slate-400 md:text-sm">
                    Karibu kwenye kikao cha mtandaoni cha
                    Halmashauri ya Wilaya ya Mlele.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-slate-400">
                  <ClockIcon className="size-3.5" />
                  {meetingDateLabel}
                </div>
              </div>

              {/* Presenter stage */}
              <section className="relative flex min-h-75 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111E31] shadow-2xl md:min-h-100">
                <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
                  {isScreenSharing ? (
                    <Badge className="border border-blue-400/20 bg-blue-500/15 text-blue-300 hover:bg-blue-500/15">
                      <PresentationIcon className="mr-1.5 size-3.5" />
                      Anashiriki Skrini
                    </Badge>
                  ) : promotedSpeaker ? (
                    <Badge className="border border-amber-400/20 bg-amber-500/15 text-amber-300 hover:bg-amber-500/15">
                      <UserCheckIcon className="mr-1.5 size-3.5" />
                      Ameruhusiwa na Mwenyekiti
                    </Badge>
                  ) : activeSpeaker ? (
                    <Badge className="border border-emerald-400/20 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                      <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-emerald-400" />
                      ANAZUNGUMZA SASA
                    </Badge>
                  ) : null}
                </div>

                {activeSpeaker ? (
                  <>
                    <div className="relative flex min-h-62.5 flex-1 items-center justify-center overflow-hidden bg-[#15243A]">
                      {isScreenSharing && screenShareTrack ? (
                        <VideoTrack
                          trackRef={screenShareTrack}
                          className="absolute inset-0 size-full object-contain"
                        />
                      ) : activeCameraTrack &&
                        isTrackReference(activeCameraTrack) &&
                        activeSpeaker.isCameraEnabled ? (
                        <VideoTrack
                          trackRef={activeCameraTrack}
                          className="absolute inset-0 size-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-full bg-blue-500/10 p-2 ring-1 ring-blue-400/20">
                            <Avatar className="size-24 border-2 border-blue-400/30 md:size-32">
                              <AvatarFallback className="bg-[#263B59] text-3xl font-semibold text-blue-100 md:text-4xl">
                                {initials(activeName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <p className="text-sm text-slate-300">
                            Kamera haijawezeshwa
                          </p>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#080F1D]/90 via-transparent to-transparent" />
                    </div>

                    <div className="relative flex items-center justify-between gap-3 border-t border-white/10 bg-[#101C2D] px-4 py-4 md:px-6">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold md:text-lg">
                          {activeName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {isScreenSharing
                            ? "Anashiriki skrini na washiriki"
                            : promotedSpeaker
                              ? "Mzungumzaji aliyeruhusiwa na Mwenyekiti"
                              : "Mzungumzaji wa kikao"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {activeIsSpeaking && (
                          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Anazungumza
                          </div>
                        )}

                        {activeSpeaker.isMicrophoneEnabled ? (
                          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                            <MicIcon className="size-4" />
                          </div>
                        ) : (
                          <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                            <MicOffIcon className="size-4" />
                          </div>
                        )}

                        {isModerator &&
                          promotedSpeaker &&
                          !isScreenSharing && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={controlLoading}
                              onClick={() =>
                                void handleDemote(promotedSpeaker.identity)
                              }
                              className="border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                            >
                              Maliza Nafasi
                            </Button>
                          )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                    <div className="flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                      <UsersIcon className="size-9 text-slate-500" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-200">
                        Inasubiri mzungumzaji
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Mshiriki atakapoanza kuzungumza ataonekana hapa.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Raised hands queue */}
              <section className="space-y-3 rounded-2xl border border-white/10 bg-[#101C2D] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <HandIcon className="size-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-slate-200">
                        Maombi ya Kuzungumza
                      </h3>
                      <Badge className="border border-amber-400/20 bg-amber-500/10 text-amber-300">
                        {raisedHands.length}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {isModerator
                        ? "Chagua mshiriki wa kumpa nafasi ya kuzungumza."
                        : "Mwenyekiti ataona maombi yako na kuyashughulikia."}
                    </p>
                  </div>
                </div>

                {raisedHands.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
                    <p className="text-sm text-slate-500">
                      Hakuna maombi ya kuzungumza kwa sasa.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {raisedHands.map((hand, index) => (
                      <div
                        key={hand.identity}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-lg">
                            <HandIcon className="size-5 text-amber-400" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-200">
                              {hand.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Ombi la {index + 1} ·{" "}
                              {formatTime(hand.requestedAt)}
                            </p>
                          </div>
                        </div>

                        {isModerator && (
                          <Button
                            size="sm"
                            disabled={controlLoading}
                            onClick={() =>
                              void handlePromote(hand.identity)
                            }
                            className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <UserCheckIcon className="mr-1.5 size-3.5" />
                            Ruhusu
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Participant gallery */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      Washiriki wa Kikao
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {participants.length} wameunganishwa
                    </p>
                  </div>
                </div>

                {otherParticipants.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-4 py-6 text-center">
                    <p className="text-sm text-slate-500">
                      Hakuna washiriki wengine kwa sasa.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {otherParticipants.map((participant) => {
                      const cameraTrack = tracks.find(
                        (track) =>
                          track.participant.identity === participant.identity &&
                          track.publication.source === Track.Source.Camera &&
                          isTrackReference(track),
                      );

                      const participantScreenShare = tracks.find(
                        (track) =>
                          track.participant.identity === participant.identity &&
                          track.publication.source === Track.Source.ScreenShare &&
                          isTrackReference(track),
                      );

                      const participantName =
                        participant.name?.trim() || "Mshiriki";

                      const isSpeaking = speaking.some(
                        (item) =>
                          item.identity === participant.identity,
                      );

                      const hasRaisedHand = raisedHands.some(
                        (item) =>
                          item.identity === participant.identity,
                      );

                      const isPromoted =
                        promotedSpeakerIdentity === participant.identity;

                      return (
                        <div
                          key={participant.identity}
                          className={`group relative overflow-hidden rounded-xl border bg-[#111E31] transition-all ${
                            isPromoted
                              ? "border-amber-400/60 ring-1 ring-amber-400/20"
                              : isSpeaking
                                ? "border-emerald-400/60 ring-1 ring-emerald-400/20"
                                : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[#192940]">
                            {participantScreenShare ? (
                              <VideoTrack
                                trackRef={participantScreenShare}
                                className="size-full object-contain"
                              />
                            ) : cameraTrack &&
                              participant.isCameraEnabled ? (
                              <VideoTrack
                                trackRef={cameraTrack}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Avatar className="size-12 border border-white/10">
                                <AvatarFallback className="bg-[#2B405F] text-sm font-semibold text-slate-100">
                                  {initials(participantName)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            {hasRaisedHand && (
                              <div className="absolute right-2 top-2 rounded-lg border border-amber-400/30 bg-amber-500/20 p-1.5">
                                <HandIcon className="size-4 text-amber-300" />
                              </div>
                            )}

                            {isPromoted && (
                              <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-[9px] font-semibold text-slate-950">
                                Jukwaani
                              </div>
                            )}

                            {isSpeaking && (
                              <div className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-semibold text-white">
                                Anazungumza
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                            <span className="truncate text-xs font-medium text-slate-200">
                              {participantName}
                            </span>

                            <div className="flex shrink-0 items-center gap-1.5">
                              {participant.isMicrophoneEnabled ? (
                                <MicIcon className="size-3 text-emerald-400" />
                              ) : (
                                <MicOffIcon className="size-3 text-red-400" />
                              )}

                              {participant.isCameraEnabled ? (
                                <VideoIcon className="size-3 text-emerald-400" />
                              ) : (
                                <VideoOffIcon className="size-3 text-slate-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Chat sidebar */}
          <div
            className={`${
              chatOpen ? "flex" : "hidden"
            } fixed inset-0 z-30 flex-col bg-slate-950 md:relative md:inset-auto md:z-10 md:w-87.5 md:shrink-0`}
          >
            <MeetingChat
              open={chatOpen}
              onClose={() => setChatOpen(false)}
            />
          </div>
        </main>

        {/* Meeting controls */}
        <footer className="z-20 border-t border-white/10 bg-[#0D1728] px-3 py-3 md:px-6 md:py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => void handleToggleMic()}
                  className={`size-11 rounded-xl border ${
                    isMicrophoneEnabled
                      ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      : "border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  }`}
                  aria-label="Badilisha sauti"
                >
                  {isMicrophoneEnabled ? (
                    <MicIcon className="size-5" />
                  ) : (
                    <MicOffIcon className="size-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMicrophoneEnabled ? "Zima Sauti" : "Washa Sauti"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => void handleToggleCam()}
                  className={`size-11 rounded-xl border ${
                    isCameraEnabled
                      ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      : "border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  }`}
                  aria-label="Badilisha kamera"
                >
                  {isCameraEnabled ? (
                    <VideoIcon className="size-5" />
                  ) : (
                    <VideoOffIcon className="size-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCameraEnabled ? "Zima Kamera" : "Washa Kamera"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => void handleScreenShare()}
                  className={`size-11 rounded-xl border ${
                    isScreenShareEnabled
                      ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label="Shiriki skrini"
                >
                  <MonitorIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isScreenShareEnabled
                  ? "Acha Kushiriki Skrini"
                  : "Shiriki Skrini"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => void handleRaiseHand()}
                  disabled={controlLoading}
                  className={`relative size-11 rounded-xl border ${
                    raisedHand
                      ? "border-amber-400/40 bg-amber-500/20 text-amber-300"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label={raisedHand ? "Shusha mkono" : "Inua mkono"}
                >
                  {controlLoading ? (
                    <Loader2Icon className="size-5 animate-spin" />
                  ) : (
                    <HandIcon className="size-5" />
                  )}

                  {raisedHand && (
                    <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#0D1728] bg-amber-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {raisedHand ? "Shusha Mkono" : "Inua Mkono"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() =>
                    setChatOpen((previous) => !previous)
                  }
                  className={`relative size-11 rounded-xl border ${
                    chatOpen
                      ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label="Fungua gumzo"
                >
                  <MessageCircleIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gumzo la Kikao</TooltipContent>
            </Tooltip>

            <div className="mx-1 h-8 w-px bg-white/10" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => void handleLeave()}
                  disabled={leaving}
                  className="size-12 rounded-xl bg-red-600 text-white hover:bg-red-500"
                  aria-label="Ondoka kwenye mkutano"
                >
                  {leaving ? (
                    <Loader2Icon className="size-5 animate-spin" />
                  ) : (
                    <PhoneOffIcon className="size-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Ondoka Kwenye Mkutano
              </TooltipContent>
            </Tooltip>
          </div>

          <p className="mt-2 text-center text-[10px] text-slate-500">
            Mkutano wa Mtandaoni • Halmashauri ya Wilaya ya Mlele
          </p>
        </footer>
      </TooltipProvider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            MEETING ROOM ENTRY                              */
/* -------------------------------------------------------------------------- */

export default function MeetingRoom({
  meetingId,
  meeting: initialMeeting,
}: MeetingRoomProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const [attempt, setAttempt] = useState(0);

  const navigationStarted = useRef(false);

  const meeting = initialMeeting ?? null;

  const navigateHome = useCallback(() => {
    if (navigationStarted.current) return;

    navigationStarted.current = true;
    router.replace("/public");
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadMeetingToken() {
      setLoading(true);
      setError(null);
      setToken(null);
      setServerUrl(null);

      try {
        let rawToken: string | null = null;

        try {
          rawToken = localStorage.getItem(
            CREDENTIAL_KEY(meetingId),
          );
        } catch {
          throw new Error(
            "Imeshindikana kusoma hati ya usajili kutoka kwenye kifaa hiki.",
          );
        }

        if (!rawToken) {
          throw new Error(
            "Hakuna hati ya usajili. Tafadhali jisajili kwanza.",
          );
        }

        const result = await requestMeetingTokenAction({
          meetingId,
          rawToken,
        });

        if (cancelled) return;

        if (!result.success || !result.data?.token) {
          throw new Error(
            result.message ||
              "Imeshindwa kupata tokeni ya mkutano.",
          );
        }

        setToken(result.data.token);
        setServerUrl(result.data.serverUrl ?? null);
      } catch (caughtError) {
        if (cancelled) return;

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Hitilafu imetokea wakati wa kujiunga na mkutano.";

        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMeetingToken();

    return () => {
      cancelled = true;
    };
  }, [meetingId, attempt]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080F1D] px-4 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <Loader2Icon className="size-8 animate-spin text-blue-400" />
          </div>

          <h2 className="text-lg font-semibold">
            Inaandaa Chumba cha Mkutano
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Tafadhali subiri tunapokuunganisha...
          </p>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080F1D] p-4">
        <Card className="w-full max-w-md border-white/10 bg-[#111E31] text-white shadow-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertCircleIcon className="size-7" />
            </div>

            <CardTitle className="text-xl">
              Imeshindwa Kujiunga
            </CardTitle>

            <CardDescription className="text-slate-400">
              {error ||
                "Imeshindwa kuanzisha muunganisho wa mkutano."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <Button
              onClick={() => setAttempt((previous) => previous + 1)}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              <RefreshCwIcon className="mr-2 size-4" />
              Jaribu Tena
            </Button>

            <Button
              variant="outline"
              onClick={navigateHome}
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Rudi Nyumbani
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const url =
    serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  if (!url) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080F1D] p-4">
        <Card className="w-full max-w-md border-white/10 bg-[#111E31] text-white">
          <CardHeader>
            <CardTitle>Muunganisho Haupatikani</CardTitle>
            <CardDescription className="text-slate-400">
              Anwani ya seva ya mkutano haijasanidiwa.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={navigateHome}
              className="w-full"
            >
              Rudi Nyumbani
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={url}
      onDisconnected={navigateHome}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <MeetingRoomInner meeting={meeting} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
