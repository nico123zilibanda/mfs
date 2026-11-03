"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader2,
  MessageSquareWarning,
  SlidersHorizontal,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardPage from "@/components/dashboard/dashboard-page";
import PageSection from "@/components/dashboard/page-section";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSystemReport } from "@/lib/actions/get-system-report";
import { cn } from "@/lib/utils";
import type { ReportPeriod, SystemReportResult, SystemReportType } from "@/lib/types/report";

import { exportDocx, exportPdfDownload, exportPdfPreviewUrl, exportXlsx } from "./export-utils";
import {
  REPORT_PERIOD_LABELS,
  formatRange,
  getReportRange,
  reportFileName,
} from "./report-config";
import ReportResults from "./report-results";

/* -------------------------------------------------------------------------- */
/*  Options                                                                   */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS: {
  value: SystemReportType;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "combined",
    label: "All Reports",
    description: "Complaints and meetings together",
    icon: Layers,
  },
  {
    value: "complaints",
    label: "Citizen Complaints",
    description: "Complaints received from citizens",
    icon: MessageSquareWarning,
  },
  {
    value: "meetings",
    label: "Meetings",
    description: "Council meetings and attendance",
    icon: UsersRound,
  },
];

const PERIOD_OPTIONS: ReportPeriod[] = ["weekly", "monthly", "yearly", "custom"];

type ExportKind = "preview" | "pdf" | "docx" | "xlsx";

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Generating report">
      <div className="h-44 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function ExportButton({
  icon: Icon,
  label,
  busy,
  disabled,
  variant = "outline",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  busy: boolean;
  disabled: boolean;
  variant?: "outline" | "default";
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="w-full justify-start gap-2 sm:w-auto"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
      {label}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function SystemReportsPage() {
  const [reportType, setReportType] = useState<SystemReportType>("combined");
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const [result, setResult] = useState<SystemReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const [isPending, startTransition] = useTransition();

  const range = useMemo(
    () => getReportRange({ period, startDate, endDate, week, month, year }),
    [period, startDate, endDate, week, month, year],
  );

  // Free the PDF blob if the page is left while the preview is open.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ------------------------------- actions -------------------------------- */

  function handleGenerate() {
    if (!range.ok) return;
    setError(null);

    startTransition(async () => {
      const response = await getSystemReport({
        type: reportType,
        period,
        startDate: range.startDate,
        endDate: range.endDate,
      });

      if (!response.success) {
        setError(response.message ?? "Failed to generate the report.");
        setResult(null);
        return;
      }

      setResult(response.data as SystemReportResult);
    });
  }

  async function runExport(kind: ExportKind, action: () => Promise<void> | void) {
    if (!result || exporting) return;
    setExporting(kind);
    try {
      await action();
    } catch (caught) {
      console.error(caught);
      toast.error("The export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  function handlePreview() {
    if (!result) return;
    void runExport("preview", async () => {
      setPreviewUrl(await exportPdfPreviewUrl(result));
    });
  }

  function closePreview() {
    setPreviewUrl(null); // the effect above revokes the old URL
  }

  const busy = isPending || exporting !== null;

  /* -------------------------------- render -------------------------------- */

  return (
    <DashboardPage>
      <DashboardHeader
        title="System Reports"
        description="Generate, preview, and export official reports for citizen complaints and council meetings."
      />

      {/* ------------------------------ Configuration ----------------------- */}
      <PageSection>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <SlidersHorizontal className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Choose what to include and the reporting period.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Report type */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Report type</legend>
              <div role="radiogroup" aria-label="Report type" className="grid gap-3 sm:grid-cols-3">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = reportType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setReportType(option.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left outline-none transition-all",
                        "focus-visible:ring-2 focus-visible:ring-emerald-600/50",
                        selected
                          ? "border-emerald-600 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-600/30"
                          : "hover:border-emerald-600/40 hover:bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          selected
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Period */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Reporting period</legend>
              <div
                role="radiogroup"
                aria-label="Reporting period"
                className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4"
              >
                {PERIOD_OPTIONS.map((option) => {
                  const selected = period === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPeriod(option)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-emerald-600/50",
                        selected
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {REPORT_PERIOD_LABELS[option]}
                    </button>
                  );
                })}
              </div>

              {period === "weekly" && (
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="report-week">Week</Label>
                  <Input
                    id="report-week"
                    type="week"
                    value={week}
                    onChange={(event) => setWeek(event.target.value)}
                  />
                </div>
              )}

              {period === "monthly" && (
                <div className="grid max-w-xl gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="report-month">Month</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger id="report-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, index) => (
                          <SelectItem key={index + 1} value={String(index + 1)}>
                            {new Date(2000, index, 1).toLocaleString("en", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-year">Year</Label>
                    <Input
                      id="report-year"
                      type="number"
                      inputMode="numeric"
                      min={2000}
                      max={2100}
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                    />
                  </div>
                </div>
              )}

              {period === "yearly" && (
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="report-year-only">Year</Label>
                  <Input
                    id="report-year-only"
                    type="number"
                    inputMode="numeric"
                    min={2000}
                    max={2100}
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                  />
                </div>
              )}

              {period === "custom" && (
                <div className="grid max-w-xl gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="report-start">Start date</Label>
                    <Input
                      id="report-start"
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-end">End date</Label>
                    <Input
                      id="report-end"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {/* Selected range + generate */}
            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm" aria-live="polite">
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {range.ok ? (
                  <span>
                    <span className="text-muted-foreground">Selected period: </span>
                    <span className="font-medium">{formatRange(range.startDate, range.endDate)}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{range.message}</span>
                )}
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={busy || !range.ok}
                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="size-4" /> Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* -------------------------------- Export ---------------------------- */}
      {result && !isPending && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Export this report</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  PDF and Word include the official letterhead (coat of arms and council logo)
                  and a signature block. Excel contains the data with a text heading.
                </p>
              </div>

              <div className="grid shrink-0 gap-2 sm:flex sm:flex-wrap">
                <ExportButton
                  icon={Eye}
                  label="Preview PDF"
                  busy={exporting === "preview"}
                  disabled={busy}
                  onClick={handlePreview}
                />
                <ExportButton
                  icon={FileDown}
                  label="Download PDF"
                  variant="default"
                  busy={exporting === "pdf"}
                  disabled={busy}
                  onClick={() => void runExport("pdf", () => exportPdfDownload(result))}
                />
                <ExportButton
                  icon={FileText}
                  label="Export Word"
                  busy={exporting === "docx"}
                  disabled={busy}
                  onClick={() => void runExport("docx", () => exportDocx(result))}
                />
                <ExportButton
                  icon={FileSpreadsheet}
                  label="Export Excel"
                  busy={exporting === "xlsx"}
                  disabled={busy}
                  onClick={() => void runExport("xlsx", () => exportXlsx(result))}
                />
              </div>
            </CardContent>
          </Card>
        </PageSection>
      )}

      {/* ------------------------------- Results ---------------------------- */}
      <PageSection>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">The report could not be generated</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isPending && <ResultsSkeleton />}

        {!isPending && result && <ReportResults result={result} />}

        {!isPending && !result && !error && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                <BarChart3 className="size-7 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">No report yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Choose a report type and period above, then select Generate Report.
              </p>
            </CardContent>
          </Card>
        )}
      </PageSection>

      {/* ------------------------------ PDF preview ------------------------- */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="flex max-h-[95dvh] w-[calc(100%-1.5rem)] flex-col gap-3 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
            <DialogDescription>
              {result ? reportFileName(result, "pdf") : "Report preview"}
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              className="h-[70vh] w-full rounded-lg border bg-muted"
            />
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={closePreview}>
              Close
            </Button>
            <Button
              type="button"
              disabled={!result || exporting !== null}
              onClick={() => result && void runExport("pdf", () => exportPdfDownload(result))}
              className="gap-2"
            >
              {exporting === "pdf" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
