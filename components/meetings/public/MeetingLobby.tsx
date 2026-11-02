"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  Radio,
  ShieldCheck,
  UsersRound,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import {
  getPublicMeetingAction,
  registerAnonymousForMeetingAction,
} from "@/lib/actions/meeting.actions";
import type { Meeting } from "@/lib/types/meeting";
import { MEETING_STATUS_LABELS } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";

import MeetingRoom from "@/components/meetings/room/MeetingRoom";

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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

type MeetingStatus = Meeting["status"];

const CREDENTIAL_PREFIX = "meeting-credential-";
const CREDENTIAL_KEY = (id: string) => `${CREDENTIAL_PREFIX}${id}`;

const STATUS_POLL_INTERVAL_MS = 15_000;

const STATUS_STYLES: Record<MeetingStatus, string> = {
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  scheduled: "border-primary/25 bg-primary/10 text-primary",
  ended: "border-border bg-muted text-muted-foreground",
  cancelled: "border-destructive/25 bg-destructive/10 text-destructive",
};

const dateTimeFormatter = new Intl.DateTimeFormat("sw-TZ", {
  timeZone: "Africa/Dar_es_Salaam",
  dateStyle: "full",
  timeStyle: "short",
});

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? isoString : dateTimeFormatter.format(date);
}

function getStatusLabel(status: MeetingStatus) {
  return MEETING_STATUS_LABELS[status] ?? status;
}

function readCredential(meetingId: string) {
  try {
    return Boolean(window.localStorage.getItem(CREDENTIAL_KEY(meetingId)));
  } catch {
    return false; // storage blocked
  }
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

type Countdown = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Ticks every second while `enabled`. Returns `null` until mounted so the
 * server and first client render match (no hydration mismatch).
 */
function useCountdown(targetIso: string, enabled: boolean): Countdown | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  if (now === null) return null;

  const target = new Date(targetIso).getTime();
  const total = Number.isFinite(target)
    ? Math.max(0, Math.floor((target - now) / 1000))
    : 0;

  return {
    total,
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Reads / saves this device's registration credential for a meeting. */
function useMeetingCredential(meetingId: string) {
  const [hasCredential, setHasCredential] = useState(false);

  useEffect(() => {
    setHasCredential(readCredential(meetingId));

    function onStorage(event: StorageEvent) {
      if (event.key === CREDENTIAL_KEY(meetingId)) {
        setHasCredential(Boolean(event.newValue));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [meetingId]);

  const saveCredential = useCallback(
    (token: string) => {
      try {
        window.localStorage.setItem(CREDENTIAL_KEY(meetingId), token);
      } catch {
        return false;
      }
      setHasCredential(true);
      return true;
    },
    [meetingId],
  );

  return { hasCredential, saveCredential };
}

/** Keeps the meeting status fresh so the lobby reacts when the host starts it. */
function useMeetingStatusPolling(
  meetingId: string,
  enabled: boolean,
  onUpdate: (meeting: Meeting) => void,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const result = await getPublicMeetingAction(meetingId);
        if (!cancelled && result.success) onUpdateRef.current(result.data);
      } catch {
        // Silent: the next tick will retry.
      }
    }

    const timer = window.setInterval(poll, STATUS_POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [meetingId, enabled]);
}

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                             */
/* -------------------------------------------------------------------------- */

function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleBack() {
    // If the user landed here directly (no history), go to a sensible page.
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="-ml-2 h-9 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Rudi nyuma
    </Button>
  );
}

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
      className={cn("gap-1.5 rounded-full px-3 py-1", STATUS_STYLES[status])}
    >
      {status === "live" ? (
        <LiveDot />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {getStatusLabel(status)}
    </Badge>
  );
}

function IconBox({
  icon: Icon,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  tone?: "primary" | "success";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl",
        tone === "success"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-primary/10 text-primary",
        className,
      )}
    >
      <Icon className="size-5" />
    </div>
  );
}

function CardHeading({
  icon,
  tone,
  title,
  description,
}: {
  icon: LucideIcon;
  tone?: "primary" | "success";
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <IconBox icon={icon} tone={tone} />
      <div className="min-w-0 space-y-1">
        <CardTitle className="text-lg leading-6">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function LobbyHeader({ meeting }: { meeting: Meeting }) {
  const isLive = meeting.status === "live";

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div
        className={cn("absolute inset-x-0 top-0 h-1.5", isLive ? "bg-emerald-500" : "bg-primary")}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-5 p-5 sm:p-8 lg:p-10">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Video className="size-3.5" />
              Mikutano Hai
            </Badge>
            <StatusBadge status={meeting.status} />
          </div>

          <div className="space-y-3">
            <h1 className="max-w-3xl text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {meeting.title}
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
              {meeting.description?.trim() ||
                "Karibu kwenye jukwaa la mikutano ya moja kwa moja. Pata taarifa za mkutano na ujiunge utakapokuwa tayari."}
            </p>
          </div>

          <p className="inline-flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{formatDateTime(meeting.scheduledStartAt)}</span>
          </p>
        </div>

        <div
          aria-hidden="true"
          className="hidden size-20 shrink-0 items-center justify-center rounded-2xl border bg-primary/5 text-primary sm:flex"
        >
          {isLive ? <Radio className="size-10" /> : <CalendarClock className="size-10" />}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scheduled: countdown + preparation                                        */
/* -------------------------------------------------------------------------- */

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border bg-background px-1 py-4 sm:px-3 sm:py-5">
      <span className="text-2xl font-bold tabular-nums tracking-tight sm:text-4xl">
        {value}
      </span>
      <span className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</span>
    </div>
  );
}

function CountdownPanel({ countdown }: { countdown: Countdown | null }) {
  const pad = (value: number | undefined) =>
    value === undefined ? "--" : String(value).padStart(2, "0");
  const started = countdown !== null && countdown.total === 0;

  return (
    <Card className="gap-5 overflow-hidden rounded-2xl shadow-sm">
      <CardHeader>
        <CardHeading
          icon={Clock3}
          title="Muda wa kuanza"
          description="Hesabu ya kurudi nyuma hadi muda uliopangwa"
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {started ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="font-medium">Tunasubiri kuanza</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Muda uliopangwa umefika. Subiri msimamizi aanzishe mkutano; ukurasa huu
                utasasishwa wenyewe.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="flex gap-2 sm:gap-3"
              role="timer"
              aria-label="Muda uliobaki kabla mkutano kuanza"
            >
              {(countdown?.days ?? 0) > 0 && (
                <CountdownUnit value={pad(countdown?.days)} label="Siku" />
              )}
              <CountdownUnit value={pad(countdown?.hours)} label="Saa" />
              <CountdownUnit value={pad(countdown?.minutes)} label="Dakika" />
              <CountdownUnit value={pad(countdown?.seconds)} label="Sekunde" />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm leading-6 text-muted-foreground">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Hesabu hii inaelekea muda uliopangwa. Msimamizi ndiye atakayeanzisha
                mkutano.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PreparationSteps({ scheduledStartAt }: { scheduledStartAt: string }) {
  const steps: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: CalendarDays,
      title: "Muda wa mkutano",
      text: formatDateTime(scheduledStartAt),
    },
    {
      icon: Radio,
      title: "Kuanza kwa mkutano",
      text: "Mkutano huanza pale msimamizi anapouanzisha. Kufika kwa muda uliopangwa pekee hakuuanzishi.",
    },
    {
      icon: ShieldCheck,
      title: "Usajili wa mshiriki",
      text: "Jiandikishe mapema hapa juu ili uwe tayari kujiunga mara mkutano utakapoanza.",
    },
  ];

  return (
    <Card className="gap-5 rounded-2xl shadow-sm">
      <CardHeader>
        <CardHeading
          icon={CalendarClock}
          title="Maandalizi ya mkutano"
          description="Taarifa muhimu kabla ya kuanza"
        />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border p-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Live: info card                                                           */
/* -------------------------------------------------------------------------- */

function LiveInfoCard() {
  return (
    <Card className="gap-5 overflow-hidden rounded-2xl border-emerald-500/20 py-0 shadow-sm">
      <div className="h-1.5 bg-emerald-500" />
      <CardHeader className="space-y-3">
        <IconBox icon={Radio} tone="success" className="size-12" />
        <CardTitle className="text-xl">Mkutano unaendelea sasa</CardTitle>
        <CardDescription className="leading-6">
          Jitayarishe kujiunga na washiriki wengine kwenye chumba cha mkutano.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            Unahitaji usajili halali kwenye kifaa hiki ili kufungua chumba cha mkutano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Registration                                                              */
/* -------------------------------------------------------------------------- */

type RegistrationPanelProps = {
  canJoin: boolean; // true only while the meeting is live
  displayName: string;
  setDisplayName: (value: string) => void;
  hasCredential: boolean;
  isRegistering: boolean;
  onRegister: () => void;
  onJoin: () => void;
};

function RegistrationPanel({
  canJoin,
  displayName,
  setDisplayName,
  hasCredential,
  isRegistering,
  onRegister,
  onJoin,
}: RegistrationPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isRegistering) onRegister();
  }

  const heading = hasCredential
    ? canJoin
      ? {
          title: "Uko tayari kujiunga",
          description: "Usajili wako umetambuliwa kwenye kifaa hiki.",
        }
      : {
          title: "Umejiandikisha",
          description: "Usajili wako umehifadhiwa kwenye kifaa hiki.",
        }
    : {
        title: "Jiandikishe kwenye mkutano",
        description: "Tumia jina la kuonyesha ili kushiriki kwenye mkutano.",
      };

  return (
    <Card className="gap-5 overflow-hidden rounded-2xl shadow-sm">
      <CardHeader>
        <CardHeading
          icon={hasCredential ? CheckCircle2 : UsersRound}
          tone={hasCredential ? "success" : "primary"}
          {...heading}
        />
      </CardHeader>

      <CardContent className="space-y-5">
        {hasCredential ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1">
                <p className="font-medium">Usajili umethibitishwa kwenye kifaa</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {canJoin
                    ? "Unaweza kuendelea kwenye chumba cha mkutano."
                    : "Utaweza kujiunga mara msimamizi atakapoanzisha mkutano. Acha ukurasa huu wazi."}
                </p>
              </div>
            </div>

            {canJoin && (
              <Button type="button" onClick={onJoin} className="h-11 w-full gap-2 rounded-xl">
                <Video className="size-4" />
                Jiunge na Mkutano
                <ArrowRight className="ml-auto size-4" />
              </Button>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="meeting-display-name">Jina la kuonyesha</Label>
              <Input
                id="meeting-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Mfano: Juma Hassan"
                autoComplete="name"
                maxLength={100}
                disabled={isRegistering}
                className="h-11 rounded-xl"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Huhitaji akaunti ili kujisajili kwa mkutano huu.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isRegistering || !displayName.trim()}
              className="h-11 w-full gap-2 rounded-xl"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Inasajili...
                </>
              ) : (
                <>
                  Jiandikishe
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        )}

        <Separator />

        <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
          <p>
            Usajili wako huhifadhiwa kwenye kifaa na kivinjari hiki. Tumia hivyo hivyo
            kurudi kwenye mkutano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ended / cancelled                                                         */
/* -------------------------------------------------------------------------- */

function MeetingUnavailable({
  meeting,
  cancelled,
}: {
  meeting: Meeting;
  cancelled: boolean;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl border-border/70 py-0 shadow-sm">
      <div className={cn("h-1.5", cancelled ? "bg-destructive" : "bg-muted-foreground/40")} />

      <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:px-10 sm:py-16">
        <div
          className={cn(
            "mb-5 flex size-16 items-center justify-center rounded-2xl",
            cancelled ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
          )}
        >
          {cancelled ? <XCircle className="size-8" /> : <CheckCircle2 className="size-8" />}
        </div>

        <div className="mb-4">
          <StatusBadge status={meeting.status} />
        </div>

        <h1 className="max-w-xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {meeting.title}
        </h1>

        <p className="mt-3 max-w-md text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
          {cancelled
            ? "Mkutano huu umeghairishwa na haupatikani kwa ajili ya kushiriki."
            : "Mkutano huu umekamilika. Asante kwa kushiriki nasi."}
        </p>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted/50 p-4 text-left text-sm text-muted-foreground">
          <CalendarDays className="mt-0.5 size-4 shrink-0" />
          <span>{formatDateTime(meeting.scheduledStartAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function MeetingLobby({
  meeting: initialMeeting,
  backHref = "/",
}: {
  meeting: Meeting;
  /** Where "Rudi nyuma" goes when there is no browser history to return to. */
  backHref?: string;
}) {
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, startRegisterTransition] = useTransition();
  const [joined, setJoined] = useState(false);

  const { hasCredential, saveCredential } = useMeetingCredential(meeting.id);

  const isScheduled = meeting.status === "scheduled";
  const isLive = meeting.status === "live";

  const countdown = useCountdown(meeting.scheduledStartAt, isScheduled);

  // Poll while the user is waiting in the lobby, so a host starting the
  // meeting is picked up without a manual refresh.
  useMeetingStatusPolling(
    meeting.id,
    (isScheduled || isLive) && !joined,
    setMeeting,
  );

  // Announce the moment a scheduled meeting goes live.
  const previousStatus = useRef(meeting.status);
  useEffect(() => {
    if (previousStatus.current === "scheduled" && meeting.status === "live") {
      toast.info("Mkutano umeanza. Unaweza kujiunga sasa.");
    }
    previousStatus.current = meeting.status;
  }, [meeting.status]);

  function handleRegister() {
    const name = displayName.trim();
    if (!name) {
      toast.error("Tafadhali ingiza jina lako la kuonyesha.");
      return;
    }

    startRegisterTransition(async () => {
      try {
        const result = await registerAnonymousForMeetingAction({
          meetingId: meeting.id,
          displayName: name,
        });

        if (!result.success || !result.data?.rawToken) {
          toast.error(result.message || "Usajili haukuwezekana.");
          return;
        }

        if (!saveCredential(result.data.rawToken)) {
          toast.error("Kivinjari chako kimezuia kuhifadhi taarifa za usajili.");
          return;
        }

        toast.success("Umejiandikisha kwa mafanikio.");
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  /* ----------------------------- ended / cancelled ------------------------ */

  if (meeting.status === "cancelled" || meeting.status === "ended") {
    return (
      <main className="min-h-[70vh] bg-linear-to-b from-muted/30 to-background px-4 py-6 sm:py-10">
        <div className="container mx-auto max-w-3xl space-y-6">
          <BackButton fallbackHref={backHref} />
          <MeetingUnavailable meeting={meeting} cancelled={meeting.status === "cancelled"} />
        </div>
      </main>
    );
  }

  /* --------------------------------- room -------------------------------- */

  if (isLive && joined) {
    return <MeetingRoom meetingId={meeting.id} meeting={meeting} />;
  }

  /* --------------------------------- lobby -------------------------------- */

  const registrationPanel = (
    <RegistrationPanel
      canJoin={isLive}
      displayName={displayName}
      setDisplayName={setDisplayName}
      hasCredential={hasCredential}
      isRegistering={isRegistering}
      onRegister={handleRegister}
      onJoin={() => setJoined(true)}
    />
  );

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-linear-to-b from-muted/30 via-background to-background px-4 py-6 sm:py-10 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 z-0 size-80 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="container relative z-10 mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <BackButton fallbackHref={backHref} />

        <LobbyHeader meeting={meeting} />

        {isScheduled ? (
          <>
            <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-2">
              <CountdownPanel countdown={countdown} />
              {registrationPanel}
            </div>
            <PreparationSteps scheduledStartAt={meeting.scheduledStartAt} />
          </>
        ) : isLive ? (
          <div className="mx-auto grid max-w-4xl items-start gap-5 sm:gap-6 lg:grid-cols-2">
            {/* On phones the action (registration / join) comes first. */}
            <div className="order-2 lg:order-1">
              <LiveInfoCard />
            </div>
            <div className="order-1 lg:order-2">{registrationPanel}</div>
          </div>
        ) : (
          <Card className="mx-auto max-w-2xl rounded-2xl">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <AlertCircle className="mb-4 size-8 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Hali ya mkutano haijulikani</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Hali ya sasa ya mkutano haiungi mkono lobby hii.
              </p>
            </CardContent>
          </Card>
        )}

        <footer className="border-t pt-5 text-center">
          <p className="text-xs leading-5 text-muted-foreground">
            Jukwaa la Mikutano Hai, Mlele DC
          </p>
        </footer>
      </div>
    </main>
  );
}
