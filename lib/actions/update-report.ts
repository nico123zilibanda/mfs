"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import type { ActionResult } from "@/lib/types/action-result";
import type { FeedbackStatus } from "@/lib/types/feedback";

export async function updateReport(
  id: string,
  data: {
    status?: FeedbackStatus;
    adminNote?: string;
  }
): Promise<ActionResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("feedback")
      .update({
        ...(data.status && { status: data.status }),
        ...(data.adminNote !== undefined && {
          admin_note: data.adminNote,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("is_deleted", false);

    if (error) {
      console.error("Update Report Error:", error);

      return {
        success: false,
        message: "Failed to update report",
      };
    }

    return {
      success: true,
      message: "Report updated successfully",
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Unexpected server error",
    };
  }
}