export type FeedbackStatus =
  | "received"
  | "in_review"
  | "resolved";

export interface Feedback {
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