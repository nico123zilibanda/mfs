"use client";

import Image from "next/image";
import { CalendarDays, MessageSquareWarning, UsersRound } from "lucide-react";

import DataTable from "@/components/table/data-table";
import DataTableEmpty from "@/components/table/data-table-empty";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import type { SystemReportResult } from "@/lib/types/report";

import {
  FLAG_COLORS,
  REPORT_ASSETS,
  REPORT_IDENTITY,
  REPORT_TYPE_LABELS,
  STATUS_BADGE_CLASSES,
  formatDate,
  formatPlace,
  formatRange,
  formatStatus,
  getComplaintRows,
  getMeetingRows,
  getStatusTone,
  includesComplaints,
  includesMeetings,
  type ComplaintRow,
  type MeetingRow,
} from "./report-config";

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap font-medium", STATUS_BADGE_CLASSES[getStatusTone(status)])}
    >
      {formatStatus(status)}
    </Badge>
  );
}

function LogoTile({ src, alt }: { src: string; alt: string }) {
  // White tile so the logos stay readable in dark mode.
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border sm:size-20 sm:p-2">
      <Image
        src={src}
        alt={alt}
        width={160}
        height={160}
        className="size-full object-contain"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Letterhead (matches the exported documents)                               */
/* -------------------------------------------------------------------------- */

function ReportLetterhead({ result }: { result: SystemReportResult }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
          <LogoTile src={REPORT_ASSETS.coatOfArms} alt="Tanzania coat of arms" />

          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold tracking-wide sm:text-sm">
              {REPORT_IDENTITY.republic}
            </p>
            <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
              {REPORT_IDENTITY.ministry}
            </p>
            <p className="mt-1 text-xs font-extrabold tracking-wide text-emerald-700 sm:mt-1.5 sm:text-lg dark:text-emerald-400">
              {REPORT_IDENTITY.council}
            </p>
          </div>

          <LogoTile src={REPORT_ASSETS.councilLogo} alt="Halmashauri ya Wilaya ya Mlele logo" />
        </div>
      </CardContent>

      {/* Flag-colour band */}
      <div aria-hidden="true" className="flex h-1.5 w-full">
        {FLAG_COLORS.map((hex) => (
          <span key={hex} className="flex-1" style={{ backgroundColor: `#${hex}` }} />
        ))}
      </div>

      <div className="flex flex-col gap-3 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-base font-bold tracking-tight sm:text-lg">
            {REPORT_TYPE_LABELS[result.type]} Report
          </h2>
          <p className="text-xs text-muted-foreground">{REPORT_IDENTITY.system}</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">
            {formatRange(result.range.startDate, result.range.endDate)}
          </span>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Summary                                                                   */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof UsersRound;
  accent: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", accent)}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums leading-none">{value}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportSummary({ result }: { result: SystemReportResult }) {
  const showComplaints = includesComplaints(result);
  const showMeetings = includesMeetings(result);
  const total = result.complaintsTotal + result.meetingsTotal;
  const complaintShare = total > 0 ? (result.complaintsTotal / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", showComplaints && showMeetings && "sm:grid-cols-2")}>
        {showComplaints && (
          <StatCard
            label="Citizen complaints"
            value={result.complaintsTotal}
            icon={MessageSquareWarning}
            accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          />
        )}
        {showMeetings && (
          <StatCard
            label="Meetings"
            value={result.meetingsTotal}
            icon={UsersRound}
            accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
          />
        )}
      </div>

      {showComplaints && showMeetings && total > 0 && (
        <div>
          <div
            className="flex h-2 overflow-hidden rounded-full bg-sky-500/70"
            role="img"
            aria-label={`${result.complaintsTotal} complaints and ${result.meetingsTotal} meetings`}
          >
            <span className="bg-emerald-500" style={{ width: `${complaintShare}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Complaints {Math.round(complaintShare)}%</span>
            <span>Meetings {Math.round(100 - complaintShare)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tables (desktop) + cards (mobile)                                         */
/* -------------------------------------------------------------------------- */

const TH = "px-4 py-3";
const THEAD_ROW =
  "border-b bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const BODY_ROW = "border-b transition-colors last:border-0 hover:bg-muted/40 even:bg-muted/20";

function sectionNote(shown: number, total: number) {
  return shown < total ? `Showing ${shown} of ${total}` : `${total} record${total === 1 ? "" : "s"}`;
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 md:hidden">
      <h3 className="border-l-4 border-emerald-600 pl-3 text-base font-semibold">{title}</h3>
      <span className="text-xs text-muted-foreground">{note}</span>
    </div>
  );
}

function ComplaintsSection({ result }: { result: SystemReportResult }) {
  const rows: ComplaintRow[] = getComplaintRows(result);
  const title = `Citizen Complaints (${result.complaintsTotal})`;
  const description = `${formatRange(result.range.startDate, result.range.endDate)} · ${sectionNote(rows.length, result.complaintsTotal)}`;

  return (
    <section aria-label="Citizen complaints">
      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable title={title} description={description}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={cn(TH, "w-12 text-center")}>#</th>
              <th className={TH}>Reference</th>
              <th className={TH}>Name</th>
              <th className={TH}>Village / Ward</th>
              <th className={TH}>Status</th>
              <th className={TH}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6">
                  <DataTableEmpty
                    title="No complaints"
                    description="No citizen complaints in this period."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className={BODY_ROW}>
                  <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold">
                    {row.referenceNumber}
                  </td>
                  <td className="px-4 py-3">{row.fullName?.trim() || "—"}</td>
                  <td className="px-4 py-3">{formatPlace(row.village, row.ward)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <SectionTitle title={title} note={sectionNote(rows.length, result.complaintsTotal)} />
        {rows.length === 0 ? (
          <DataTableEmpty title="No complaints" description="No citizen complaints in this period." />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id}>
                <Card className="gap-0 py-0">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-sm font-semibold">{row.referenceNumber}</p>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="text-sm">{row.fullName?.trim() || "—"}</p>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span className="truncate">{formatPlace(row.village, row.ward)}</span>
                      <span className="shrink-0">{formatDate(row.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function MeetingsSection({ result }: { result: SystemReportResult }) {
  const rows: MeetingRow[] = getMeetingRows(result);
  const title = `Meetings (${result.meetingsTotal})`;
  const description = `${formatRange(result.range.startDate, result.range.endDate)} · ${sectionNote(rows.length, result.meetingsTotal)}`;

  return (
    <section aria-label="Meetings">
      <div className="hidden md:block">
        <DataTable title={title} description={description}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={cn(TH, "w-12 text-center")}>#</th>
              <th className={TH}>Title</th>
              <th className={TH}>Status</th>
              <th className={TH}>Scheduled</th>
              <th className={cn(TH, "text-center")}>Participants</th>
              <th className={TH}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6">
                  <DataTableEmpty title="No meetings" description="No meetings in this period." />
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className={BODY_ROW}>
                  <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(row.scheduledStartAt)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{row.participantCount ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      </div>

      <div className="md:hidden">
        <SectionTitle title={title} note={sectionNote(rows.length, result.meetingsTotal)} />
        {rows.length === 0 ? (
          <DataTableEmpty title="No meetings" description="No meetings in this period." />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id}>
                <Card className="gap-0 py-0">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-snug">{row.title}</p>
                      <StatusBadge status={row.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Scheduled {formatDate(row.scheduledStartAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="size-3.5" aria-hidden="true" />
                        {row.participantCount ?? 0} participants
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Export                                                                    */
/* -------------------------------------------------------------------------- */

export default function ReportResults({ result }: { result: SystemReportResult }) {
  return (
    <div className="space-y-6">
      <ReportLetterhead result={result} />
      <ReportSummary result={result} />
      {includesComplaints(result) && <ComplaintsSection result={result} />}
      {includesMeetings(result) && <MeetingsSection result={result} />}
    </div>
  );
}
