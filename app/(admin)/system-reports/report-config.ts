/**
 * Shared configuration, labels and helpers for the System Reports feature.
 * Edit REPORT_IDENTITY / REPORT_LABELS here and the page, the on-screen
 * letterhead and every export (PDF, Word, Excel) update together.
 */

import type {
    ReportPeriod,
    SystemReportResult,
    SystemReportType,
  } from "@/lib/types/report";
  
  /* -------------------------------------------------------------------------- */
  /*  Identity (letterhead)                                                     */
  /* -------------------------------------------------------------------------- */
  
  export const REPORT_IDENTITY = {
    republic: "THE UNITED REPUBLIC OF TANZANIA",
    ministry:
      "PRIME MINISTER'S OFFICE – REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT",
    council: "HALMASHAURI YA WILAYA YA MLELE",
    system: "Malalamiko Portal",
  } as const;
  
  /** Files live in /public/images. They are fetched at export time. */
  export const REPORT_ASSETS = {
    coatOfArms: "/images/tanzania-coat-of-arms.png",
    councilLogo: "/images/mlele-council-logo.png",
  } as const;
  
  /** Tanzanian flag colours (hex, no #) used for the letterhead band. */
  export const FLAG_COLORS = ["1EB53A", "FCD116", "000000", "00A3DD"] as const;
  
  /* -------------------------------------------------------------------------- */
  /*  Labels                                                                    */
  /* -------------------------------------------------------------------------- */
  
  export const REPORT_TYPE_LABELS: Record<SystemReportType, string> = {
    combined: "All Reports",
    complaints: "Citizen Complaints",
    meetings: "Meetings",
  };
  
  export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    custom: "Custom Range",
  };
  
  /* -------------------------------------------------------------------------- */
  /*  Row types (the API returns loosely typed rows)                            */
  /* -------------------------------------------------------------------------- */
  
  export interface ComplaintRow {
    id: string;
    referenceNumber: string;
    fullName?: string | null;
    village?: string | null;
    ward?: string | null;
    status: string;
    createdAt: string;
  }
  
  export interface MeetingRow {
    id: string;
    title: string;
    status: string;
    scheduledStartAt: string;
    participantCount?: number | null;
    createdAt: string;
  }
  
  export function getComplaintRows(result: SystemReportResult) {
    return (result.complaints ?? []) as unknown as ComplaintRow[];
  }
  
  export function getMeetingRows(result: SystemReportResult) {
    return (result.meetings ?? []) as unknown as MeetingRow[];
  }
  
  export function includesComplaints(result: SystemReportResult) {
    return result.type === "complaints" || result.type === "combined";
  }
  
  export function includesMeetings(result: SystemReportResult) {
    return result.type === "meetings" || result.type === "combined";
  }
  
  /* -------------------------------------------------------------------------- */
  /*  Formatting                                                                */
  /* -------------------------------------------------------------------------- */
  
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  
  const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  export function formatDate(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
  }
  
  export function formatDateTime(date: Date = new Date()) {
    return dateTimeFormatter.format(date);
  }
  
  /** "2026-11-01" → "01 Nov 2026" (parsed as a local date, never shifted by timezone). */
  export function formatIsoDay(value: string) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
  }
  
  export function formatRange(startDate: string, endDate: string) {
    return `${formatIsoDay(startDate)} – ${formatIsoDay(endDate)}`;
  }
  
  /** "in_progress" → "In Progress" */
  export function formatStatus(status?: string | null) {
    if (!status) return "—";
    return status
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  export function formatPlace(village?: string | null, ward?: string | null) {
    const parts = [village, ward].filter(Boolean);
    return parts.length ? parts.join(" / ") : "—";
  }
  
  export function reportFileName(result: SystemReportResult, extension: string) {
    return `Mlele-${result.type}-report-${result.range.startDate}_to_${result.range.endDate}.${extension}`;
  }
  
  /* -------------------------------------------------------------------------- */
  /*  Status colours                                                            */
  /* -------------------------------------------------------------------------- */
  
  type StatusTone = "success" | "warning" | "info" | "danger" | "neutral" | "brand";
  
  const STATUS_TONE: Record<string, StatusTone> = {
    resolved: "success",
    completed: "success",
    live: "success",
    approved: "success",
    pending: "warning",
    submitted: "warning",
    new: "warning",
    in_progress: "info",
    under_review: "info",
    assigned: "info",
    scheduled: "brand",
    rejected: "danger",
    cancelled: "danger",
    closed: "neutral",
    ended: "neutral",
  };
  
  function statusKey(status?: string | null) {
    return (status ?? "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  }
  
  export function getStatusTone(status?: string | null): StatusTone {
    return STATUS_TONE[statusKey(status)] ?? "neutral";
  }
  
  /** Tailwind classes for on-screen badges. */
  export const STATUS_BADGE_CLASSES: Record<StatusTone, string> = {
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warning:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    brand:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    neutral: "border-border bg-muted text-muted-foreground",
  };
  
  /** RGB text colours for PDF cells. */
  export const STATUS_PDF_RGB: Record<StatusTone, [number, number, number]> = {
    success: [4, 120, 87],
    warning: [180, 83, 9],
    info: [3, 105, 161],
    danger: [185, 28, 28],
    brand: [109, 40, 217],
    neutral: [71, 85, 105],
  };
  
  /* -------------------------------------------------------------------------- */
  /*  Period → date range                                                       */
  /* -------------------------------------------------------------------------- */
  
  export interface PeriodInput {
    period: ReportPeriod;
    startDate: string;
    endDate: string;
    week: string; // "YYYY-Www"
    month: string; // "1".."12"
    year: string;
  }
  
  export type RangeResult =
    | { ok: true; startDate: string; endDate: string }
    | { ok: false; message: string };
  
  /**
   * Local-time "YYYY-MM-DD". Do NOT use toISOString() for this: in Tanzania
   * (UTC+3) local midnight is the previous day in UTC, which shifts every range
   * back by one day.
   */
  export function toLocalIsoDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  
  /** ISO-8601 week ("2026-W45") → Monday..Sunday. */
  function isoWeekToRange(value: string) {
    const match = /^(\d{4})-W(\d{2})$/.exec(value);
    if (!match) return null;
  
    const year = Number(match[1]);
    const week = Number(match[2]);
  
    const jan4 = new Date(year, 0, 4);
    const mondayOffset = (jan4.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(year, 0, 4 - mondayOffset + (week - 1) * 7);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  
    return { start: monday, end: sunday };
  }
  
  export function getReportRange(input: PeriodInput): RangeResult {
    const year = Number(input.year);
    const yearOk = Number.isInteger(year) && year >= 2000 && year <= 2100;
  
    switch (input.period) {
      case "weekly": {
        if (!input.week) return { ok: false, message: "Select a week to continue." };
        const range = isoWeekToRange(input.week);
        if (!range) return { ok: false, message: "Select a valid week." };
        return {
          ok: true,
          startDate: toLocalIsoDate(range.start),
          endDate: toLocalIsoDate(range.end),
        };
      }
  
      case "monthly": {
        const month = Number(input.month);
        if (!yearOk) return { ok: false, message: "Enter a valid year (2000–2100)." };
        if (!Number.isInteger(month) || month < 1 || month > 12) {
          return { ok: false, message: "Select a month." };
        }
        return {
          ok: true,
          startDate: toLocalIsoDate(new Date(year, month - 1, 1)),
          endDate: toLocalIsoDate(new Date(year, month, 0)),
        };
      }
  
      case "yearly": {
        if (!yearOk) return { ok: false, message: "Enter a valid year (2000–2100)." };
        return { ok: true, startDate: `${year}-01-01`, endDate: `${year}-12-31` };
      }
  
      case "custom": {
        if (!input.startDate || !input.endDate) {
          return { ok: false, message: "Choose both a start date and an end date." };
        }
        if (input.startDate > input.endDate) {
          return { ok: false, message: "The start date must be before the end date." };
        }
        return { ok: true, startDate: input.startDate, endDate: input.endDate };
      }
  
      default:
        return { ok: false, message: "Select a reporting period." };
    }
  }
  