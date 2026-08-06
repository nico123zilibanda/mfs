"use server";

import {
  actionFailure,
  actionSuccess,
  actionError,
} from "@/lib/actions/utils";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type {
  ActionResult,
} from "@/lib/types/action-result";

import type { Feedback } from "@/lib/types/feedback";

export async function getReport(
  id: string
): Promise<ActionResult<Feedback>> {
  try {
    const report =
      await feedbackRepository.findById(id);

    if (!report) {
      return actionFailure(
        "Report not found."
      );
    }

    return actionSuccess(report);
  } catch (error) {
    return actionError(
      error,
      "Failed to fetch report."
    );
  }
}