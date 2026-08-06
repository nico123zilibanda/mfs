import type { FeedbackRow } from "./types";

import type { Feedback } from "@/lib/types/feedback";

export function mapFeedbackRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,

    referenceNumber: row.reference_number,

    fullName: row.full_name,

    village: row.village,

    ward: row.ward,

    phone: row.phone,

    corruptionDescription: row.corruption_description,

    hasBribeRequest: row.has_bribe_request,

    status: row.status,

    adminNote: row.admin_note,

    isDeleted: row.is_deleted,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

export function mapFeedbackRows(rows: FeedbackRow[]): Feedback[] {
  return rows.map(mapFeedbackRow);
}