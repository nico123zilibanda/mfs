"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type { ActionResult } from "@/lib/types/action-result";

type PermanentlyDeleteManyInput = {
  ids: string[];
};

export async function permanentlyDeleteManyFeedback(
  input: PermanentlyDeleteManyInput
): Promise<ActionResult<void>> {
  const ids = Array.from(
    new Set(
      input.ids.filter(
        (id): id is string =>
          typeof id === "string" &&
          id.trim().length > 0
      )
    )
  );

  if (ids.length === 0) {
    return actionFailure(
      "Hakuna taarifa zilizochaguliwa."
    );
  }

  return executeAction(async () => {
    await feedbackRepository.permanentlyDeleteMany(ids);

    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return;
  }, "Imeshindikana kufuta taarifa kabisa.");
}