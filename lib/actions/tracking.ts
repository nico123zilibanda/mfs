"use server";

import {
  actionError,
  actionFailure,
  actionSuccess,
} from "@/lib/actions/utils";

import { trackingSchema } from "@/lib/schemas/tracking";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import { mapFeedbackTracking } from "@/lib/mappers/feedback";

import type {
  TrackingInput,
} from "@/lib/schemas/tracking";

import type {
  FeedbackTracking,
} from "@/lib/types/tracking";

import type {
  ActionResult,
} from "@/lib/types/action-result";

export async function trackFeedback(
  input: TrackingInput
): Promise<ActionResult<FeedbackTracking>> {
  const validation =
    trackingSchema.safeParse(input);

  if (!validation.success) {
    return actionFailure(
      "Validation failed.",
      validation.error.flatten().fieldErrors
    );
  }

  try {
    const feedback =
      await feedbackRepository.findByReferenceNumber(
        validation.data.referenceNumber
      );

    if (!feedback) {
      return actionFailure(
        "No feedback was found with the provided reference number."
      );
    }

    return actionSuccess(
      mapFeedbackTracking(feedback)
    );
  } catch (error) {
    return actionError(
      error,
      "Failed to track feedback."
    );
  }
}