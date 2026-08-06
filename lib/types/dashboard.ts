import type { Feedback } from "./feedback";

export type DashboardStats = {
  total: number;
  received: number;
  inReview: number;
  resolved: number;
};

export type RecentFeedback = Pick<
  Feedback,
  | "id"
  | "referenceNumber"
  | "fullName"
  | "ward"
  | "status"
  | "createdAt"
>;