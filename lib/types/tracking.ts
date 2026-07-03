export type FeedbackStatus =
  | "received"
  | "in_review"
  | "resolved";

export type FeedbackTracking = {
  id: string;
  referenceNumber: string;
  fullName: string;
  village: string;
  ward: string;
  phone: string;
  corruptionDescription: string;
  hasBribeRequest: boolean;
  status: FeedbackStatus;
  createdAt: string;
};