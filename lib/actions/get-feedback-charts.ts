"use server";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type { ActionResult } from "@/lib/types/action-result";
import type { FeedbackChartData } from "@/lib/repositories/feedback.repository";

/**
 * ----------------------------------------
 * Get feedback chart data
 * ----------------------------------------
 *
 * Aggregates feedback counts by status and by month
 * (last 6 months) for the admin dashboard charts.
 */
export async function getFeedbackChartData(): Promise<
  ActionResult<FeedbackChartData>
> {
  try {
    const data = await feedbackRepository.findChartData();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Failed to load feedback chart data:", error);

    return {
      success: false,
      message: "Failed to load feedback chart data.",
    };
  }
}
