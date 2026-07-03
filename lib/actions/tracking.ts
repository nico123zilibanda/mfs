"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import {
  trackingSchema,
  type TrackingInput,
} from "@/lib/schemas/tracking";

import type { ActionResult } from "@/lib/types/action-result";
import type { FeedbackTracking } from "@/lib/types/tracking";

export async function trackFeedbackByReference(
  input: TrackingInput
): Promise<ActionResult<FeedbackTracking>> {
  const validated = trackingSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Namba ya marejeleo si sahihi.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("feedback")
      .select(`
        id,
        reference_number,
        full_name,
        village,
        ward,
        phone,
        corruption_description,
        has_bribe_request,
        status,
        created_at
      `)
      .eq(
        "reference_number",
        validated.data.referenceNumber
      )
      .eq("is_deleted", false)
      .single();

    if (error || !data) {
      return {
        success: false,
        message:
          "Hakuna mrejesho uliopatikana kwa namba hiyo ya marejeleo.",
      };
    }

    return {
      success: true,
      message:
        "Mrejesho umepatikana kwa mafanikio.",
      data: {
        id: data.id,
        referenceNumber: data.reference_number,
        fullName: data.full_name,
        village: data.village,
        ward: data.ward,
        phone: data.phone,
        corruptionDescription:
          data.corruption_description,
        hasBribeRequest:
          data.has_bribe_request,
        status: data.status,
        createdAt: data.created_at,
      },
    };
  } catch (error) {
    console.error("[trackFeedbackByReference]", error);

    return {
      success: false,
      message:
        "Hitilafu ya mfumo imetokea. Tafadhali jaribu tena baadaye.",
    };
  }
}