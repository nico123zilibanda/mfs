"use server";

import {
  executeAction,
} from "@/lib/actions/utils";

import {
  feedbackRepository,
} from "@/lib/repositories/feedback.repository";

import type {
  ActionResult,
} from "@/lib/types/action-result";

import type {
  ReportsFilters,
  ReportsResponse,
} from "@/lib/types/report";


export async function getDeletedReports(
  filters: ReportsFilters
): Promise<ActionResult<ReportsResponse>> {

  return executeAction(
    () =>
      feedbackRepository.findDeleted(
        filters
      ),

    "Failed to fetch deleted reports."
  );
}