"use server";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import { feedbackSchema } from "@/lib/schemas/feedback";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type {
  FeedbackInput,
} from "@/lib/schemas/feedback";

import type {
  ActionResult,
} from "@/lib/types/action-result";

import type {
  Feedback,
} from "@/lib/types/feedback";

export async function submitFeedback(
  input: FeedbackInput
): Promise<ActionResult<Feedback>> {

  const validation =
    feedbackSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure(
      "Validation failed."
    );
  }

  return executeAction(
    () =>
      feedbackRepository.create(
        validation.data
      ),
    "Failed to submit feedback."
  );
}