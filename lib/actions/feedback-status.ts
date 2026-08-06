"use server";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import { feedbackStatusSchema } from "@/lib/schemas/feedback-status";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type { ActionResult } from "@/lib/types/action-result";
import type { Feedback } from "@/lib/types/feedback";
import type { FeedbackStatusInput } from "@/lib/schemas/feedback-status";

export async function updateFeedbackStatus(
  input: FeedbackStatusInput
): Promise<ActionResult<Feedback>> {
  const validation =
    feedbackStatusSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure(
      "Validation failed.",
      validation.error.flatten().fieldErrors
    );
  }

  return executeAction(
    () =>
      feedbackRepository.updateStatus(
        validation.data
      ),
    "Failed to update feedback status."
  );
}