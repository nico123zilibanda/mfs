"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  Clock3,
  ExternalLink,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Square,
  Trash2,
  Users,
  Video,
  XCircle,
} from "lucide-react";

import {
  createMeetingAction,
  listMeetingsAction,
  updateMeetingAction,
  cancelMeetingAction,
  startMeetingAction,
  endMeetingAction,
  listMeetingRegistrationsAction,
  deleteMeetingAction,
} from "@/lib/actions/meeting.actions";
import type { MeetingSummary, MeetingRegistration } from "@/lib/types/meeting";
import { MEETING_STATUS_LABELS } from "@/lib/types/meeting";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CreateMeetingFormValues = {
  title: string;
  description: string | null;
  scheduledStartAt?: string;
};

type EditMeetingFormValues = {
  title?: string;
  description?: string | null;
  scheduledStartAt?: string;
};

type MeetingFilter = "all" | "scheduled" | "live" | "ended" | "cancelled";

const MEETING_LOBBY_PATH = (meetingId: string) =>
  `/public/live/meeting/${encodeURIComponent(meetingId)}`;

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat("sw-TZ", {
    timeZone: "Africa/Dar_es_Salaam",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusVariant(status: string) {
  switch (status) {
    case "live":
      return "default" as const;
    case "scheduled":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function combineDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  const localDateTime = new Date(`${date}T${time}`);
  return Number.isNaN(localDateTime.getTime()) ? "" : localDateTime.toISOString();
}

function toDateInputValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
  detail: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMeetingsManagement({
  initialMeetings = [],
}: {
  initialMeetings?: MeetingSummary[];
}) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingSummary[]>(initialMeetings);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, startCreateTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [editingMeeting, setEditingMeeting] = useState<MeetingSummary | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<MeetingSummary | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingSummary | null>(null);
  const [registrations, setRegistrations] = useState<MeetingRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<MeetingFilter>("all");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const createForm = useForm<CreateMeetingFormValues>({
    defaultValues: { title: "", description: null, scheduledStartAt: "" },
  });
  const editForm = useForm<EditMeetingFormValues>({
    defaultValues: { title: "", description: null },
  });

  const filteredMeetings = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return meetings.filter((meeting) => {
      const matchesStatus = filter === "all" || meeting.status === filter;
      const matchesQuery =
        !query ||
        meeting.title.toLocaleLowerCase().includes(query) ||
        (meeting.description ?? "").toLocaleLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [meetings, searchQuery, filter]);

  const stats = useMemo(
    () => ({
      all: meetings.length,
      scheduled: meetings.filter((meeting) => meeting.status === "scheduled").length,
      live: meetings.filter((meeting) => meeting.status === "live").length,
      ended: meetings.filter((meeting) => meeting.status === "ended").length,
    }),
    [meetings],
  );

  async function refreshMeetings() {
    startRefreshTransition(async () => {
      try {
        const result = await listMeetingsAction({});
        if (result.success) {
          setMeetings(result.data.meetings);
        } else {
          toast.error(result.message ?? "Orodha haikuweza kusasishwa.");
        }
      } catch {
        toast.error("Hitilafu imetokea wakati wa kusasisha.");
      }
    });
  }

  async function onCreateSubmit(values: CreateMeetingFormValues) {
    const scheduledStartAt = combineDateTime(createDate, createTime);
    if (!scheduledStartAt) {
      toast.error("Tafadhali chagua tarehe na saa sahihi.");
      return;
    }

    startCreateTransition(async () => {
      try {
        const result = await createMeetingAction({
          ...values,
          description: values.description || null,
          scheduledStartAt,
        });
        if (!result.success) {
          Object.entries(result.errors ?? {}).forEach(([field, messages]) => {
            if (messages?.[0]) {
              createForm.setError(field as keyof CreateMeetingFormValues, {
                type: "server",
                message: messages[0],
              });
            }
          });
          toast.error(result.message ?? "Mkutano haukuweza kuundwa.");
          return;
        }
        toast.success("Mkutano umeundwa kwa mafanikio.");
        createForm.reset({ title: "", description: null, scheduledStartAt: "" });
        setCreateDate("");
        setCreateTime("");
        setIsCreateOpen(false);
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  function openEditDialog(meeting: MeetingSummary) {
    if (meeting.status !== "scheduled") {
      toast.error("Mikutano inayoweza kuhaririwa ni ile iliyoandaliwa tu.");
      return;
    }
    setEditingMeeting(meeting);
    editForm.reset({ title: meeting.title, description: meeting.description });
    setEditDate(toDateInputValue(meeting.scheduledStartAt));
    setEditTime(toTimeInputValue(meeting.scheduledStartAt));
  }

  async function onEditSubmit(values: EditMeetingFormValues) {
    if (!editingMeeting) return;
    const scheduledStartAt = combineDateTime(editDate, editTime);
    if (!scheduledStartAt) {
      toast.error("Tafadhali chagua tarehe na saa sahihi.");
      return;
    }

    startActionTransition(async () => {
      try {
        const result = await updateMeetingAction({
          id: editingMeeting.id,
          title: values.title,
          description: values.description || null,
          scheduledStartAt,
        });
        if (!result.success) {
          Object.entries(result.errors ?? {}).forEach(([field, messages]) => {
            if (messages?.[0]) {
              editForm.setError(field as keyof EditMeetingFormValues, {
                type: "server",
                message: messages[0],
              });
            }
          });
          toast.error(result.message ?? "Mkutano haukuweza kuhaririwa.");
          return;
        }
        toast.success("Mkutano umehaririwa kwa mafanikio.");
        setEditingMeeting(null);
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  async function handleCancel(meeting: MeetingSummary) {
    if (meeting.status !== "scheduled") {
      toast.error("Mikutano inayoweza kughairiwa ni ile iliyoandaliwa tu.");
      return;
    }
    startActionTransition(async () => {
      try {
        const result = await cancelMeetingAction({ id: meeting.id });
        if (!result.success) {
          toast.error(result.message ?? "Mkutano haukuweza kughairiwa.");
          return;
        }
        toast.success("Mkutano umeghairiwa kwa mafanikio.");
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  async function handleStart(meeting: MeetingSummary) {
    if (meeting.status !== "scheduled") {
      toast.error("Mikutano inayoweza kuanzishwa ni ile iliyoandaliwa tu.");
      return;
    }
    startActionTransition(async () => {
      try {
        const result = await startMeetingAction({ id: meeting.id });
        if (!result.success) {
          toast.error(result.message ?? "Mkutano haukuweza kuanzishwa.");
          return;
        }
        toast.success("Mkutano umeanza. Unaweza kufungua ukurasa wa live.");
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  async function handleEnd(meeting: MeetingSummary) {
    if (meeting.status !== "live") {
      toast.error("Mikutano inayoweza kumalizwa ni ile inayoendelea tu.");
      return;
    }
    startActionTransition(async () => {
      try {
        const result = await endMeetingAction({ id: meeting.id });
        if (!result.success) {
          toast.error(result.message ?? "Mkutano haukuweza kumalizwa.");
          return;
        }
        toast.success("Mkutano umemalizika.");
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  async function openRegistrations(meeting: MeetingSummary) {
    setViewingRegistrations(meeting);
    setLoadingRegistrations(true);
    setRegistrations([]);
    try {
      const result = await listMeetingRegistrationsAction(meeting.id);
      if (result.success) {
        setRegistrations(result.data.registrations);
      } else {
        toast.error(result.message ?? "Usajili haukuweza kupakuliwa.");
      }
    } catch {
      toast.error("Hitilafu imetokea wakati wa kupakua usajili.");
    } finally {
      setLoadingRegistrations(false);
    }
  }

  async function handleDelete(meeting: MeetingSummary) {
    startActionTransition(async () => {
      try {
        const result = await deleteMeetingAction({ id: meeting.id });
        if (!result.success) {
          toast.error(result.message ?? "Mkutano haukuweza kufutwa.");
          setMeetingToDelete(null);
          return;
        }
        toast.success("Mkutano umefutwa kwa mafanikio.");
        setMeetingToDelete(null);
        await refreshMeetings();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
        setMeetingToDelete(null);
      }
    });
  }

  const isPending = isCreating || isRefreshing || isActionPending;
  const filters: { value: MeetingFilter; label: string; count: number }[] = [
    { value: "all", label: "Mikutano yote", count: stats.all },
    { value: "scheduled", label: "Iliyopangwa", count: stats.scheduled },
    { value: "live", label: "Live", count: stats.live },
    { value: "ended", label: "Iliyomalizika", count: stats.ended },
    { value: "cancelled", label: "Iliyoghairiwa", count: meetings.filter((m) => m.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Video className="size-4" />
            <span className="font-medium">Usimamizi wa mikutano</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mikutano Hai</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Unda na simamia ratiba, washiriki na mikutano ya moja kwa moja kutoka sehemu moja.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void refreshMeetings()} disabled={isPending} className="gap-2 rounded-xl">
            {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Sasisha
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 rounded-xl">
            <CirclePlus className="size-4" />
            Ongeza mkutano
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mikutano yote" value={stats.all} icon={CalendarDays} detail="Mikutano iliyorekodiwa" />
        <StatCard label="Iliyopangwa" value={stats.scheduled} icon={CalendarClock} detail="Inasubiri kuanza" />
        <StatCard label="Inaendelea live" value={stats.live} icon={Video} detail="Mikutano inayoendelea" />
        <StatCard label="Iliyomalizika" value={stats.ended} icon={CheckCircle2} detail="Mikutano iliyokamilika" />
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="gap-4 border-b bg-muted/15 pb-5">
          <div>
            <CardTitle className="text-lg">Orodha ya mikutano</CardTitle>
            <CardDescription className="mt-1">Tafuta mkutano, chagua hali, au tumia vitendo kwenye kila rekodi.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tafuta kwa kichwa au maelezo..." className="h-10 rounded-xl pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => (
                <Button key={item.value} type="button" size="sm" variant={filter === item.value ? "default" : "outline"} onClick={() => setFilter(item.value)} className="h-9 rounded-lg">
                  {item.label}<span className={filter === item.value ? "ml-1 rounded-md bg-primary-foreground/15 px-1.5 py-0.5 text-xs" : "ml-1 rounded-md bg-muted px-1.5 py-0.5 text-xs"}>{item.count}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted"><CalendarDays className="size-7 text-muted-foreground" /></div>
              <h3 className="font-semibold">Hakuna mikutano iliyopatikana</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">Jaribu kubadilisha utafutaji au kichujio, au ongeza mkutano mpya.</p>
              {searchQuery || filter !== "all" ? <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setFilter("all"); }}>Ondoa vichujio</Button> : null}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="min-w-57.5 pl-5">Mkutano</TableHead>
                    <TableHead>Hali</TableHead>
                    <TableHead className="min-w-42.5">Tarehe na saa</TableHead>
                    <TableHead>Washiriki</TableHead>
                    <TableHead className="min-w-72.5 pr-5 text-right">Vitendo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id} className="group">
                      <TableCell className="pl-5 py-4">
                        <div className="max-w-sm space-y-1.5">
                          <p className="font-semibold leading-5">{meeting.title}</p>
                          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{meeting.description?.trim() || "Hakuna maelezo yaliyowekwa."}</p>
                          <p className="font-mono text-[10px] text-muted-foreground/70">ID: {meeting.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(meeting.status)} className={meeting.status === "live" ? "gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400" : "whitespace-nowrap"}>
                          {meeting.status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />}
                          {MEETING_STATUS_LABELS[meeting.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm leading-5 text-muted-foreground">
                        <div className="flex items-start gap-2"><Clock3 className="mt-0.5 size-4 shrink-0 text-primary" /><span>{formatDateTime(meeting.scheduledStartAt)}</span></div>
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="sm" onClick={() => void openRegistrations(meeting)} disabled={isPending} className="gap-1.5 px-2 font-medium">
                          <Users className="size-4 text-muted-foreground" />{meeting.participantCount}
                        </Button>
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {meeting.status === "scheduled" && <>
                            <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5"><Pencil className="size-3.5" />Hariri</Button>
                            <Button type="button" size="sm" onClick={() => void handleStart(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5"><Play className="size-3.5" />Anzisha</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setMeetingToDelete(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" />Futa</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => void handleCancel(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5 text-muted-foreground"><XCircle className="size-3.5" />Ghairisha</Button>
                          </>}
                          {meeting.status === "live" && <>
                            <Button type="button" size="sm" onClick={() => router.push(MEETING_LOBBY_PATH(meeting.id))} className="h-8 gap-1.5 rounded-lg px-2.5"><ExternalLink className="size-3.5" />Ingia live</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => void handleEnd(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5"><Square className="size-3.5" />Maliza</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setMeetingToDelete(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" />Futa</Button>
                          </>}
                          {(meeting.status === "ended" || meeting.status === "cancelled") && <Button type="button" size="sm" variant="outline" onClick={() => setMeetingToDelete(meeting)} disabled={isPending} className="h-8 gap-1.5 rounded-lg px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" />Futa</Button>}
                          {meeting.status === "ended" && <Badge variant="outline" className="h-8 gap-1 rounded-lg px-2.5 font-normal"><CheckCircle2 className="size-3.5" />Imekamilika</Badge>}
                          {meeting.status === "cancelled" && <Badge variant="outline" className="h-8 gap-1 rounded-lg px-2.5 font-normal"><XCircle className="size-3.5" />Imeghairishwa</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex flex-col gap-2 border-t bg-muted/10 px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Inaonyesha {filteredMeetings.length} kati ya mikutano {meetings.length}.</span>
            <span className="inline-flex items-center gap-1.5"><ShieldAlert className="size-3.5" />Vitendo nyeti vinahitaji uthibitisho.</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!isCreating) setIsCreateOpen(open); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><CirclePlus className="size-5" /></div>
            <DialogTitle className="text-xl">Ongeza mkutano mpya</DialogTitle>
            <DialogDescription>Weka taarifa za mkutano na ratiba yake. Mkutano utaongezwa kama uliopangwa.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-5">
              <FormField control={createForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Kichwa cha mkutano *</FormLabel><FormControl><Input placeholder="Mfano: Mkutano wa wadau wa maendeleo" {...field} disabled={isCreating} className="h-11 rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Maelezo (si lazima)</FormLabel><FormControl><Textarea placeholder="Andika maelezo mafupi kuhusu madhumuni ya mkutano..." {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value || null)} disabled={isCreating} className="min-h-28 resize-y rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><FormLabel htmlFor="create-meeting-date">Tarehe *</FormLabel><Input id="create-meeting-date" type="date" value={createDate} onChange={(event) => setCreateDate(event.target.value)} disabled={isCreating} required className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><FormLabel htmlFor="create-meeting-time">Saa *</FormLabel><Input id="create-meeting-time" type="time" value={createTime} onChange={(event) => setCreateTime(event.target.value)} disabled={isCreating} required className="h-11 rounded-xl" /></div>
              </div>
              <div className="rounded-xl border bg-muted/25 p-3 text-xs leading-5 text-muted-foreground">Hakikisha tarehe na saa ni sahihi kabla ya kuunda mkutano.</div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Ghairi</Button>
                <Button type="submit" disabled={isCreating} className="gap-2">{isCreating ? <Loader2 className="size-4 animate-spin" /> : <CirclePlus className="size-4" />}{isCreating ? "Inaandaa..." : "Unda mkutano"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMeeting} onOpenChange={(open) => { if (!open && !isActionPending) setEditingMeeting(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-xl">
          <DialogHeader><DialogTitle className="text-xl">Hariri mkutano</DialogTitle><DialogDescription>Unaweza kuhariri taarifa za mkutano ambao bado haujaanza.</DialogDescription></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <FormField control={editForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Kichwa cha mkutano *</FormLabel><FormControl><Input {...field} disabled={isActionPending} className="h-11 rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Maelezo</FormLabel><FormControl><Textarea {...field} value={field.value || ""} onChange={(event) => field.onChange(event.target.value || null)} disabled={isActionPending} className="min-h-24 rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><FormLabel htmlFor="edit-meeting-date">Tarehe *</FormLabel><Input id="edit-meeting-date" type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} disabled={isActionPending} required className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><FormLabel htmlFor="edit-meeting-time">Saa *</FormLabel><Input id="edit-meeting-time" type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} disabled={isActionPending} required className="h-11 rounded-xl" /></div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingMeeting(null)} disabled={isActionPending}>Ghairi</Button>
                <Button type="submit" disabled={isActionPending} className="gap-2">{isActionPending && <Loader2 className="size-4 animate-spin" />}Hifadhi mabadiliko</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRegistrations} onOpenChange={(open) => { if (!open) setViewingRegistrations(null); }}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Usajili wa washiriki</DialogTitle><DialogDescription>{viewingRegistrations?.title}</DialogDescription></DialogHeader>
          {loadingRegistrations ? <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-primary" /></div> : registrations.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center"><Users className="mb-3 size-8 text-muted-foreground" /><p className="text-sm font-medium">Hakuna washiriki waliosajiliwa bado.</p></div>
          ) : (
            <div className="overflow-hidden rounded-xl border"><Table><TableHeader><TableRow><TableHead>Jina la mshiriki</TableHead><TableHead>Wakati wa usajili</TableHead></TableRow></TableHeader><TableBody>{registrations.map((registration) => <TableRow key={registration.id}><TableCell className="font-medium">{registration.displayName}</TableCell><TableCell className="text-xs text-muted-foreground">{formatDateTime(registration.registeredAt)}</TableCell></TableRow>)}</TableBody></Table></div>
          )}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setViewingRegistrations(null)}>Funga</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!meetingToDelete} onOpenChange={(open) => { if (!open) setMeetingToDelete(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Trash2 className="size-5" /></div>
            <AlertDialogTitle>Futa mkutano?</AlertDialogTitle>
            <AlertDialogDescription>
              Unakaribia kufuta <strong className="text-foreground">{meetingToDelete?.title}</strong>. Kitendo hiki kinaweza kuondoa taarifa za mkutano na kinapaswa kuthibitishwa kabla ya kutekelezwa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending}>Batilisha</AlertDialogCancel>
            <AlertDialogAction disabled={isActionPending} onClick={(event) => { event.preventDefault(); if (meetingToDelete) void handleDelete(meetingToDelete); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isActionPending && <Loader2 className="mr-2 size-4 animate-spin" />}Futa mkutano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
