import { Feedback } from "@/lib/types/feedback";
import { FeedbackRow } from "@/lib/db/types";

export function mapFeedback(
  row: FeedbackRow
): Feedback {
  return {
    id: row.id,

    referenceNumber:
      row.reference_number,

    fullName: row.full_name,

    village: row.village,

    ward: row.ward,

    phone: row.phone,

    corruptionDescription:
      row.corruption_description,

    hasBribeRequest:
      row.has_bribe_request,

    status: row.status,

    adminNote: row.admin_note,

    isDeleted: row.is_deleted,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}