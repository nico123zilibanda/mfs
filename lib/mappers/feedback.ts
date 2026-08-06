import type { Feedback } from "@/lib/types/feedback";
import type { FeedbackTracking } from "@/lib/types/tracking";
import type { ReportListItem } from "@/lib/types/report";
import type { RecentFeedback } from "@/lib/types/dashboard";

/**
 * Maps Feedback → FeedbackTracking
 */
export function mapFeedbackTracking(
  feedback: Feedback
): FeedbackTracking {
  return {
    id: feedback.id,

    referenceNumber: feedback.referenceNumber,

    fullName: feedback.fullName,

    village: feedback.village,

    ward: feedback.ward,

    phone: feedback.phone,

    corruptionDescription:
      feedback.corruptionDescription,

    hasBribeRequest:
      feedback.hasBribeRequest,

    status: feedback.status,

    createdAt: feedback.createdAt,
  };
}

/**
 * Maps Feedback → ReportListItem
 */
export function mapReportListItem(
  feedback: Feedback
): ReportListItem {
  return {
    id: feedback.id,

    referenceNumber: feedback.referenceNumber,

    fullName: feedback.fullName,

    corruptionDescription:
      feedback.corruptionDescription,

    hasBribeRequest:
      feedback.hasBribeRequest,

    village: feedback.village,

    ward: feedback.ward,

    phone: feedback.phone,

    status: feedback.status,

    createdAt: feedback.createdAt,
  };
}

export function mapReportListItems(
  feedback: Feedback[]
): ReportListItem[] {
  return feedback.map(mapReportListItem);
}

/**
 * Maps Feedback → RecentFeedback
 */
export function mapRecentFeedback(
  feedback: Feedback
): RecentFeedback {
  return {
    id: feedback.id,

    referenceNumber: feedback.referenceNumber,

    fullName: feedback.fullName,

    ward: feedback.ward,

    status: feedback.status,

    createdAt: feedback.createdAt,
  };
}

export function mapRecentFeedbackList(
  feedback: Feedback[]
): RecentFeedback[] {
  return feedback.map(mapRecentFeedback);
}