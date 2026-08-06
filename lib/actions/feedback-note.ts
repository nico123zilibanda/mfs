"use server";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import { feedbackNoteSchema } from "@/lib/schemas/feedback-note";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type { ActionResult } from "@/lib/types/action-result";
import type { Feedback } from "@/lib/types/feedback";
import type { FeedbackNoteInput } from "@/lib/schemas/feedback-note";

export async function updateFeedbackNote(
  input: FeedbackNoteInput
): Promise<ActionResult<Feedback>> {
  const validation =
    feedbackNoteSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure(
      "Validation failed.",
      validation.error.flatten().fieldErrors
    );
  }

  return executeAction(
    () =>
      feedbackRepository.updateAdminNote(
        validation.data
      ),
    "Failed to update admin note."
  );
}