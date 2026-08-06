export type FeedbackStatus =
  | "received"
  | "in_review"
  | "resolved";


export const FEEDBACK_STATUS = [
  "received",
  "in_review",
  "resolved",
] as const;


export const FEEDBACK_STATUS_LABELS = {
  received: "Received",
  in_review: "In Review",
  resolved: "Resolved",
} as const;


export interface Feedback {
  [x: string]: any;
  id: string;

  referenceNumber: string;

  fullName: string;

  village: string;

  ward: string;

  phone: string;

  corruptionDescription: string;

  hasBribeRequest: boolean;

  status: FeedbackStatus;

  adminNote: string | null;

  isDeleted: boolean;

  createdAt: string;

  updatedAt: string;
}