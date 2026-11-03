"use server";

import { executeAction } from "@/lib/actions/utils";

import { systemReportRepository } from "@/lib/repositories/system-report.repository";

import type { SystemReportFilters } from "@/lib/types/report";
import type { ActionResult } from "@/lib/types/action-result";

export async function getSystemReport(
  filters: SystemReportFilters,
): Promise<ActionResult<Awaited<ReturnType<typeof systemReportRepository.getSystemReport>>>> {
  return executeAction(
    () => systemReportRepository.getSystemReport(filters),
    "Failed to generate system report.",
  );
}