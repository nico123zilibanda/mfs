"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import { feedbackDeleteSchema } from "@/lib/schemas/feedback-delete";
import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type { ActionResult } from "@/lib/types/action-result";
import type { FeedbackDeleteInput } from "@/lib/schemas/feedback-delete";

export async function restoreFeedback(
  input: FeedbackDeleteInput
): Promise<ActionResult<void>> {
  const validation =
    feedbackDeleteSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure(
      "Validation failed.",
      validation.error.flatten().fieldErrors
    );
  }

  return executeAction(async () => {
    await feedbackRepository.restore(
      validation.data
    );

    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return;
  }, "Failed to restore feedback.");
}