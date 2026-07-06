"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/schemas/feedback";

import type { ActionResult } from "@/lib/types/action-result";

type CreateFeedbackResponse = {
  id: string;
  referenceNumber: string;
};

export async function createFeedback(
  input: FeedbackInput
): Promise<ActionResult<CreateFeedbackResponse>> {
  // Validate request
  const validated = feedbackSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("feedback")
      .insert({
  full_name:
    validated.data.fullName.trim() === ""
      ? null
      : validated.data.fullName.trim(),

  village: validated.data.village.trim(),

  ward: validated.data.ward.trim(),

  phone: validated.data.phone.trim(),

  corruption_description:
    validated.data.corruptionDescription.trim(),

  has_bribe_request:
    validated.data.hasBribeRequest,
})
      .select("id, reference_number")
      .single();

    if (error) {
      console.error(
        "[createFeedback] Supabase Error:",
        error
      );

      return {
        success: false,
        message:
          "Failed to submit your feedback. Please try again.",
      };
    }

    if (!data) {
      return {
        success: false,
        message:
          "Feedback was not created. Please try again.",
      };
    }

    return {
      success: true,
      message:
        "Your feedback has been submitted successfully.",
      data: {
        id: data.id,
        referenceNumber: data.reference_number,
      },
    };
  } catch (error) {
    console.error(
      "[createFeedback] Unexpected Error:",
      error
    );

    return {
      success: false,
      message:
        "An unexpected error occurred while submitting your feedback.",
    };
  }
}