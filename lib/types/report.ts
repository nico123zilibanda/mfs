import type {
  Feedback,
  FeedbackStatus,
} from "./feedback";

export type ReportListItem = Pick<
  Feedback,
  | "id"
  | "referenceNumber"
  | "fullName"
  | "corruptionDescription"
  | "hasBribeRequest"
  | "village"
  | "ward"
  | "phone"
  | "status"
  | "createdAt"
>;

export interface ReportsFilters {
  page: number;

  search: string;

  status: FeedbackStatus | "all";

  /** Inclusive start date (ISO date string, YYYY-MM-DD). */
  startDate?: string;

  /** Inclusive end date (ISO date string, YYYY-MM-DD). */
  endDate?: string;
}

export type ReportPeriod = "weekly" | "monthly" | "yearly" | "custom";

export type SystemReportType = "complaints" | "meetings" | "combined";

export interface SystemReportFilters {
  type: SystemReportType;

  period: ReportPeriod;

  /** Required when period === "custom". ISO date string (YYYY-MM-DD). */
  startDate?: string;

  /** Required when period === "custom". ISO date string (YYYY-MM-DD). */
  endDate?: string;

  page?: number;

  pageSize?: number;

  search?: string;
}

export interface SystemReportDateRange {
  startDate: string;

  endDate: string;
}

export interface SystemReportResult {
  type: SystemReportType;

  period: ReportPeriod;

  range: SystemReportDateRange;

  complaints: ReportListItem[];

  meetings: import("./meeting").MeetingSummary[];

  complaintsTotal: number;

  meetingsTotal: number;
}

export interface ReportsResponse {
  reports: ReportListItem[];

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;
}