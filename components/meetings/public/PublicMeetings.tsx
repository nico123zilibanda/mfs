"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  Loader2,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  getPublicMeetingAction,
  listMeetingsAction,
  registerAnonymousForMeetingAction,
} from "@/lib/actions/meeting.actions";
import type { Meeting, MeetingSummary } from "@/lib/types/meeting";
import { MEETING_STATUS_LABELS } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* -------------------------------------------------------------------------- */
/*  Constants & types                                                         */
/* -------------------------------------------------------------------------- */

type MeetingStatus = Meeting["status"];
type StatusFilter = "all" | MeetingStatus;

const CREDENTIAL_PREFIX = "meeting-credential-";
const CREDENTIAL_KEY = (id: string) => `${CREDENTIAL_PREFIX}${id}`;
const getMeetingLobbyPath = (meetingId: string) =>
  `/live/meeting/${encodeURIComponent(meetingId)}`;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Yote" },
  { value: "live", label: "Inaendelea" },
  { value: "scheduled", label: "Imepangwa" },
  { value: "ended", label: "Imemalizika" },
  { value: "cancelled", label: "Imeghairishwa" },
];

const STATUS_PRIORITY: Record<MeetingStatus, number> = {
  live: 0,
  scheduled: 1,
  ended: 2,
  cancelled: 3,
};

/** Single source of truth for every status-based style / hint. */
const STATUS_CONFIG: Record<
  MeetingStatus,
  { accent: string; badge: string; tile: string; hint: string; hintTone: string }
> = {
  live: {
    accent: "bg-emerald-500",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    tile: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    hint: "Mkutano unaendelea sasa",
    hintTone: "text-emerald-700 dark:text-emerald-400",
  },
  scheduled: {
    accent: "bg-primary/70",
    badge: "border-primary/25 bg-primary/10 text-primary",
    tile: "border-primary/25 bg-primary/10 text-primary",
    hint: "Mkutano uliopangwa",
    hintTone: "text-muted-foreground",
  },
  ended: {
    accent: "bg-muted-foreground/30",
    badge: "border-border bg-muted text-muted-foreground",
    tile: "border-border bg-muted text-muted-foreground",
    hint: "Mkutano umekamilika",
    hintTone: "text-muted-foreground",
  },
  cancelled: {
    accent: "bg-destructive/70",
    badge: "border-destructive/25 bg-destructive/10 text-destructive",
    tile: "border-destructive/25 bg-destructive/10 text-destructive",
    hint: "Mkutano umeghairishwa",
    hintTone: "text-destructive",
  },
};

/* -------------------------------------------------------------------------- */
/*  Date helpers (formatters are created once, not on every render)           */
/* -------------------------------------------------------------------------- */

const LOCALE = "sw-TZ";
const TIME_ZONE = "Africa/Dar_es_Salaam";

const fullFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: "full",
  timeStyle: "short",
});
const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  month: "short",
});
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "short",
});
const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  timeStyle: "short",
});

function parseDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(iso: string) {
  const date = parseDate(iso);
  return date ? fullFormatter.format(date) : iso;
}

function getDateParts(iso: string) {
  const date = parseDate(iso);
  if (!date) return null;
  return {
    day: dayFormatter.format(date),
    month: monthFormatter.format(date),
    weekday: weekdayFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

function toTime(iso: string) {
  return parseDate(iso)?.getTime() ?? 0;
}

function getCountdownLabel(iso: string, now: number | null) {
  if (now === null) return null;
  const date = parseDate(iso);
  if (!date) return null;

  const diff = date.getTime() - now;
  if (diff <= 0) return "Unaanza hivi karibuni";

  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return `Unaanza baada ya dakika ${minutes}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Unaanza baada ya saa ${hours}`;

  return `Unaanza baada ya siku ${Math.round(hours / 24)}`;
}

function sortMeetings(list: MeetingSummary[]) {
  return [...list].sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;

    const aTime = toTime(a.scheduledStartAt);
    const bTime = toTime(b.scheduledStartAt);
    // Past meetings: newest first. Upcoming / live: soonest first.
    return a.status === "ended" || a.status === "cancelled"
      ? bTime - aTime
      : aTime - bTime;
  });
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

function hasCredential(meetingId: string) {
  try {
    return Boolean(window.localStorage.getItem(CREDENTIAL_KEY(meetingId)));
  } catch {
    return false; // storage blocked (private mode, etc.)
  }
}

/** Tracks which meetings this device has a stored credential for. */
function useRegisteredMeetings(meetings: MeetingSummary[]) {
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const meeting of meetings) next[meeting.id] = hasCredential(meeting.id);
    setRegistered(next);
  }, [meetings]);

  // Keep several open tabs in sync.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (!event.key?.startsWith(CREDENTIAL_PREFIX)) return;
      const id = event.key.slice(CREDENTIAL_PREFIX.length);
      setRegistered((prev) => ({ ...prev, [id]: Boolean(event.newValue) }));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const markRegistered = useCallback((id: string) => {
    setRegistered((prev) => ({ ...prev, [id]: true }));
  }, []);

  return { registered, markRegistered };
}

/** Client-only clock (null on the server → no hydration mismatch). */
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

function LiveDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-50 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full font-medium", STATUS_CONFIG[status].badge)}
    >
      {status === "live" && <LiveDot />}
      {status === "scheduled" && <CalendarClock className="size-3.5" />}
      {MEETING_STATUS_LABELS[status]}
    </Badge>
  );
}

function DateTile({ iso, status }: { iso: string; status: MeetingStatus }) {
  const parts = getDateParts(iso);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border",
        STATUS_CONFIG[status].tile,
      )}
    >
      {parts ? (
        <>
          <span className="text-xs font-medium leading-none">{parts.month}</span>
          <span className="mt-1 text-xl font-bold leading-none tabular-nums">
            {parts.day}
          </span>
        </>
      ) : (
        <CalendarDays className="size-6" />
      )}
    </div>
  );
}

function SectionHeading() {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
        <Radio className="size-4" />
        <span>Mawasiliano ya moja kwa moja</span>
      </div>
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        Mikutano <span className="text-primary">Hai</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
        Shiriki katika mikutano ya moja kwa moja, pata taarifa muhimu na ungana
        na jamii kupitia jukwaa letu la kidijitali.
      </p>
      <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> Ushiriki rahisi
        </span>
        <span className="inline-flex items-center gap-2">
          <Video className="size-4 text-primary" /> Mikutano ya mtandaoni
        </span>
      </div>
    </div>
  );
}

function StatusFilters({
  value,
  counts,
  showCounts,
  onChange,
}: {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  showCounts: boolean;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Chuja mikutano kwa hali"
      // Horizontal scroll on phones, wrapping on larger screens.
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {STATUS_FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <Button
            key={filter.value}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className="shrink-0 gap-2 rounded-full"
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
          >
            {filter.label}
            {showCounts && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/20"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[filter.value]}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  States: loading / empty / error                                           */
/* -------------------------------------------------------------------------- */

function MeetingsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
      aria-label="Inapakia mikutano"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="gap-0 overflow-hidden rounded-2xl py-0">
          <div className="h-1 animate-pulse bg-muted" />
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-3">
              <div className="size-14 shrink-0 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-2 border-t pt-4">
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyMeetings({
  filtered = false,
  onReset,
}: {
  filtered?: boolean;
  onReset?: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-dashed shadow-none">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <CalendarDays className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">
          {filtered ? "Hakuna mikutano katika kundi hili" : "Hakuna mikutano kwa sasa"}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Chagua hali nyingine ili kuona mikutano iliyopo."
            : "Mikutano itakapoandaliwa, taarifa zake zitaonekana hapa. Tafadhali tembelea ukurasa huu tena baadaye."}
        </p>
        {filtered && onReset && (
          <Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={onReset}>
            Onyesha mikutano yote
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-destructive/20">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">Imeshindikana kupakia mikutano</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
        <Button type="button" className="mt-6 gap-2 rounded-xl" onClick={onRetry}>
          <RefreshCw className="size-4" /> Jaribu tena
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Meeting card                                                              */
/* -------------------------------------------------------------------------- */

type MeetingCardProps = {
  meeting: MeetingSummary;
  isRegistered: boolean;
  isOpening: boolean;
  now: number | null;
  onOpenDetails: (meetingId: string) => void;
  onJoin: (meeting: MeetingSummary) => void;
};

const MeetingCard = memo(function MeetingCard({
  meeting,
  isRegistered,
  isOpening,
  now,
  onOpenDetails,
  onJoin,
}: MeetingCardProps) {
  const config = STATUS_CONFIG[meeting.status];
  const isLive = meeting.status === "live";
  const isScheduled = meeting.status === "scheduled";
  const canJoin = isLive || isScheduled;
  const parts = getDateParts(meeting.scheduledStartAt);

  const hint = isScheduled
    ? (getCountdownLabel(meeting.scheduledStartAt, now) ?? config.hint)
    : config.hint;

  const joinLabel = isRegistered
    ? isLive
      ? "Jiunge sasa"
      : "Fungua lobby"
    : isLive
      ? "Jiunge"
      : "Jiandikishe";

  return (
    <Card
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm",
        "transition-[transform,box-shadow,border-color] duration-200",
        "hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-0.5",
        isLive && "border-emerald-500/30",
      )}
    >
      <div className={cn("h-1 w-full", config.accent)} />

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        {/* Status row */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <StatusBadge status={meeting.status} />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersRound className="size-3.5" />
            <span className="tabular-nums">{meeting.participantCount}</span> washiriki
          </span>
        </div>

        {/* Date tile + title */}
        <div className="flex items-start gap-3.5">
          <DateTile iso={meeting.scheduledStartAt} status={meeting.status} />
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 min-h-12 text-lg leading-6 font-semibold tracking-tight transition-colors group-hover:text-primary">
              {meeting.title}
            </CardTitle>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="size-3.5 shrink-0" />
              <span className="truncate">
                {parts ? `${parts.weekday}, ${parts.time}` : meeting.scheduledStartAt}
              </span>
            </p>
          </div>
        </div>

        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {meeting.description?.trim() ||
            "Fungua maelezo ya mkutano ili kupata taarifa zaidi kuhusu mkutano huu."}
        </p>

        {/* Footer */}
        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-xs">
            <span className={cn("inline-flex items-center gap-1.5 font-medium", config.hintTone)}>
              <Clock3 className="size-3.5 shrink-0" />
              {hint}
            </span>
            {isRegistered && canJoin && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Umejiandikisha
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-0 flex-1 gap-2 rounded-xl"
              onClick={() => onOpenDetails(meeting.id)}
              disabled={isOpening}
            >
              {isOpening ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <Info className="size-4 shrink-0" />
              )}
              <span className="truncate">Maelezo</span>
            </Button>

            {canJoin && (
              <Button
                type="button"
                className="min-w-0 flex-1 gap-2 rounded-xl"
                onClick={() => onJoin(meeting)}
              >
                {isLive ? (
                  <Video className="size-4 shrink-0" />
                ) : (
                  <ArrowRight className="size-4 shrink-0" />
                )}
                <span className="truncate">{joinLabel}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/* -------------------------------------------------------------------------- */
/*  Details dialog                                                            */
/* -------------------------------------------------------------------------- */

function PanelHeader({
  icon: Icon,
  title,
  text,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone?: "primary" | "success";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone === "success" ? "bg-emerald-500/10" : "bg-primary/10",
        )}
      >
        <Icon
          className={cn(
            "size-5",
            tone === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-primary",
          )}
        />
      </div>
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold leading-6">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function ClosedNotice({ status }: { status: "ended" | "cancelled" }) {
  const cancelled = status === "cancelled";
  const Icon = cancelled ? AlertCircle : CheckCircle2;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        cancelled ? "border-destructive/20 bg-destructive/5" : "bg-muted/30",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          cancelled ? "text-destructive" : "text-muted-foreground",
        )}
      />
      <div>
        <h3 className="text-sm font-semibold">
          {cancelled ? "Mkutano umeghairishwa" : "Mkutano umekamilika"}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {cancelled
            ? "Mkutano huu umeghairishwa na haupatikani kwa ajili ya kujiunga."
            : "Mkutano huu umemalizika na hauwezi kuunganishwa tena kupitia ukurasa huu."}
        </p>
      </div>
    </div>
  );
}

type JoinPanelProps = {
  isLive: boolean;
  isRegistered: boolean;
  registering: boolean;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  onRegister: () => void;
  onJoin: () => void;
};

function JoinPanel({
  isLive,
  isRegistered,
  registering,
  displayName,
  onDisplayNameChange,
  onRegister,
  onJoin,
}: JoinPanelProps) {
  if (isRegistered) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
        <PanelHeader
          icon={CheckCircle2}
          tone="success"
          title="Usajili umekamilika"
          text={
            isLive
              ? "Mkutano unaendelea. Unaweza kujiunga sasa."
              : "Tayari umejiandikisha kwa mkutano huu. Fungua lobby ili kusubiri mkutano uanze."
          }
        />
        <Button type="button" className="h-11 w-full gap-2 rounded-xl" onClick={onJoin}>
          {isLive ? <Video className="size-4" /> : <ArrowRight className="size-4" />}
          {isLive ? "Jiunge na mkutano" : "Fungua lobby"}
        </Button>
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registering) onRegister();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-muted/20 p-4 sm:p-5">
      <PanelHeader
        icon={isLive ? Video : Sparkles}
        title={isLive ? "Mkutano unaendelea" : "Jiandikishe kushiriki"}
        text={
          isLive
            ? "Jiandikishe kwa jina lako ili kujiunga na mkutano huu."
            : "Weka jina litakaloonekana kwa washiriki wengine unapoungana na mkutano."
        }
      />
      <div className="space-y-2">
        <Label htmlFor="meeting-display-name">Jina la kuonyesha</Label>
        <Input
          id="meeting-display-name"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="Mfano: Juma Hassan"
          autoComplete="name"
          maxLength={100}
          disabled={registering}
          className="h-11 rounded-xl bg-background"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Akaunti haihitajiki kwa usajili huu.
        </p>
      </div>
      <Button
        type="submit"
        className="h-11 w-full gap-2 rounded-xl"
        disabled={registering || !displayName.trim()}
      >
        {registering ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Inasajili...
          </>
        ) : (
          <>
            Jiandikishe <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

type MeetingDetailsDialogProps = {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  now: number | null;
} & Omit<JoinPanelProps, "isLive">;

function MeetingDetailsDialog({
  meeting,
  open,
  onOpenChange,
  now,
  ...joinProps
}: MeetingDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        {meeting && (
          <>
            <div className="shrink-0 border-b bg-linear-to-br from-primary/10 via-primary/4 to-transparent px-5 pb-5 pt-6 sm:px-7">
              <div className="mb-4 pr-8">
                <StatusBadge status={meeting.status} />
              </div>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="pr-8 text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                  {meeting.title}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-1.5 text-sm leading-6">
                    <p className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{formatDateTime(meeting.scheduledStartAt)}</span>
                    </p>
                    {meeting.status === "scheduled" &&
                      getCountdownLabel(meeting.scheduledStartAt, now) && (
                        <p className="flex items-start gap-2 font-medium text-foreground">
                          <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{getCountdownLabel(meeting.scheduledStartAt, now)}</span>
                        </p>
                      )}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
              {meeting.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Kuhusu mkutano</h3>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {meeting.description}
                  </p>
                </div>
              )}

              {(meeting.status === "live" || meeting.status === "scheduled") && (
                <JoinPanel isLive={meeting.status === "live"} {...joinProps} />
              )}

              {(meeting.status === "ended" || meeting.status === "cancelled") && (
                <ClosedNotice status={meeting.status} />
              )}
            </div>

            <DialogFooter className="shrink-0 border-t bg-muted/10 px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 rounded-xl sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" /> Funga
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function PublicMeetings({
  initialMeetings = [],
}: {
  initialMeetings?: MeetingSummary[];
} = {}) {
  const router = useRouter();
  const now = useNow();
  const hadInitialData = useRef(initialMeetings.length > 0);

  const [meetings, setMeetings] = useState<MeetingSummary[]>(initialMeetings);
  const [loading, setLoading] = useState(initialMeetings.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [registering, startRegisterTransition] = useTransition();

  const { registered, markRegistered } = useRegisteredMeetings(meetings);

  /* ----------------------------- data loading ----------------------------- */

  const loadMeetings = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await listMeetingsAction({});
      if (!result.success) {
        setError(result.message ?? "Imeshindwa kupakia mikutano.");
        return;
      }
      // No status filtering here: the public page must also show past meetings.
      setMeetings(result.data.meetings);
      setError(null);
    } catch {
      setError("Hitilafu imetokea wakati wa kupakia mikutano.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings(hadInitialData.current);
  }, [loadMeetings]);

  /* ------------------------------ derived data ---------------------------- */

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: meetings.length,
      live: 0,
      scheduled: 0,
      ended: 0,
      cancelled: 0,
    };
    for (const meeting of meetings) result[meeting.status] += 1;
    return result;
  }, [meetings]);

  const visibleMeetings = useMemo(
    () =>
      sortMeetings(
        statusFilter === "all"
          ? meetings
          : meetings.filter((meeting) => meeting.status === statusFilter),
      ),
    [meetings, statusFilter],
  );

  const isRegistered = useCallback((id: string) => Boolean(registered[id]), [registered]);

  /* -------------------------------- actions ------------------------------- */

  const goToLobby = useCallback(
    (meetingId: string) => router.push(getMeetingLobbyPath(meetingId)),
    [router],
  );

  const openDetails = useCallback(
    async (meetingId: string) => {
      if (openingId) return;
      setOpeningId(meetingId);
      try {
        const result = await getPublicMeetingAction(meetingId);
        if (result.success) {
          setSelectedMeeting(result.data);
          setDetailOpen(true);
        } else {
          toast.error(result.message ?? "Mkutano haukuweza kupakuliwa.");
        }
      } catch {
        toast.error("Hitilafu imetokea wakati wa kufungua maelezo.");
      } finally {
        setOpeningId(null);
      }
    },
    [openingId],
  );

  const handleJoin = useCallback(
    (meeting: MeetingSummary) => {
      if (meeting.status === "live" && !isRegistered(meeting.id)) {
        // Live meetings need a registration first: open the details to register.
        void openDetails(meeting.id);
        return;
      }
      if (meeting.status === "live" || meeting.status === "scheduled") {
        goToLobby(meeting.id);
      }
    },
    [goToLobby, isRegistered, openDetails],
  );

  function handleRegister() {
    if (!selectedMeeting) return;
    const name = displayName.trim();
    if (!name) {
      toast.error("Tafadhali ingiza jina lako la kuonyesha.");
      return;
    }

    const meetingId = selectedMeeting.id;

    startRegisterTransition(async () => {
      try {
        const result = await registerAnonymousForMeetingAction({
          meetingId,
          displayName: name,
        });
        if (!result.success || !result.data?.rawToken) {
          toast.error(result.message ?? "Usajili haukuwezekana.");
          return;
        }

        try {
          window.localStorage.setItem(CREDENTIAL_KEY(meetingId), result.data.rawToken);
        } catch {
          toast.error("Kivinjari chako kimezuia kuhifadhi taarifa za usajili.");
          return;
        }

        markRegistered(meetingId);
        toast.success("Umejiandikisha kwa mafanikio.");
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  function handleDialogOpenChange(open: boolean) {
    setDetailOpen(open);
    if (!open) setDisplayName("");
  }

  /* --------------------------------- render ------------------------------- */

  const showFullError = Boolean(error) && meetings.length === 0;
  const showInlineError = Boolean(error) && meetings.length > 0;

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-primary/6 via-primary/2.5 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading />

        <div className="mx-auto max-w-7xl">
          {/* Toolbar */}
          <div className="mb-6 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight">Orodha ya mikutano</h3>
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                  {loading
                    ? "Inapakia taarifa..."
                    : `${visibleMeetings.length} kati ya ${meetings.length} mikutano`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-2 rounded-xl"
                onClick={() => void loadMeetings(true)}
                disabled={loading || refreshing}
              >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                <span className="hidden sm:inline">
                  {refreshing ? "Inasasisha..." : "Sasisha taarifa"}
                </span>
                <span className="sm:hidden">{refreshing ? "Inasasisha" : "Sasisha"}</span>
              </Button>
            </div>

            <StatusFilters
              value={statusFilter}
              counts={counts}
              showCounts={!loading}
              onChange={setStatusFilter}
            />
          </div>

          {showInlineError && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error} Unaona taarifa za mwisho zilizopakiwa.</span>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-fit gap-2 rounded-xl"
                onClick={() => void loadMeetings(true)}
              >
                <RefreshCw className="size-4" /> Jaribu tena
              </Button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <MeetingsSkeleton />
          ) : showFullError ? (
            <ErrorState message={error!} onRetry={() => void loadMeetings()} />
          ) : meetings.length === 0 ? (
            <EmptyMeetings />
          ) : visibleMeetings.length === 0 ? (
            <EmptyMeetings filtered onReset={() => setStatusFilter("all")} />
          ) : (
            <div className="grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visibleMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  isRegistered={isRegistered(meeting.id)}
                  isOpening={openingId === meeting.id}
                  now={now}
                  onOpenDetails={openDetails}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MeetingDetailsDialog
        meeting={selectedMeeting}
        open={detailOpen}
        onOpenChange={handleDialogOpenChange}
        now={now}
        isRegistered={selectedMeeting ? isRegistered(selectedMeeting.id) : false}
        registering={registering}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        onRegister={handleRegister}
        onJoin={() => selectedMeeting && goToLobby(selectedMeeting.id)}
      />
    </section>
  );
}
