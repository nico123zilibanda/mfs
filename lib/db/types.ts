export interface FeedbackRow {
  id: string;

  reference_number: string;

  full_name: string;

  village: string;

  ward: string;

  phone: string;

  corruption_description: string;

  has_bribe_request: boolean;

  status:
    | "received"
    | "in_review"
    | "resolved";

  admin_note: string | null;

  is_deleted: boolean;

  created_at: string;

  updated_at: string;
}