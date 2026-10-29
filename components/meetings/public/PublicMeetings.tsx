"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getPublicMeetingAction,
  listMeetingsAction,
  registerAnonymousForMeetingAction,
} from "@/lib/actions/meeting.actions";
import type { Meeting, MeetingSummary } from "@/lib/types/meeting";
import { MEETING_STATUS_LABELS } from "@/lib/types/meeting";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CalendarClock,
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
} from "lucide-react";

const CREDENTIAL_KEY = (id: string) => `meeting-credential-${id}`;
const getMeetingLobbyPath = (meetingId: string) =>
  `/public/live/meeting/${encodeURIComponent(meetingId)}`;

type MeetingStatusFilter = "all" | Meeting["status"];

const STATUS_FILTERS: { value: MeetingStatusFilter; label: string }[] = [
  { value: "all", label: "Mikutano yote" },
  { value: "live", label: "Inaendelea" },
  { value: "scheduled", label: "Imepangwa" },
  { value: "ended", label: "Imemalizika" },
  { value: "cancelled", label: "Imeghairishwa" },
];

function formatDateTime(isoString: string) {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    return new Intl.DateTimeFormat("sw-TZ", {
      timeZone: "Africa/Dar_es_Salaam",
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "live":
      return "default" as const;
    case "scheduled":
      return "secondary" as const;
    case "ended":
      return "outline" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function hasMeetingCredential(meetingId: string) {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(CREDENTIAL_KEY(meetingId)));
}

function SectionHeading() {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
        <Radio className="size-4" />
        <span>Mawasiliano ya moja kwa moja</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        Mikutano <span className="text-primary">Hai</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
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

function MeetingsSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Inapakia mikutano"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden rounded-2xl border-border/60">
          <div className="h-1.5 animate-pulse bg-muted" />
          <CardHeader className="space-y-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-px bg-border" />
            <div className="flex gap-3">
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyMeetings({ filtered = false, onReset }: { filtered?: boolean; onReset?: () => void }) {
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
            ? "Chagua status nyingine ili kuona mikutano iliyopo."
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

function MeetingCard({
  meeting,
  isRegistered,
  onOpenDetails,
  onJoin,
}: {
  meeting: MeetingSummary;
  isRegistered: boolean;
  onOpenDetails: (meetingId: string) => void;
  onJoin: (meeting: MeetingSummary) => void;
}) {
  const isLive = meeting.status === "live";
  const isScheduled = meeting.status === "scheduled";
  const isEnded = meeting.status === "ended";
  const isCancelled = meeting.status === "cancelled";

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div
        className={`h-1.5 w-full ${
          isLive
            ? "bg-emerald-500"
            : isScheduled
              ? "bg-primary/60"
              : isCancelled
                ? "bg-destructive/70"
                : "bg-muted-foreground/30"
        }`}
      />
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant={getStatusVariant(meeting.status)}
            className={
              isLive
                ? "gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                : "gap-1.5"
            }
          >
            {isLive && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            )}
            {!isLive && isScheduled && <CalendarClock className="size-3.5" />}
            {MEETING_STATUS_LABELS[meeting.status]}
          </Badge>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <UsersRound className="size-3.5" /> {meeting.participantCount} washiriki
          </span>
        </div>
        <CardTitle className="line-clamp-2 min-h-14 text-xl font-semibold leading-7 tracking-tight transition-colors group-hover:text-primary">
          {meeting.title}
        </CardTitle>
        <CardDescription className="flex items-start gap-2 text-sm leading-6">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{formatDateTime(meeting.scheduledStartAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5 pt-2">
        <p className="line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">
          {meeting.description?.trim() || "Fungua maelezo ya mkutano ili kupata taarifa zaidi kuhusu mkutano huu."}
        </p>
        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <Clock3 className="size-3.5 shrink-0" />
            <span>
              {isLive
                ? "Mkutano unaendelea sasa"
                : isScheduled
                  ? "Mkutano uliopangwa"
                  : isEnded
                    ? "Mkutano umekamilika"
                    : "Mkutano umeghairishwa"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-w-0 flex-1 gap-2 rounded-xl" onClick={() => onOpenDetails(meeting.id)}>
              <Info className="size-4 shrink-0" /> <span>Maelezo</span>
            </Button>
            {isEnded ? (
              <Button type="button" variant="secondary" className="min-w-0 flex-1 rounded-xl" disabled>Imemalizika</Button>
            ) : isCancelled ? (
              <Button type="button" variant="destructive" className="min-w-0 flex-1 rounded-xl" disabled>Imeghairishwa</Button>
            ) : (
              <Button
                type="button"
                className="min-w-0 flex-1 gap-2 rounded-xl"
                onClick={() => onJoin(meeting)}
              >
                {isLive ? <Video className="size-4 shrink-0" /> : <ArrowRight className="size-4 shrink-0" />}
                <span className="truncate">
                  {isLive ? "Jiunge" : isRegistered ? "Fungua Lobby" : "Jiandikishe"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PublicMeetings({
  initialMeetings = [],
}: {
  initialMeetings?: MeetingSummary[];
} = {}) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingSummary[]>(initialMeetings);
  const [loading, setLoading] = useState(initialMeetings.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MeetingStatusFilter>("all");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<Record<string, boolean>>({});
  const [registering, startRegisterTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");

  const loadMeetings = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const result = await listMeetingsAction({});
      if (!result.success) {
        setError(result.message ?? "Imeshindwa kupakia mikutano.");
        return;
      }

      // Do not filter by status here: the public page must show historical meetings too.
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
    void loadMeetings(initialMeetings.length === 0);
  }, [loadMeetings, initialMeetings.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const statuses: Record<string, boolean> = {};
    meetings.forEach((meeting) => {
      statuses[meeting.id] = Boolean(window.localStorage.getItem(CREDENTIAL_KEY(meeting.id)));
    });
    setRegistrationStatus(statuses);
  }, [meetings]);

  const meetingCounts = useMemo(() => {
    const counts: Record<MeetingStatusFilter, number> = {
      all: meetings.length,
      scheduled: 0,
      live: 0,
      ended: 0,
      cancelled: 0,
    };
    meetings.forEach((meeting) => {
      counts[meeting.status] += 1;
    });
    return counts;
  }, [meetings]);

  const visibleMeetings = useMemo(() => {
    const priority: Record<MeetingSummary["status"], number> = {
      live: 0,
      scheduled: 1,
      ended: 2,
      cancelled: 3,
    };
    return meetings
      .filter((meeting) => statusFilter === "all" || meeting.status === statusFilter)
      .slice()
      .sort((a, b) => {
        const statusDifference = priority[a.status] - priority[b.status];
        if (statusDifference !== 0) return statusDifference;
        const aTime = new Date(a.scheduledStartAt).getTime();
        const bTime = new Date(b.scheduledStartAt).getTime();
        if (a.status === "ended" || a.status === "cancelled") return bTime - aTime;
        return aTime - bTime;
      });
  }, [meetings, statusFilter]);

  async function openDetails(meetingId: string) {
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
    }
  }

  function handleRegister() {
    if (!selectedMeeting) return;
    if (!displayName.trim()) {
      toast.error("Tafadhali ingiza jina lako la kuonyesha.");
      return;
    }

    startRegisterTransition(async () => {
      try {
        const result = await registerAnonymousForMeetingAction({
          meetingId: selectedMeeting.id,
          displayName: displayName.trim(),
        });
        if (!result.success || !result.data?.rawToken) {
          toast.error(result.message ?? "Usajili haukuwezekana.");
          return;
        }

        window.localStorage.setItem(CREDENTIAL_KEY(selectedMeeting.id), result.data.rawToken);
        setRegistrationStatus((previous) => ({ ...previous, [selectedMeeting.id]: true }));
        toast.success("Umejiandikisha kwa mafanikio.");
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  function handleJoin(meeting: MeetingSummary) {
    if (meeting.status === "live") {
      if (registrationStatus[meeting.id] || hasMeetingCredential(meeting.id)) {
        router.push(getMeetingLobbyPath(meeting.id));
      } else {
        toast.error("Lazima ujiandikishe ili kujiunga na mkutano unaoendelea.");
      }
      return;
    }
    if (meeting.status === "scheduled") router.push(getMeetingLobbyPath(meeting.id));
  }

  function handleDialogJoin() {
    if (!selectedMeeting) return;
    if (selectedMeeting.status === "live") {
      if (registrationStatus[selectedMeeting.id] || hasMeetingCredential(selectedMeeting.id)) {
        router.push(getMeetingLobbyPath(selectedMeeting.id));
      } else {
        toast.error("Lazima ujiandikishe ili kujiunga na mkutano unaoendelea.");
      }
      return;
    }
    if (selectedMeeting.status === "scheduled") router.push(getMeetingLobbyPath(selectedMeeting.id));
  }

  const selectedIsRegistered = selectedMeeting
    ? Boolean(registrationStatus[selectedMeeting.id] || hasMeetingCredential(selectedMeeting.id))
    : false;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-primary/6 via-primary/2.5 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading />
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Mikutano yote</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? "Inapakia taarifa..." : `${visibleMeetings.length} kati ya ${meetings.length} mikutano`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-2 rounded-xl"
                onClick={() => void loadMeetings(false)}
                disabled={loading || refreshing}
              >
                <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Inasasisha..." : "Sasisha taarifa"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Chuja mikutano kwa status">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  className="gap-2 rounded-full"
                  onClick={() => setStatusFilter(filter.value)}
                  aria-pressed={statusFilter === filter.value}
                >
                  {filter.label}
                  <Badge variant="secondary" className="min-w-6 justify-center rounded-full px-1.5">
                    {meetingCounts[filter.value]}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <MeetingsSkeleton />
          ) : error ? (
            <Card className="overflow-hidden rounded-2xl border-destructive/20">
              <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
                  <AlertCircle className="size-7 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">Imeshindikana kupakia mikutano</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{error}</p>
                <Button type="button" className="mt-6 gap-2 rounded-xl" onClick={() => void loadMeetings()}>
                  <RefreshCw className="size-4" /> Jaribu tena
                </Button>
              </CardContent>
            </Card>
          ) : meetings.length === 0 ? (
            <EmptyMeetings />
          ) : visibleMeetings.length === 0 ? (
            <EmptyMeetings filtered onReset={() => setStatusFilter("all")} />
          ) : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  isRegistered={Boolean(registrationStatus[meeting.id])}
                  onOpenDetails={openDetails}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 sm:mt-12 sm:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Taarifa kwa washiriki</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Kwa mikutano inayohitaji usajili, tumia jina lako la kuonyesha kabla ya kujiunga. Ikiwa tayari umejiandikisha kwenye kifaa hiki, unaweza kufungua lobby kupitia taarifa za mkutano husika.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDisplayName("");
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
          {selectedMeeting && (
            <>
              <div className="relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-primary/4 to-transparent px-6 pb-5 pt-7 sm:px-7">
                <div className="mb-4 flex items-center gap-2">
                  <Badge
                    variant={getStatusVariant(selectedMeeting.status)}
                    className={selectedMeeting.status === "live" ? "gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : ""}
                  >
                    {selectedMeeting.status === "live" && <span className="size-2 animate-pulse rounded-full bg-emerald-500" />}
                    {MEETING_STATUS_LABELS[selectedMeeting.status]}
                  </Badge>
                  {selectedMeeting.status === "live" && (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Unaendelea sasa</span>
                  )}
                </div>
                <DialogHeader className="space-y-3 text-left">
                  <DialogTitle className="pr-5 text-2xl font-bold leading-tight tracking-tight">{selectedMeeting.title}</DialogTitle>
                  <DialogDescription className="flex items-start gap-2 text-sm leading-6">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{formatDateTime(selectedMeeting.scheduledStartAt)}</span>
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-7">
                {selectedMeeting.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Kuhusu mkutano</h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{selectedMeeting.description}</p>
                  </div>
                )}

                {selectedMeeting.status === "scheduled" && (
                  <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
                    {selectedIsRegistered ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">Usajili umekamilika</h3>
                            <p className="text-sm leading-6 text-muted-foreground">Tayari umejiandikisha kwa mkutano huu. Unaweza kuendelea kwenda kwenye lobby.</p>
                          </div>
                        </div>
                        <Button type="button" className="w-full gap-2 rounded-xl" onClick={handleDialogJoin}>Fungua Lobby <ArrowRight className="size-4" /></Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="size-5 text-primary" /></div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">Jiandikishe kushiriki</h3>
                            <p className="text-sm leading-6 text-muted-foreground">Weka jina litakaloonekana kwa washiriki wengine unapoungana na mkutano.</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meeting-display-name">Jina la kuonyesha</Label>
                          <Input
                            id="meeting-display-name"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            placeholder="Mfano: Juma Hassan"
                            autoComplete="name"
                            maxLength={100}
                            disabled={registering}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !registering) {
                                event.preventDefault();
                                handleRegister();
                              }
                            }}
                            className="h-11 rounded-xl bg-background"
                          />
                          <p className="text-xs leading-5 text-muted-foreground">Akaunti haihitajiki kwa usajili huu.</p>
                        </div>
                        <Button type="button" className="w-full gap-2 rounded-xl" onClick={handleRegister} disabled={registering || !displayName.trim()}>
                          {registering ? <><Loader2 className="size-4 animate-spin" /> Inasajili...</> : <>Jiandikishe <ArrowRight className="size-4" /></>}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {selectedMeeting.status === "live" && (
                  <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Video className="size-5 text-primary" /></div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Mkutano unaendelea</h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {selectedIsRegistered ? "Umejiandikisha. Unaweza kuendelea kujiunga na mkutano." : "Unahitaji kujiandikisha ili kujiunga na mkutano unaoendelea."}
                        </p>
                      </div>
                    </div>
                    {selectedIsRegistered ? (
                      <Button type="button" className="w-full gap-2 rounded-xl" onClick={handleDialogJoin}><Video className="size-4" /> Jiunge na Mkutano</Button>
                    ) : (
                      <Button type="button" variant="outline" className="w-full gap-2 rounded-xl" onClick={() => router.push(getMeetingLobbyPath(selectedMeeting.id))}>Jiandikishe kisha Jiunge <ArrowRight className="size-4" /></Button>
                    )}
                  </div>
                )}

                {selectedMeeting.status === "ended" && (
                  <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-semibold">Mkutano umekamilika</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Mkutano huu umemalizika na hauwezi kuunganishwa tena kupitia ukurasa huu.</p>
                    </div>
                  </div>
                )}

                {selectedMeeting.status === "cancelled" && (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div>
                      <h3 className="text-sm font-semibold">Mkutano umeghairishwa</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Mkutano huu umeghairishwa na haupatikani kwa ajili ya kujiunga.</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t bg-muted/10 px-6 py-4 sm:px-7">
                <Button type="button" variant="outline" className="w-full gap-2 rounded-xl sm:w-auto" onClick={() => setDetailOpen(false)}><X className="size-4" /> Funga</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
