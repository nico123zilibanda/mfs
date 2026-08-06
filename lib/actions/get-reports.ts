"use server";

import { executeAction } from "@/lib/actions/utils";

import { feedbackRepository } from "@/lib/repositories/feedback.repository";

import type {
  ReportsFilters,
  ReportsResponse,
} from "@/lib/types/report";

import type {
  ActionResult,
} from "@/lib/types/action-result";

export async function getReports(
  filters: ReportsFilters
): Promise<ActionResult<ReportsResponse>> {
  return executeAction(
    () => feedbackRepository.findAll(filters),
    "Failed to fetch reports."
  );
}