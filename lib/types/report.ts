import type {
  Feedback,
  FeedbackStatus,
} from "./feedback";

export type ReportListItem = Pick<
  Feedback,
  | "id"
  | "referenceNumber"
  | "fullName"
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
}

export interface ReportsResponse {
  reports: ReportListItem[];

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;
}