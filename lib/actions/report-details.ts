"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import type { ActionResult } from "@/lib/types/action-result";
import type { Feedback } from "@/lib/types/feedback";

export async function getReportById(
  id: string
): Promise<ActionResult<Feedback>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: "Report not found",
      };
    }

    return {
      success: true,
      message: "Report loaded successfully",
      data,
    };
  } catch (error) {
    console.error("Report Details Error:", error);

    return {
      success: false,
      message: "Unexpected server error",
    };
  }
}