import type {
  Feedback,
  FeedbackStatus,
} from "./feedback";

export type { FeedbackStatus };

export type FeedbackTracking = Pick<
  Feedback,
  | "id"
  | "referenceNumber"
  | "fullName"
  | "village"
  | "ward"
  | "phone"
  | "corruptionDescription"
  | "hasBribeRequest"
  | "status"
  | "createdAt"
>;