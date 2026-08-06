"use server";

import {
  actionFailure,
  executeAction,
} from "@/lib/actions/utils";

import {
  feedbackRepository,
} from "@/lib/repositories/feedback.repository";

import type {
  ActionResult,
} from "@/lib/types/action-result";

import type {
  Feedback,
} from "@/lib/types/feedback";


export async function getDeletedReport(
  id: string
): Promise<ActionResult<Feedback>> {

  if (!id) {
    return actionFailure(
      "Report id is required."
    );
  }


  return executeAction(
    async () => {

      const report =
        await feedbackRepository.findDeletedById(
          id
        );


      if (!report) {
        throw new Error(
          "Deleted report not found."
        );
      }


      return report;

    },

    "Failed to fetch deleted report."
  );
}
