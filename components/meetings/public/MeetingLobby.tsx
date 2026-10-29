
"use client";

import { useEffect, useState, useTransition } from "react";
import type { Meeting } from "@/lib/types/meeting";
import { MEETING_STATUS_LABELS } from "@/lib/types/meeting";

import {
  registerAnonymousForMeetingAction,
} from "@/lib/actions/meeting.actions";

import MeetingRoom from "@/components/meetings/room/MeetingRoom";

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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

const CREDENTIAL_KEY = (id: string) => `meeting-credential-${id}`;

function formatDateTime(isoString: string) {
  try {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return isoString;
    }

    return new Intl.DateTimeFormat("sw-TZ", {
      timeZone: "Africa/Dar_es_Salaam",
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

function getStatusLabel(status: Meeting["status"]) {
  return MEETING_STATUS_LABELS[status] ?? status;
}

function getStatusStyles(status: Meeting["status"]) {
  switch (status) {
    case "live":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

    case "scheduled":
      return "border-primary/20 bg-primary/10 text-primary";

    case "ended":
      return "border-border bg-muted text-muted-foreground";

    case "cancelled":
      return "border-destructive/20 bg-destructive/10 text-destructive";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function LobbyHeader({ meeting }: { meeting: Meeting }) {
  const isLive = meeting.status === "live";

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div
        className={`absolute inset-x-0 top-0 h-1.5 ${
          isLive ? "bg-emerald-500" : "bg-primary"
        }`}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full px-3 py-1"
              >
                <Video className="size-3.5" />
                Live Meetings
              </Badge>

              <Badge
                variant="outline"
                className={`gap-1.5 rounded-full px-3 py-1 ${getStatusStyles(
                  meeting.status,
                )}`}
              >
                {isLive ? (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}

                {getStatusLabel(meeting.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {meeting.title}
              </h1>

              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {meeting.description?.trim() ||
                  "Karibu kwenye jukwaa la mikutano ya moja kwa moja. Pata taarifa za mkutano na ujiunge utakapokuwa tayari."}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
              <span className="inline-flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{formatDateTime(meeting.scheduledStartAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border bg-primary/5 text-primary sm:size-20">
            {isLive ? (
              <Radio className="size-8 sm:size-10" />
            ) : (
              <CalendarClock className="size-8 sm:size-10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CountdownUnit({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border bg-background px-2 py-4 sm:px-4 sm:py-5">
      <span className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
        {value}
      </span>
      <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function CountdownPanel({
  mins,
  secs,
  remaining,
}: {
  mins: number;
  secs: number;
  remaining: number;
}) {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg">Muda wa kuanza</CardTitle>
            <CardDescription>
              Hesabu ya kurudi nyuma hadi muda uliopangwa
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {remaining > 0 ? (
          <>
            <div className="flex gap-3">
              <CountdownUnit
                value={String(hours).padStart(2, "0")}
                label="Saa"
              />
              <CountdownUnit
                value={String(minutes).padStart(2, "0")}
                label="Dakika"
              />
              <CountdownUnit
                value={String(secs).padStart(2, "0")}
                label="Sekunde"
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm leading-6 text-muted-foreground">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Muda huu ni wa kuhesabu hadi wakati uliopangwa. Msimamizi
                ndiye atakayeanzisha mkutano.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <div className="space-y-1">
              <p className="font-medium">Tunasubiri kuanza</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Muda uliopangwa umefika. Subiri msimamizi aanzishe mkutano.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegistrationPanel({
  displayName,
  setDisplayName,
  hasCredential,
  isRegistering,
  onRegister,
  onJoin,
}: {
  displayName: string;
  setDisplayName: (value: string) => void;
  hasCredential: boolean;
  isRegistering: boolean;
  onRegister: () => void;
  onJoin: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {hasCredential ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <UsersRound className="size-5" />
            )}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg">
              {hasCredential ? "Uko tayari kujiunga" : "Jiandikishe kwenye mkutano"}
            </CardTitle>
            <CardDescription>
              {hasCredential
                ? "Usajili wako umetambuliwa kwenye kifaa hiki."
                : "Tumia jina la kuonyesha ili kushiriki kwenye mkutano."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {hasCredential ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

              <div className="space-y-1">
                <p className="font-medium">Usajili umethibitishwa kwenye kifaa</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Unaweza kuendelea kwenye chumba cha mkutano.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={onJoin}
              className="h-11 w-full gap-2 rounded-xl"
            >
              <Video className="size-4" />
              Jiunge na Mkutano
              <ArrowRight className="ml-auto size-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="meeting-display-name">
                Jina la kuonyesha
              </Label>

              <Input
                id="meeting-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Mfano: Juma Hassan"
                autoComplete="name"
                maxLength={100}
                disabled={isRegistering}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isRegistering) {
                    event.preventDefault();
                    onRegister();
                  }
                }}
                className="h-11 rounded-xl"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Huhitaji akaunti ili kujisajili kwa mkutano huu.
              </p>
            </div>

            <Button
              type="button"
              onClick={onRegister}
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
                  Jiandikishe kisha Jiunge
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </>
        )}

        <Separator />

        <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
          <p>
            Hifadhi taarifa zako za usajili kwenye kifaa chako ili uweze
            kuendelea na mkutano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MeetingUnavailable({
  meeting,
  cancelled,
}: {
  meeting: Meeting;
  cancelled: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
        <div
          className={`h-1.5 ${
            cancelled ? "bg-destructive" : "bg-muted-foreground/40"
          }`}
        />

        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-16">
          <div
            className={`mb-5 flex size-16 items-center justify-center rounded-2xl ${
              cancelled
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cancelled ? (
              <XCircle className="size-8" />
            ) : (
              <CheckCircle2 className="size-8" />
            )}
          </div>

          <Badge
            variant="outline"
            className={`mb-4 rounded-full ${getStatusStyles(meeting.status)}`}
          >
            {getStatusLabel(meeting.status)}
          </Badge>

          <h1 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            {meeting.title}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
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
    </div>
  );
}

export function MeetingLobby({
  meeting: initialMeeting,
}: {
  meeting: Meeting;
}) {
  const [meeting] = useState<Meeting>(initialMeeting);
  const [now, setNow] = useState(Date.now());
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, startRegisterTransition] = useTransition();
  const [hasCredential, setHasCredential] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const credential =
      typeof window !== "undefined"
        ? localStorage.getItem(CREDENTIAL_KEY(meeting.id))
        : null;

    setHasCredential(Boolean(credential));
  }, [meeting.id]);

  const start = new Date(meeting.scheduledStartAt).getTime();
  const remaining = Number.isFinite(start) ? Math.max(0, start - now) : 0;
  const totalSeconds = Math.floor(remaining / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  function handleRegister() {
    if (!displayName.trim()) {
      toast.error("Tafadhali ingiza jina lako la kuonyesha.");
      return;
    }

    startRegisterTransition(async () => {
      try {
        const result = await registerAnonymousForMeetingAction({
          meetingId: meeting.id,
          displayName: displayName.trim(),
        });

        if (!result.success || !result.data?.rawToken) {
          toast.error(result.message || "Usajili haukuwezekana.");
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(
            CREDENTIAL_KEY(meeting.id),
            result.data.rawToken,
          );
        }

        setHasCredential(true);
        toast.success("Umejiandikisha kwa mafanikio.");
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  function handleJoin() {
    setJoined(true);
  }

  if (meeting.status === "cancelled" || meeting.status === "ended") {
    return (
      <main className="min-h-[70vh] bg-linear-to-b from-muted/30 to-background px-4 py-10 sm:py-16">
        <div className="container mx-auto">
          <MeetingUnavailable
            meeting={meeting}
            cancelled={meeting.status === "cancelled"}
          />
        </div>
      </main>
    );
  }

  if (meeting.status === "live" && joined) {
    return <MeetingRoom meetingId={meeting.id} meeting={meeting} />;
  }

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-linear-to-b from-muted/30 via-background to-background px-4 py-8 sm:py-12 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 z-0 size-80 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="container relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="size-4 text-primary" />
            Karibu kwenye jukwaa la mikutano
          </div>

          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Pata taarifa za mkutano na jiandae kushiriki.
          </p>
        </div>

        <LobbyHeader meeting={meeting} />

        {meeting.status === "scheduled" ? (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <CountdownPanel
              mins={mins}
              secs={secs}
              remaining={remaining}
            />

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="size-5" />
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Maandalizi ya mkutano
                    </CardTitle>
                    <CardDescription>
                      Taarifa muhimu kabla ya kuanza
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Muda wa mkutano</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {formatDateTime(meeting.scheduledStartAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border p-4">
                  <Radio className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Kuanza kwa mkutano</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Mkutano utaanza pale msimamizi atakapouanzisha.
                      Kufika kwa muda uliopangwa pekee hakuanzishi mkutano
                      moja kwa moja.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border p-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Usajili wa mshiriki</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Fuata hatua za usajili pale zinapoombwa ili uweze
                      kujiunga na mkutano.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : meeting.status === "live" ? (
          <div className="mx-auto grid max-w-4xl items-start gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden rounded-2xl border-emerald-500/20 shadow-sm">
              <div className="h-1.5 bg-emerald-500" />

              <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Radio className="size-6" />
                </div>

                <CardTitle className="text-xl">
                  Mkutano unaendelea sasa
                </CardTitle>

                <CardDescription className="leading-6">
                  Jitayarishe kujiunga na washiriki wengine kwenye chumba
                  cha mkutano.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />

                  <p className="text-sm leading-6 text-muted-foreground">
                    Unahitaji usajili halali kwenye kifaa hiki ili kufungua
                    chumba cha mkutano.
                  </p>
                </div>
              </CardContent>
            </Card>

            <RegistrationPanel
              displayName={displayName}
              setDisplayName={setDisplayName}
              hasCredential={hasCredential}
              isRegistering={isRegistering}
              onRegister={handleRegister}
              onJoin={handleJoin}
            />
          </div>
        ) : (
          <Card className="mx-auto max-w-2xl rounded-2xl">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <AlertCircle className="mb-4 size-8 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                Hali ya mkutano haijulikani
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Hali ya sasa ya mkutano haiungi mkono lobby hii.
              </p>
            </CardContent>
          </Card>
        )}

        <footer className="border-t pt-5 text-center">
          <p className="text-xs leading-5 text-muted-foreground">
            Jukwaa la Mikutano Hai · Mlele DC
          </p>
        </footer>
      </div>
    </main>
  );
}
