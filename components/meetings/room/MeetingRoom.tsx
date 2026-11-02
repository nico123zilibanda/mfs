"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestMeetingTokenAction } from "@/lib/actions/meeting.actions";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  isTrackReference,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useSpeakingParticipants,
  useTracks,
  type TrackReference,
} from "@livekit/components-react";

import "@livekit/components-styles";

import {
  ConnectionState,
  RoomEvent,
  Track,
  type Participant,
} from "livekit-client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  CrownIcon,
  HandIcon,
  Loader2Icon,
  MaximizeIcon,
  MessageCircleIcon,
  MicIcon,
  MinimizeIcon,
  MicOffIcon,
  MonitorIcon,
  MonitorOffIcon,
  PhoneOffIcon,
  PresentationIcon,
  RadioIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
  VideoIcon,
  VideoOffIcon,
  WifiIcon,
  WifiOffIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                         */
/* -------------------------------------------------------------------------- */

interface MeetingRoomProps {
  meetingId: string;
  meeting?: Meeting | null;
  /** Where to go after leaving the room. */
  exitHref?: string;
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

type MeetingControlType = "raise_hand" | "lower_hand" | "promote" | "demote";

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

type DataSender = { identity: string; name?: string };
type SidePanelId = "people" | "chat";
type StageMode = "screen" | "promoted" | "speaking" | "chair" | "default";

const CREDENTIAL_KEY = (id: string) => `meeting-credential-${id}`;

const CHAT_TOPIC = "mlele-meeting-chat";
const MEETING_CONTROL_TOPIC = "mlele-meeting-control";
const MAX_CHAT_LENGTH = 2000;
const CONTROL_TYPES: MeetingControlType[] = [
  "raise_hand",
  "lower_hand",
  "promote",
  "demote",
];

const timeFormatter = new Intl.DateTimeFormat("sw-TZ", {
  hour: "2-digit",
  minute: "2-digit",
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

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
  return timeFormatter.format(timestamp);
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function displayName(participant: Participant | null | undefined, fallback = "Mshiriki") {
  return participant?.name?.trim() || fallback;
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

function isMeetingControlMessage(value: unknown): value is MeetingControlMessage {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.type === "string" &&
    CONTROL_TYPES.includes(data.type as MeetingControlType) &&
    typeof data.timestamp === "number" &&
    Number.isFinite(data.timestamp) &&
    (data.targetIdentity === undefined || typeof data.targetIdentity === "string")
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

function addHand(list: RaisedHand[], hand: RaisedHand) {
  if (list.some((item) => item.identity === hand.identity)) return list;
  return [...list, hand].sort((a, b) => a.requestedAt - b.requestedAt);
}

function removeHand(list: RaisedHand[], identity: string) {
  return list.filter((item) => item.identity !== identity);
}

function encodeJson(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value));
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Seconds since the user entered the room. */
function useElapsedSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
  return seconds;
}

/** True only on browsers that can capture a screen (not most phones). */
function useScreenShareSupported() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(
      typeof navigator !== "undefined" &&
        typeof navigator.mediaDevices?.getDisplayMedia === "function",
    );
  }, []);
  return supported;
}

/** Chat state lives here (not in the panel) so unread counts work while closed. */
function useMeetingChat(panelOpen: boolean) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const localIdentity = localParticipant.identity;

  const [messages, setMessages] = useState<MeetingChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);

  const seenIds = useRef(new Set<string>());
  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;

  useEffect(() => {
    if (panelOpen) setUnread(0);
  }, [panelOpen]);

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: DataSender,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== CHAT_TOPIC || !participant) return;

      try {
        const data: unknown = JSON.parse(new TextDecoder().decode(payload));
        if (!isChatPayload(data) || seenIds.current.has(data.id)) return;
        seenIds.current.add(data.id);

        const isOwn = participant.identity === localIdentity;

        setMessages((previous) => [
          ...previous,
          {
            id: data.id,
            senderIdentity: participant.identity,
            senderName: participant.name?.trim() || "Mshiriki",
            message: data.message.trim(),
            timestamp: data.timestamp,
            isOwn,
          },
        ]);

        if (!isOwn && !panelOpenRef.current) setUnread((count) => count + 1);
      } catch {
        // Ignore invalid or unrelated data packets.
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localIdentity]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return false;

      if (trimmed.length > MAX_CHAT_LENGTH) {
        toast.error("Ujumbe haupaswi kuzidi herufi 2,000.");
        return false;
      }

      const payload: ChatPayload = {
        id: crypto.randomUUID(),
        message: trimmed,
        timestamp: Date.now(),
      };

      setSending(true);
      try {
        await room.localParticipant.publishData(encodeJson(payload), {
          reliable: true,
          topic: CHAT_TOPIC,
        });

        seenIds.current.add(payload.id);
        setMessages((previous) => [
          ...previous,
          {
            id: payload.id,
            senderIdentity: localIdentity,
            senderName: localParticipant.name?.trim() || "Mimi",
            message: trimmed,
            timestamp: payload.timestamp,
            isOwn: true,
          },
        ]);
        return true;
      } catch {
        toast.error("Imeshindwa kutuma ujumbe. Jaribu tena.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [room, sending, localIdentity, localParticipant.name],
  );

  return { messages, unread, sending, sendMessage };
}

/** Raise hand / promote / demote, synced over a LiveKit data topic. */
function useStageControls(moderatorIdentity: string | null, isModerator: boolean) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const localIdentity = localParticipant.identity;

  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [promotedIdentity, setPromotedIdentity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Derived, so it can never drift from the queue (e.g. after being promoted).
  const isHandRaised = raisedHands.some((hand) => hand.identity === localIdentity);

  const publish = useCallback(
    (type: MeetingControlType, targetIdentity?: string) => {
      const message: MeetingControlMessage = {
        type,
        targetIdentity,
        timestamp: Date.now(),
      };
      return localParticipant.publishData(encodeJson(message), {
        reliable: true,
        topic: MEETING_CONTROL_TOPIC,
      });
    },
    [localParticipant],
  );

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: DataSender,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== MEETING_CONTROL_TOPIC || !participant) return;

      try {
        const data: unknown = JSON.parse(new TextDecoder().decode(payload));
        if (!isMeetingControlMessage(data)) return;

        if (data.type === "raise_hand") {
          setRaisedHands((previous) =>
            addHand(previous, {
              identity: participant.identity,
              name: participant.name?.trim() || "Mshiriki",
              requestedAt: data.timestamp,
            }),
          );
          return;
        }

        if (data.type === "lower_hand") {
          setRaisedHands((previous) => removeHand(previous, participant.identity));
          return;
        }

        // Stage messages are only trusted from the server-designated moderator.
        const target = data.targetIdentity;
        if (!moderatorIdentity || participant.identity !== moderatorIdentity || !target) {
          return;
        }

        if (data.type === "promote") {
          setPromotedIdentity(target);
          setRaisedHands((previous) => removeHand(previous, target));
          if (target === localIdentity) {
            toast.success("Mwenyekiti amekuruhusu kuzungumza. Washa sauti yako.");
          }
        }

        if (data.type === "demote") {
          setPromotedIdentity((current) => (current === target ? null : current));
          if (target === localIdentity) {
            toast.info("Nafasi yako ya kuzungumza imekwisha.");
          }
        }
      } catch {
        // Ignore malformed control messages.
      }
    };

    const handleParticipantDisconnected = (participant: { identity: string }) => {
      setRaisedHands((previous) => removeHand(previous, participant.identity));
      setPromotedIdentity((current) =>
        current === participant.identity ? null : current,
      );
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, moderatorIdentity, localIdentity]);

  const toggleHand = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const next = !isHandRaised;

    try {
      await publish(next ? "raise_hand" : "lower_hand");

      // DataReceived does not echo our own packets, so update locally.
      setRaisedHands((previous) =>
        next
          ? addHand(previous, {
              identity: localIdentity,
              name: localParticipant.name?.trim() || "Mimi",
              requestedAt: Date.now(),
            })
          : removeHand(previous, localIdentity),
      );

      toast.success(
        next ? "Ombi lako la kuzungumza limetumwa." : "Umeshusha mkono wako.",
      );
    } catch {
      toast.error("Imeshindwa kutuma ombi. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  }, [loading, isHandRaised, publish, localIdentity, localParticipant.name]);

  const promote = useCallback(
    async (identity: string) => {
      if (!isModerator || loading) return;
      setLoading(true);
      try {
        await publish("promote", identity);
        setPromotedIdentity(identity);
        setRaisedHands((previous) => removeHand(previous, identity));
        toast.success("Mshiriki ameruhusiwa kuzungumza.");
      } catch {
        toast.error("Imeshindwa kumruhusu mshiriki.");
      } finally {
        setLoading(false);
      }
    },
    [isModerator, loading, publish],
  );

  const demote = useCallback(
    async (identity: string) => {
      if (!isModerator || loading) return;
      setLoading(true);
      try {
        await publish("demote", identity);
        setPromotedIdentity((current) => (current === identity ? null : current));
        toast.success("Mshiriki amerudishwa kwenye orodha ya washiriki.");
      } catch {
        toast.error("Imeshindwa kumaliza nafasi ya mzungumzaji.");
      } finally {
        setLoading(false);
      }
    },
    [isModerator, loading, publish],
  );

  return { raisedHands, promotedIdentity, isHandRaised, loading, toggleHand, promote, demote };
}

/* -------------------------------------------------------------------------- */
/*  Small UI building blocks                                                  */
/* -------------------------------------------------------------------------- */

function MicStatus({ on, className }: { on: boolean; className?: string }) {
  return on ? (
    <MicIcon className={cn("size-3.5 text-emerald-400", className)} />
  ) : (
    <MicOffIcon className={cn("size-3.5 text-red-400", className)} />
  );
}

function CamStatus({ on, className }: { on: boolean; className?: string }) {
  return on ? (
    <VideoIcon className={cn("size-3.5 text-emerald-400", className)} />
  ) : (
    <VideoOffIcon className={cn("size-3.5 text-slate-500", className)} />
  );
}

type ControlTone = "default" | "off" | "active" | "amber";

const CONTROL_TONES: Record<ControlTone, string> = {
  default: "border-white/10 bg-white/10 text-white hover:bg-white/20",
  off: "border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/25",
  active: "border-blue-400/40 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30",
  amber: "border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30",
};

function ControlButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  pressed,
  disabled,
  loading,
  badge,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: ControlTone;
  pressed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          onClick={onClick}
          disabled={disabled || loading}
          aria-label={label}
          aria-pressed={pressed}
          className={cn(
            "relative size-11 shrink-0 flex-col gap-1 rounded-xl border p-0 md:h-14 md:w-[4.5rem]",
            CONTROL_TONES[tone],
            className,
          )}
        >
          {loading ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <Icon className="size-5" />
          )}
          <span className="hidden text-[11px] font-medium leading-none md:block">
            {label}
          </span>
          {badge ? (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-[#0D1728] bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage (main speaker / screen share)                                       */
/* -------------------------------------------------------------------------- */

const STAGE_BADGES: Record<StageMode, { label: string; className: string; icon?: LucideIcon } | null> = {
  screen: {
    label: "Anashiriki skrini",
    className: "border-blue-400/30 bg-blue-500/20 text-blue-200",
    icon: PresentationIcon,
  },
  promoted: {
    label: "Ameruhusiwa na Mwenyekiti",
    className: "border-amber-400/30 bg-amber-500/20 text-amber-200",
    icon: UserCheckIcon,
  },
  speaking: {
    label: "Anazungumza sasa",
    className: "border-emerald-400/30 bg-emerald-500/20 text-emerald-300",
  },
  chair: {
    label: "Mwenyekiti",
    className: "border-amber-400/30 bg-amber-500/20 text-amber-200",
    icon: CrownIcon,
  },
  default: null,
};

const STAGE_SUBTITLES: Record<StageMode, string> = {
  screen: "Anashiriki skrini na washiriki",
  promoted: "Mzungumzaji aliyeruhusiwa na Mwenyekiti",
  speaking: "Mzungumzaji wa sasa",
  chair: "Mwenyekiti wa kikao",
  default: "Mshiriki wa kikao",
};

function Stage({
  participant,
  mode,
  videoTrack,
  isScreen,
  isLocalScreenShare,
  isSpeaking,
  canDemote,
  controlLoading,
  onDemote,
  onStopShare,
}: {
  participant: Participant | null;
  mode: StageMode;
  videoTrack?: TrackReference;
  isScreen: boolean;
  isLocalScreenShare: boolean;
  isSpeaking: boolean;
  canDemote: boolean;
  controlLoading: boolean;
  onDemote: () => void;
  onStopShare: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === sectionRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Leave fullscreen automatically when the screen share ends.
  useEffect(() => {
    if (!isScreen && document.fullscreenElement === sectionRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [isScreen]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await sectionRef.current?.requestFullscreen();
    } catch {
      toast.error("Imeshindwa kufungua skrini nzima.");
    }
  }, []);

  const badge = STAGE_BADGES[mode];
  const name = displayName(participant, "Mzungumzaji");
  const BadgeIcon = badge?.icon;

  if (!participant) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#111E31] px-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <UsersIcon className="size-9 text-slate-500" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-200">Inasubiri washiriki</h3>
          <p className="mt-1 text-sm text-slate-500">
            Washiriki watakapojiunga wataonekana hapa.
          </p>
        </div>
      </section>
    );
  }

  const showVideo = Boolean(videoTrack) && (isScreen || participant.isCameraEnabled);

  const badgeEl = badge ? (
    <Badge className={cn("gap-1.5 border px-2.5 py-1 backdrop-blur", badge.className)}>
      {BadgeIcon ? (
        <BadgeIcon className="size-3.5" />
      ) : (
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
      )}
      {badge.label}
    </Badge>
  ) : null;

  // Camera mode: info floats over the video.
  // Screen mode: info sits in its own bar so it never covers shared content.
  const info = (
    <div
      className={cn(
        "flex justify-between gap-3",
        isScreen
          ? "shrink-0 items-center border-t border-white/10 bg-[#101C2D] px-3 py-2.5 md:px-5"
          : "absolute inset-x-0 bottom-0 z-10 items-end p-3 md:p-5",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold",
            isScreen ? "text-sm md:text-base" : "text-base drop-shadow md:text-xl",
          )}
        >
          {name}
          {participant.isLocal && (
            <span className="ml-2 text-sm font-normal text-slate-300">(Wewe)</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-slate-300 md:text-sm">{STAGE_SUBTITLES[mode]}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isScreen && badgeEl && <div className="hidden sm:block">{badgeEl}</div>}
        {canDemote && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={controlLoading}
            onClick={onDemote}
            className="border-amber-400/40 bg-amber-500/15 text-amber-200 backdrop-blur hover:bg-amber-500/25 hover:text-amber-100"
          >
            Maliza nafasi
          </Button>
        )}
        <div
          className={cn(
            "rounded-lg p-2 backdrop-blur",
            participant.isMicrophoneEnabled ? "bg-emerald-500/20" : "bg-red-500/20",
          )}
        >
          <MicStatus on={participant.isMicrophoneEnabled} className="size-4" />
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-[#0F1A2C] shadow-2xl transition-shadow",
        isFullscreen && "rounded-none border-0",
        isSpeaking && !isScreen ? "border-emerald-400/50 shadow-emerald-500/10" : "border-white/10",
      )}
    >
      <div className={cn("relative min-h-0 flex-1", isScreen ? "bg-black" : "bg-[#15243A]")}>
        <div className="absolute inset-0 flex items-center justify-center">
          {isLocalScreenShare ? (
            // Small preview so the presenter can confirm the share is working,
            // without the shared screen filling the stage (mirror effect).
            <div className="flex size-full flex-col items-center gap-3 bg-[#15243A] p-3 md:p-5">
              <div className="relative flex min-h-0 w-full max-w-xl flex-1 items-center justify-center overflow-hidden rounded-xl border border-blue-400/30 bg-black">
                {videoTrack ? (
                  <VideoTrack
                    trackRef={videoTrack}
                    className="size-full object-contain"
                  />
                ) : (
                  <Loader2Icon className="size-6 animate-spin text-blue-300" />
                )}
                <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-semibold">
                  Hakiki ya skrini yako
                </span>
              </div>

              <div className="shrink-0 text-center">
                <p className="text-base font-semibold md:text-lg">Unashiriki skrini yako</p>
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-400 md:text-sm">
                  Washiriki wote wanaona skrini yako. Shiriki dirisha au kichupo badala ya
                  skrini nzima ili kuepuka kuona skrini ndani ya skrini.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={onStopShare}
                className="shrink-0 gap-2 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
              >
                <MonitorOffIcon className="size-4" />
                Acha kushiriki
              </Button>
            </div>
          ) : showVideo && videoTrack ? (
            <VideoTrack
              trackRef={videoTrack}
              className={cn(
                "absolute inset-0 size-full object-contain",
                !isScreen && participant.isLocal && "-scale-x-100",
              )}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "rounded-full p-2 ring-2 transition-colors",
                  isSpeaking ? "ring-emerald-400/60" : "ring-blue-400/20",
                )}
              >
                <Avatar className="size-24 border-2 border-blue-400/30 md:size-32">
                  <AvatarFallback className="bg-[#263B59] text-3xl font-semibold text-blue-100 md:text-4xl">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm text-slate-400">Kamera imezimwa</p>
            </div>
          )}
        </div>

        {!isScreen && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#080F1D]/90 to-transparent" />
            {badgeEl && (
              <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">{badgeEl}</div>
            )}
            {info}
          </>
        )}

        {isScreen && !isLocalScreenShare && canFullscreen && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Toka kwenye skrini nzima" : "Skrini nzima"}
            className="absolute right-3 top-3 z-10 gap-1.5 border border-white/15 bg-black/60 text-white backdrop-blur hover:bg-black/80"
          >
            {isFullscreen ? <MinimizeIcon className="size-4" /> : <MaximizeIcon className="size-4" />}
            <span className="hidden sm:inline">
              {isFullscreen ? "Toka" : "Skrini nzima"}
            </span>
          </Button>
        )}
      </div>

      {isScreen && info}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filmstrip tile                                                            */
/* -------------------------------------------------------------------------- */

function ParticipantTile({
  participant,
  cameraTrack,
  speaking,
  handRaised,
  promoted,
  isChair,
}: {
  participant: Participant;
  cameraTrack?: TrackReference;
  speaking: boolean;
  handRaised: boolean;
  promoted: boolean;
  isChair: boolean;
}) {
  const name = displayName(participant);

  return (
    <div
      className={cn(
        "relative aspect-video w-36 shrink-0 snap-start overflow-hidden rounded-xl border bg-[#192940] transition-colors sm:w-44 lg:w-52",
        promoted
          ? "border-amber-400/60 ring-1 ring-amber-400/30"
          : speaking
            ? "border-emerald-400/60 ring-1 ring-emerald-400/30"
            : "border-white/10",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {cameraTrack && participant.isCameraEnabled ? (
          <VideoTrack
            trackRef={cameraTrack}
            className={cn("size-full object-cover", participant.isLocal && "-scale-x-100")}
          />
        ) : (
          <Avatar className="size-12 border border-white/10 lg:size-14">
            <AvatarFallback className="bg-[#2B405F] text-sm font-semibold text-slate-100">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="flex min-w-0 items-center gap-1 text-xs font-medium text-white">
          {isChair && <CrownIcon className="size-3 shrink-0 text-amber-300" />}
          <span className="truncate">
            {name}
            {participant.isLocal && " (Wewe)"}
          </span>
        </span>
        <MicStatus on={participant.isMicrophoneEnabled} className="size-3 shrink-0" />
      </div>

      {handRaised && (
        <div className="absolute right-1.5 top-1.5 rounded-md border border-amber-400/40 bg-amber-500/30 p-1">
          <HandIcon className="size-3.5 text-amber-200" />
        </div>
      )}
      {promoted && (
        <div className="absolute left-1.5 top-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
          Jukwaani
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Side panel: people + chat                                                 */
/* -------------------------------------------------------------------------- */

function PeoplePanel({
  participants,
  localIdentity,
  moderatorIdentity,
  speakingIds,
  raisedHands,
  promotedIdentity,
  isModerator,
  controlLoading,
  onPromote,
  onDemote,
}: {
  participants: Participant[];
  localIdentity: string;
  moderatorIdentity: string | null;
  speakingIds: Set<string>;
  raisedHands: RaisedHand[];
  promotedIdentity: string | null;
  isModerator: boolean;
  controlLoading: boolean;
  onPromote: (identity: string) => void;
  onDemote: (identity: string) => void;
}) {
  const handIdentities = useMemo(
    () => new Set(raisedHands.map((hand) => hand.identity)),
    [raisedHands],
  );

  const sorted = useMemo(
    () =>
      [...participants].sort((a, b) => {
        const rank = (p: Participant) =>
          p.identity === moderatorIdentity ? 0 : handIdentities.has(p.identity) ? 1 : 2;
        const diff = rank(a) - rank(b);
        return diff !== 0 ? diff : displayName(a).localeCompare(displayName(b));
      }),
    [participants, moderatorIdentity, handIdentities],
  );

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
      {/* Raised hands */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HandIcon className="size-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Maombi ya kuzungumza</h3>
          <Badge className="border border-amber-400/20 bg-amber-500/10 text-amber-300">
            {raisedHands.length}
          </Badge>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          {isModerator
            ? "Chagua mshiriki wa kumpa nafasi ya kuzungumza."
            : "Mwenyekiti ataona maombi yako na kuyashughulikia."}
        </p>

        {raisedHands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-slate-500">
            Hakuna maombi kwa sasa.
          </div>
        ) : (
          <ul className="space-y-2">
            {raisedHands.map((hand, index) => (
              <li
                key={hand.identity}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-amber-500/5 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-xs font-bold text-amber-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{hand.name}</p>
                    <p className="text-[11px] text-slate-500">{formatTime(hand.requestedAt)}</p>
                  </div>
                </div>
                {isModerator && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={controlLoading}
                    onClick={() => onPromote(hand.identity)}
                    className="shrink-0 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <UserCheckIcon className="size-3.5" />
                    Ruhusu
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Everyone */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Washiriki</h3>
          <Badge className="border border-blue-400/20 bg-blue-500/10 text-blue-300">
            {participants.length}
          </Badge>
        </div>

        <ul className="space-y-1">
          {sorted.map((participant) => {
            const name = displayName(participant);
            const isChair = participant.identity === moderatorIdentity;
            const isPromoted = participant.identity === promotedIdentity;
            const speaking = speakingIds.has(participant.identity);

            return (
              <li
                key={participant.identity}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    className={cn(
                      "size-9 shrink-0 ring-2 ring-offset-2 ring-offset-[#0B1424] transition-all",
                      speaking ? "ring-emerald-400" : "ring-transparent",
                    )}
                  >
                    <AvatarFallback className="bg-[#2B405F] text-xs font-semibold text-slate-100">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {name}
                      {participant.identity === localIdentity && (
                        <span className="ml-1.5 text-xs font-normal text-slate-400">(Wewe)</span>
                      )}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {isChair && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                          <CrownIcon className="size-3" /> Mwenyekiti
                        </span>
                      )}
                      {isPromoted && (
                        <span className="text-[11px] text-amber-300">Jukwaani</span>
                      )}
                      {handIdentities.has(participant.identity) && (
                        <HandIcon className="size-3 text-amber-300" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isModerator && isPromoted && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={controlLoading}
                      onClick={() => onDemote(participant.identity)}
                      className="h-7 border-amber-400/30 bg-amber-500/10 px-2 text-xs text-amber-200 hover:bg-amber-500/20"
                    >
                      Maliza
                    </Button>
                  )}
                  <MicStatus on={participant.isMicrophoneEnabled} />
                  <CamStatus on={participant.isCameraEnabled} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ChatPanel({
  messages,
  sending,
  onSend,
}: {
  messages: MeetingChatMessage[];
  sending: boolean;
  onSend: (text: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function submit() {
    if (!draft.trim() || sending) return;
    if (await onSend(draft)) setDraft("");
  }

  return (
    <>
      <div className="flex items-start gap-2 border-b border-white/10 bg-blue-500/5 px-4 py-3">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-blue-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          Ujumbe unaonekana kwa washiriki waliounganishwa sasa tu. Haupo kwa watakaojiunga baadaye.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/5">
              <MessageCircleIcon className="size-6 text-slate-500" />
            </div>
            <p className="font-medium text-slate-300">Hakuna ujumbe bado</p>
            <p className="mt-1 max-w-56 text-xs leading-relaxed text-slate-500">
              Anza mazungumzo kwa kutuma ujumbe kwa washiriki wa kikao.
            </p>
          </div>
        ) : (
          messages.map((item, index) => {
            const previous = messages[index - 1];
            const grouped =
              previous &&
              previous.senderIdentity === item.senderIdentity &&
              item.timestamp - previous.timestamp < 120_000;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col",
                  item.isOwn ? "items-end" : "items-start",
                  grouped ? "mt-0.5" : "mt-3",
                )}
              >
                {!grouped && (
                  <div className="mb-1 flex items-center gap-2 px-1">
                    <span className="text-xs font-medium text-slate-300">
                      {item.isOwn ? "Wewe" : item.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500">{formatTime(item.timestamp)}</span>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    item.isOwn
                      ? "rounded-tr-md bg-blue-600 text-white"
                      : "rounded-tl-md bg-slate-800 text-slate-100",
                  )}
                >
                  {item.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 p-2 focus-within:border-blue-500/70">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Andika ujumbe..."
            aria-label="Andika ujumbe"
            rows={1}
            maxLength={MAX_CHAT_LENGTH}
            className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-base text-white outline-none placeholder:text-slate-500 md:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!draft.trim() || sending}
            className="size-9 shrink-0 rounded-lg bg-blue-600 hover:bg-blue-500"
            aria-label="Tuma ujumbe"
          >
            {sending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Enter kutuma, Shift + Enter mstari mpya</span>
          {draft.length > MAX_CHAT_LENGTH - 200 && (
            <span className="tabular-nums">
              {draft.length}/{MAX_CHAT_LENGTH}
            </span>
          )}
        </div>
      </form>
    </>
  );
}

function SidePanel({
  active,
  onChange,
  onClose,
  handCount,
  unread,
  participantCount,
  children,
}: {
  active: SidePanelId;
  onChange: (panel: SidePanelId) => void;
  onClose: () => void;
  handCount: number;
  unread: number;
  participantCount: number;
  children: ReactNode;
}) {
  const tabs: { id: SidePanelId; label: string; icon: LucideIcon; count?: number }[] = [
    { id: "people", label: "Washiriki", icon: UsersIcon, count: handCount || undefined },
    { id: "chat", label: "Gumzo", icon: MessageCircleIcon, count: unread || undefined },
  ];

  return (
    // Full-screen sheet on phones/tablets, docked column on large screens.
    <aside
      aria-label="Paneli ya kikao"
      className="fixed inset-0 z-40 flex flex-col bg-[#0B1424] lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:border-l lg:border-white/10"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
        <div role="tablist" className="flex gap-1 rounded-xl bg-white/5 p-1">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              onClick={() => onChange(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active === id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
              {id === "people" && (
                <span className="text-xs opacity-70 tabular-nums">{participantCount}</span>
              )}
              {count ? (
                <span className="min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Funga paneli"
        >
          <XIcon className="size-5" />
        </Button>
      </div>
      {children}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header & dialogs                                                          */
/* -------------------------------------------------------------------------- */

function ConnectionIndicator({ state }: { state: ConnectionState }) {
  const connected = state === ConnectionState.Connected;
  const Icon = connected ? WifiIcon : WifiOffIcon;
  return (
    <div
      className={cn(
        "hidden items-center gap-1.5 text-xs md:flex",
        connected ? "text-emerald-400" : "text-amber-400",
      )}
    >
      <Icon className="size-4" />
      {connected ? "Imeunganishwa" : "Inaunganisha..."}
    </div>
  );
}

function LeaveDialog({
  open,
  leaving,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  leaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !leaving && onOpenChange(next)}>
      <DialogContent className="w-[calc(100%-1.5rem)] rounded-2xl border-white/10 bg-[#111E31] text-white sm:max-w-md">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <PhoneOffIcon className="size-6" />
          </div>
          <DialogTitle className="text-xl">Ondoka kwenye mkutano?</DialogTitle>
          <DialogDescription className="leading-6 text-slate-400">
            Utaondoka kwenye chumba cha mkutano. Mkutano ukiendelea, unaweza kujiunga tena
            kupitia ukurasa wa mikutano.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={leaving}
            onClick={() => onOpenChange(false)}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            Baki kwenye mkutano
          </Button>
          <Button
            type="button"
            disabled={leaving}
            onClick={onConfirm}
            className="gap-2 bg-red-600 text-white hover:bg-red-500"
          >
            {leaving ? <Loader2Icon className="size-4 animate-spin" /> : <PhoneOffIcon className="size-4" />}
            Ondoka
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Room (inside <LiveKitRoom>)                                               */
/* -------------------------------------------------------------------------- */

function MeetingRoomInner({
  meeting,
  onExit,
}: {
  meeting: Meeting | null;
  onExit: () => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const speaking = useSpeakingParticipants();
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  const elapsed = useElapsedSeconds();
  const screenShareSupported = useScreenShareSupported();

  const [panel, setPanel] = useState<SidePanelId | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [busyControl, setBusyControl] = useState<"mic" | "cam" | "screen" | null>(null);
  const [lastSpeakerId, setLastSpeakerId] = useState<string | null>(null);

  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  const localIdentity = localParticipant.identity;

  /* ------------------------------ Moderator ------------------------------ */

  const moderator = useMemo(
    () => participants.find((p) => getMeetingRole(p.metadata) === "moderator") ?? null,
    [participants],
  );
  const moderatorIdentity = moderator?.identity ?? null;
  const isModerator = moderatorIdentity === localIdentity;

  /* ------------------------------ Controls ------------------------------- */

  const stageControls = useStageControls(moderatorIdentity, isModerator);
  const { raisedHands, promotedIdentity, isHandRaised } = stageControls;

  const chat = useMeetingChat(panel === "chat");

  /* ----------------------------- Track lookup ---------------------------- */

  const { cameraByIdentity, screenTracks } = useMemo(() => {
    const camera = new Map<string, TrackReference>();
    const screens: TrackReference[] = [];
    for (const track of tracks) {
      if (!isTrackReference(track)) continue;
      if (track.publication.source === Track.Source.ScreenShare) screens.push(track);
      else if (track.publication.source === Track.Source.Camera) {
        camera.set(track.participant.identity, track);
      }
    }
    return { cameraByIdentity: camera, screenTracks: screens };
  }, [tracks]);

  /* ------------------------------ Stage logic ---------------------------- */

  const participantsByIdentity = useMemo(
    () => new Map(participants.map((p) => [p.identity, p])),
    [participants],
  );
  const speakingIds = useMemo(
    () => new Set(speaking.map((p) => p.identity)),
    [speaking],
  );

  const currentSpeakerId = speaking[0]?.identity ?? null;
  useEffect(() => {
    if (currentSpeakerId) setLastSpeakerId(currentSpeakerId);
  }, [currentSpeakerId]);

  const stage = useMemo(() => {
    // If someone else is presenting, show them rather than our own share.
    const screenTrack =
      screenTracks.find((track) => !track.participant.isLocal) ?? screenTracks[0];
    if (screenTrack) {
      return { participant: screenTrack.participant as Participant, mode: "screen" as StageMode, screenTrack };
    }

    const promoted = promotedIdentity ? participantsByIdentity.get(promotedIdentity) : undefined;
    if (promoted) return { participant: promoted, mode: "promoted" as StageMode, screenTrack: undefined };

    const current = currentSpeakerId ? participantsByIdentity.get(currentSpeakerId) : undefined;
    if (current) return { participant: current, mode: "speaking" as StageMode, screenTrack: undefined };

    // Nobody is talking: keep the stage useful instead of empty.
    const last = lastSpeakerId ? participantsByIdentity.get(lastSpeakerId) : undefined;
    const fallback =
      last ??
      moderator ??
      participants.find((p) => !p.isLocal) ??
      participants[0] ??
      null;

    return {
      participant: fallback,
      mode: (fallback && fallback.identity === moderatorIdentity ? "chair" : "default") as StageMode,
      screenTrack: undefined,
    };
  }, [
    screenTracks,
    promotedIdentity,
    participantsByIdentity,
    currentSpeakerId,
    lastSpeakerId,
    moderator,
    moderatorIdentity,
    participants,
  ]);

  const stageParticipant = stage.participant;
  const isScreen = stage.mode === "screen";
  const stageVideo = isScreen
    ? stage.screenTrack
    : stageParticipant
      ? cameraByIdentity.get(stageParticipant.identity)
      : undefined;

  // During a screen share the presenter's camera should stay visible in the strip.
  const filmstrip = useMemo(
    () =>
      isScreen
        ? participants
        : participants.filter((p) => p.identity !== stageParticipant?.identity),
    [participants, isScreen, stageParticipant],
  );

  const handIdentities = useMemo(
    () => new Set(raisedHands.map((hand) => hand.identity)),
    [raisedHands],
  );

  /* --------------------------- Media controls ---------------------------- */

  const runMedia = useCallback(
    async (key: "mic" | "cam" | "screen", action: () => Promise<unknown>, errorMessage: string) => {
      if (busyControl) return;
      setBusyControl(key);
      try {
        await action();
      } catch (error) {
        const cancelled =
          key === "screen" &&
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "AbortError");

        if (cancelled) {
          toast.info(
            "Kushiriki skrini kumeghairishwa au hakukuruhusiwa. Angalia ruhusa za kivinjari.",
          );
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setBusyControl(null);
      }
    },
    [busyControl],
  );

  const toggleMic = () =>
    runMedia(
      "mic",
      () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled),
      "Imeshindwa kubadilisha mipangilio ya sauti.",
    );
  const toggleCam = () =>
    runMedia(
      "cam",
      () => localParticipant.setCameraEnabled(!isCameraEnabled),
      "Imeshindwa kubadilisha mipangilio ya kamera.",
    );
  const toggleScreen = () =>
    runMedia(
      "screen",
      () =>
        localParticipant.setScreenShareEnabled(
          !isScreenShareEnabled,
          isScreenShareEnabled
            ? undefined
            : {
                contentHint: "detail", // keep text and slides sharp
                selfBrowserSurface: "exclude", // hide this tab in the picker
              },
        ),
      "Imeshindwa kushiriki skrini.",
    );

  /* ------------------------------ Leave room ----------------------------- */

  const confirmLeave = useCallback(async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await room.disconnect();
    } catch {
      toast.error("Hitilafu imetokea wakati wa kuondoka kwenye kikao.");
    } finally {
      onExit();
    }
  }, [leaving, room, onExit]);

  const togglePanel = (id: SidePanelId) =>
    setPanel((current) => (current === id ? null : id));

  /* ---------------------------------- UI --------------------------------- */

  const reconnecting =
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting;

  return (
    <div className="flex h-dvh min-h-120 flex-col overflow-hidden bg-[#080F1D] text-white">
      <TooltipProvider delayDuration={200}>
        {/* Header */}
        <header className="z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0D1728] px-3 py-2.5 md:px-5">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setLeaveOpen(true)}
              className="size-10 shrink-0 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Rudi nyuma"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>

            <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 sm:flex">
              <RadioIcon className="size-5 text-blue-400" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold md:text-base">
                {meeting?.title || "Chumba cha Mkutano"}
              </h1>
              <p className="truncate text-xs text-slate-400">
                Halmashauri ya Wilaya ya Mlele
              </p>
            </div>

            <Badge className="shrink-0 gap-1.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/10">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {isModerator && (
              <Badge className="hidden gap-1 border border-amber-400/20 bg-amber-500/10 text-amber-300 md:flex">
                <CrownIcon className="size-3.5" />
                Mwenyekiti
              </Badge>
            )}

            <div
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300"
              title="Muda uliokaa kwenye mkutano"
            >
              <ClockIcon className="size-3.5 text-slate-400" />
              <span className="tabular-nums">{formatElapsed(elapsed)}</span>
            </div>

            <button
              type="button"
              onClick={() => togglePanel("people")}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition-colors hover:bg-white/10 sm:flex"
              aria-label="Fungua orodha ya washiriki"
            >
              <UsersIcon className="size-4 text-slate-400" />
              <span className="font-medium tabular-nums">{participants.length}</span>
            </button>

            <ConnectionIndicator state={connectionState} />
          </div>
        </header>

        {reconnecting && (
          <div
            role="status"
            className="z-20 flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-sm text-amber-200"
          >
            <Loader2Icon className="size-4 animate-spin" />
            Muunganisho umekatika. Inajaribu kuunganisha upya...
          </div>
        )}

        {/* Workspace */}
        <main className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-2 sm:p-3 md:gap-4 md:p-4">
            <Stage
              participant={stageParticipant}
              mode={stage.mode}
              videoTrack={stageVideo}
              isScreen={isScreen}
              isLocalScreenShare={isScreen && Boolean(stageParticipant?.isLocal)}
              isSpeaking={Boolean(stageParticipant && speakingIds.has(stageParticipant.identity))}
              canDemote={
                isModerator &&
                stage.mode === "promoted" &&
                Boolean(stageParticipant)
              }
              controlLoading={stageControls.loading}
              onDemote={() => stageParticipant && void stageControls.demote(stageParticipant.identity)}
              onStopShare={() => void toggleScreen()}
            />

            {filmstrip.length > 0 && (
              <div
                className="flex shrink-0 snap-x gap-2 overflow-x-auto pb-1 md:gap-3"
                aria-label="Washiriki wengine"
              >
                {filmstrip.map((participant) => (
                  <ParticipantTile
                    key={participant.identity}
                    participant={participant}
                    cameraTrack={cameraByIdentity.get(participant.identity)}
                    speaking={speakingIds.has(participant.identity)}
                    handRaised={handIdentities.has(participant.identity)}
                    promoted={promotedIdentity === participant.identity}
                    isChair={participant.identity === moderatorIdentity}
                  />
                ))}
              </div>
            )}
          </div>

          {panel && (
            <SidePanel
              active={panel}
              onChange={setPanel}
              onClose={() => setPanel(null)}
              handCount={raisedHands.length}
              unread={chat.unread}
              participantCount={participants.length}
            >
              {panel === "people" ? (
                <PeoplePanel
                  participants={participants}
                  localIdentity={localIdentity}
                  moderatorIdentity={moderatorIdentity}
                  speakingIds={speakingIds}
                  raisedHands={raisedHands}
                  promotedIdentity={promotedIdentity}
                  isModerator={isModerator}
                  controlLoading={stageControls.loading}
                  onPromote={(identity) => void stageControls.promote(identity)}
                  onDemote={(identity) => void stageControls.demote(identity)}
                />
              ) : (
                <ChatPanel
                  messages={chat.messages}
                  sending={chat.sending}
                  onSend={chat.sendMessage}
                />
              )}
            </SidePanel>
          )}
        </main>

        {/* Controls */}
        <footer className="z-20 border-t border-white/10 bg-[#0D1728] px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-6">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            <ControlButton
              icon={isMicrophoneEnabled ? MicIcon : MicOffIcon}
              label={isMicrophoneEnabled ? "Zima sauti" : "Washa sauti"}
              tone={isMicrophoneEnabled ? "default" : "off"}
              pressed={isMicrophoneEnabled}
              loading={busyControl === "mic"}
              onClick={() => void toggleMic()}
            />
            <ControlButton
              icon={isCameraEnabled ? VideoIcon : VideoOffIcon}
              label={isCameraEnabled ? "Zima kamera" : "Washa kamera"}
              tone={isCameraEnabled ? "default" : "off"}
              pressed={isCameraEnabled}
              loading={busyControl === "cam"}
              onClick={() => void toggleCam()}
            />
            {screenShareSupported && (
              <ControlButton
                icon={MonitorIcon}
                label={isScreenShareEnabled ? "Acha kushiriki" : "Shiriki skrini"}
                tone={isScreenShareEnabled ? "active" : "default"}
                pressed={isScreenShareEnabled}
                loading={busyControl === "screen"}
                onClick={() => void toggleScreen()}
              />
            )}
            <ControlButton
              icon={HandIcon}
              label={isHandRaised ? "Shusha mkono" : "Inua mkono"}
              tone={isHandRaised ? "amber" : "default"}
              pressed={isHandRaised}
              loading={stageControls.loading}
              onClick={() => void stageControls.toggleHand()}
            />
            <ControlButton
              icon={UsersIcon}
              label="Washiriki"
              tone={panel === "people" ? "active" : "default"}
              pressed={panel === "people"}
              badge={raisedHands.length}
              onClick={() => togglePanel("people")}
            />
            <ControlButton
              icon={MessageCircleIcon}
              label="Gumzo"
              tone={panel === "chat" ? "active" : "default"}
              pressed={panel === "chat"}
              badge={chat.unread}
              onClick={() => togglePanel("chat")}
            />

            <div className="mx-0.5 h-8 w-px shrink-0 bg-white/10 md:mx-1" />

            <ControlButton
              icon={PhoneOffIcon}
              label="Ondoka"
              onClick={() => setLeaveOpen(true)}
              className="border-red-500 bg-red-600 text-white hover:bg-red-500"
            />
          </div>
        </footer>

        <LeaveDialog
          open={leaveOpen}
          leaving={leaving}
          onOpenChange={setLeaveOpen}
          onConfirm={() => void confirmLeave()}
        />
      </TooltipProvider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Entry: fetches the token, then mounts the room                            */
/* -------------------------------------------------------------------------- */

function RoomShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#080F1D] p-4 text-white">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="absolute left-3 top-3 gap-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Rudi nyuma
      </Button>
      {children}
    </div>
  );
}

export default function MeetingRoom({
  meetingId,
  meeting: initialMeeting,
  exitHref = "/public",
}: MeetingRoomProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const navigationStarted = useRef(false);
  const meeting = initialMeeting ?? null;

  /** Leave the room for good (used after disconnect). */
  const exitRoom = useCallback(() => {
    if (navigationStarted.current) return;
    navigationStarted.current = true;
    router.replace(exitHref);
  }, [router, exitHref]);

  /** "Back" from the loading / error screens. */
  const goBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.replace(exitHref);
  }, [router, exitHref]);

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
          rawToken = window.localStorage.getItem(CREDENTIAL_KEY(meetingId));
        } catch {
          throw new Error("Imeshindikana kusoma hati ya usajili kutoka kwenye kifaa hiki.");
        }

        if (!rawToken) {
          throw new Error("Hakuna hati ya usajili. Tafadhali jisajili kwanza.");
        }

        const result = await requestMeetingTokenAction({ meetingId, rawToken });
        if (cancelled) return;

        if (!result.success || !result.data?.token) {
          throw new Error(result.message || "Imeshindwa kupata tokeni ya mkutano.");
        }

        setToken(result.data.token);
        setServerUrl(result.data.serverUrl ?? null);
      } catch (caught) {
        if (cancelled) return;
        const message =
          caught instanceof Error
            ? caught.message
            : "Hitilafu imetokea wakati wa kujiunga na mkutano.";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMeetingToken();
    return () => {
      cancelled = true;
    };
  }, [meetingId, attempt]);

  if (loading) {
    return (
      <RoomShell onBack={goBack}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <Loader2Icon className="size-8 animate-spin text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Inaandaa chumba cha mkutano</h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Tafadhali subiri tunapokuunganisha. Kivinjari kinaweza kuomba ruhusa ya kamera na
            kipaza sauti.
          </p>
        </div>
      </RoomShell>
    );
  }

  if (error || !token) {
    return (
      <RoomShell onBack={goBack}>
        <Card className="w-full max-w-md border-white/10 bg-[#111E31] text-white shadow-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertCircleIcon className="size-7" />
            </div>
            <CardTitle className="text-xl">Imeshindwa kujiunga</CardTitle>
            <CardDescription className="text-slate-400">
              {error || "Imeshindwa kuanzisha muunganisho wa mkutano."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => setAttempt((previous) => previous + 1)}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-500"
            >
              <RefreshCwIcon className="size-4" />
              Jaribu tena
            </Button>
            <Button
              variant="outline"
              onClick={goBack}
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Rudi nyuma
            </Button>
          </CardContent>
        </Card>
      </RoomShell>
    );
  }

  const url = serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  if (!url) {
    return (
      <RoomShell onBack={goBack}>
        <Card className="w-full max-w-md border-white/10 bg-[#111E31] text-white">
          <CardHeader>
            <CardTitle>Muunganisho haupatikani</CardTitle>
            <CardDescription className="text-slate-400">
              Anwani ya seva ya mkutano haijasanidiwa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={goBack} className="w-full">
              Rudi nyuma
            </Button>
          </CardContent>
        </Card>
      </RoomShell>
    );
  }

  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={url}
      onDisconnected={exitRoom}
      onMediaDeviceFailure={() =>
        toast.error("Imeshindwa kufikia kamera au kipaza sauti. Angalia ruhusa za kivinjari.")
      }
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <MeetingRoomInner meeting={meeting} onExit={exitRoom} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
