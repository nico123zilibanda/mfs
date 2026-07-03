"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import type { ActionResult } from "@/lib/types/action-result";
import type { DashboardStats, RecentFeedback } from "@/lib/types/dashboard";
import type { FeedbackStatus } from "@/lib/types/feedback";

async function getFeedbackCount(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  status?: FeedbackStatus
): Promise<number> {
  let query = supabase
    .from("feedback")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("is_deleted", false);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getDashboardStats(): Promise<
  ActionResult<DashboardStats>
> {
  try {
    const supabase = await createSupabaseServerClient();

    const [total, received, inReview, resolved] =
      await Promise.all([
        getFeedbackCount(supabase),
        getFeedbackCount(supabase, "received"),
        getFeedbackCount(supabase, "in_review"),
        getFeedbackCount(supabase, "resolved"),
      ]);

    return {
      success: true,
      data: {
        total,
        received,
        inReview,
        resolved,
      },
    };
  } catch (error) {
    console.error("Failed to load dashboard statistics:", error);

    return {
      success: false,
      message: "Failed to load dashboard statistics.",
    };
  }
}

export async function getRecentFeedback(): Promise<
  ActionResult<RecentFeedback[]>
> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("feedback")
      .select(
        `
          id,
          reference_number,
          full_name,
          ward,
          status,
          created_at
        `
      )
      .eq("is_deleted", false)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (error) {
      console.error("Recent feedback error:", error);

      return {
        success: false,
        message: "Failed to load recent feedback.",
      };
    }

    return {
      success: true,
      data: data.map((item) => ({
        id: item.id,
        referenceNumber: item.reference_number,
        fullName: item.full_name,
        ward: item.ward,
        status: item.status,
        createdAt: item.created_at,
      })),
    };
  } catch (error) {
    console.error("Recent feedback error:", error);

    return {
      success: false,
      message: "Unexpected server error.",
    };
  }
}