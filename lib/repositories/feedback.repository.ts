import { createSupabaseServerClient } from "@/lib/auth/server";
import { mapFeedbackRow, mapFeedbackRows } from "@/lib/db/mappers";

import type { FeedbackRow } from "@/lib/db/types";
import type { Feedback } from "@/lib/types/feedback";
import type { FeedbackInput } from "@/lib/schemas/feedback";
import type { ReportsFilters, ReportsResponse } from "@/lib/types/report";
import { FeedbackStatusInput } from "../schemas/feedback-status";
import { FeedbackNoteInput } from "../schemas/feedback-note";
import { FeedbackDeleteInput } from "../schemas/feedback-delete";
import { ensureFound, throwDatabaseError } from "@/lib/db/errors";

const TABLE_NAME = "feedback";
const PAGE_SIZE = 10;

async function findFeedbackById(
  id: string,
  isDeleted: boolean
): Promise<Feedback | null> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .eq("is_deleted", isDeleted)
      .maybeSingle<FeedbackRow>();

  throwDatabaseError(
    error,
    "fetching feedback"
  );

  if (!data) {
    return null;
  }

  return mapFeedbackRow(data);
}


async function findById(
  id: string
): Promise<Feedback | null> {
  return findFeedbackById(
    id,
    false
  );
}

async function findDeletedById(
  id: string
): Promise<Feedback | null> {
  return findFeedbackById(
    id,
    true
  );
}



async function findReports(
  filters: ReportsFilters,
  isDeleted: boolean,
): Promise<ReportsResponse> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from(TABLE_NAME)
    .select("*", {
      count: "exact",
    })
    .eq("is_deleted", isDeleted);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search.trim()) {
    const search = filters.search.trim().replace(/[(),]/g, "");
    query = query.or(
      [
        `reference_number.ilike.%${search}%`,
        `full_name.ilike.%${search}%`,
        `phone.ilike.%${search}%`,
        `village.ilike.%${search}%`,
        `ward.ilike.%${search}%`,
      ].join(","),
    );
  }

  const requestedPage = Math.max(1, filters.page);
  const from = (requestedPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let { data, error, count } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to)
    .returns<FeedbackRow[]>();

  throwDatabaseError(error, "fetching feedback reports");

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  if (page !== requestedPage) {
    const correctedFrom = (page - 1) * PAGE_SIZE;
    const correctedTo = correctedFrom + PAGE_SIZE - 1;
    const corrected = await query
      .order("created_at", { ascending: false })
      .range(correctedFrom, correctedTo)
      .returns<FeedbackRow[]>();

    data = corrected.data;
    error = corrected.error;
    throwDatabaseError(error, "fetching feedback reports");
  }

  return {
    reports: mapFeedbackRows(data ?? []),

    total: count ?? 0,

    page,

    pageSize: PAGE_SIZE,

    totalPages,
  };
}

async function findAll(
  filters: ReportsFilters,
): Promise<ReportsResponse> {
  return findReports(filters, false);
}

async function findDeleted(
  filters: ReportsFilters,
): Promise<ReportsResponse> {
  return findReports(filters, true);
}

async function create(input: FeedbackInput): Promise<Feedback> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      full_name: input.fullName || null,

      village: input.village,

      ward: input.ward,

      phone: input.phone,

      corruption_description: input.corruptionDescription,

      has_bribe_request: input.hasBribeRequest,
    })
    .select("*")
    .single<FeedbackRow>();

  throwDatabaseError(error, "creating feedback");

  return mapFeedbackRow(ensureFound(data, "Feedback"));
}

async function updateStatus(input: FeedbackStatusInput): Promise<Feedback> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: input.status,
    })
    .eq("id", input.id)
    .eq("is_deleted", false)
    .select("*")
    .maybeSingle<FeedbackRow>();

  throwDatabaseError(error, "updating feedback status");

  return mapFeedbackRow(ensureFound(data, "Feedback"));
}

async function updateAdminNote(input: FeedbackNoteInput): Promise<Feedback> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      admin_note: input.adminNote,
    })
    .eq("id", input.id)
    .eq("is_deleted", false)
    .select("*")
    .maybeSingle<FeedbackRow>();

  throwDatabaseError(error, "updating feedback admin note");

  return mapFeedbackRow(ensureFound(data, "Feedback"));
}

async function softDelete(input: FeedbackDeleteInput): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_deleted: true,
    })
    .eq("id", input.id)
    .eq("is_deleted", false);

  throwDatabaseError(error, "soft deleting feedback");
}

async function restore(input: FeedbackDeleteInput): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_deleted: false,
    })
    .eq("id", input.id)
    .eq("is_deleted", true);

  throwDatabaseError(error, "restoring feedback");
}

async function permanentlyDelete(
  input: FeedbackDeleteInput
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", input.id)
    .eq("is_deleted", true);

  throwDatabaseError(
    error,
    "permanently deleting feedback"
  );
}

async function findByReferenceNumber(
  referenceNumber: string
): Promise<Feedback | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("reference_number", referenceNumber)
    .eq("is_deleted", false)
    .maybeSingle<FeedbackRow>();

  throwDatabaseError(
    error,
    "fetching feedback by reference number"
  );

  if (!data) {
    return null;
  }

  return mapFeedbackRow(data);
}

export const feedbackRepository = {
  findById,
  findAll,
  create,
  updateStatus,
  updateAdminNote,
  softDelete,
  restore,
  findByReferenceNumber,
  permanentlyDelete,
  findDeleted,
  findDeletedById,
};
