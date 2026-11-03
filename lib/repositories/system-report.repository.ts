import { feedbackRepository } from "@/lib/repositories/feedback.repository";
import { meetingRepository } from "@/lib/repositories/meeting.repository";

import type { ReportsFilters } from "@/lib/types/report";
import type {
  SystemReportFilters,
  SystemReportResult,
  SystemReportDateRange,
  ReportPeriod,
} from "@/lib/types/report";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolveDateRange(
  period: ReportPeriod,
  startDate?: string,
  endDate?: string,
): SystemReportDateRange {
  const now = new Date();

  if (period === "custom") {
    if (!startDate || !endDate) {
      throw new Error("Custom period requires startDate and endDate.");
    }
    return { startDate, endDate };
  }

  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { startDate: toIsoDate(start), endDate: toIsoDate(now) };
  }

  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }

  // yearly
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

export async function getSystemReport(
  filters: SystemReportFilters,
): Promise<SystemReportResult> {
  const range = resolveDateRange(
    filters.period,
    filters.startDate,
    filters.endDate,
  );

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;

  const includeComplaints =
    filters.type === "complaints" || filters.type === "combined";
  const includeMeetings =
    filters.type === "meetings" || filters.type === "combined";

  let complaints: Awaited<ReturnType<typeof feedbackRepository.findAll>>["reports"] = [];
  let complaintsTotal = 0;
  let meetings: Awaited<ReturnType<typeof meetingRepository.listMeetings>>["meetings"] = [];
  let meetingsTotal = 0;

  if (includeComplaints) {
    const feedbackFilters: ReportsFilters = {
      page,
      search: filters.search ?? "",
      status: "all",
      startDate: range.startDate,
      endDate: range.endDate,
    };
    const result = await feedbackRepository.findAll(feedbackFilters);
    complaints = result.reports;
    complaintsTotal = result.total;
  }

  if (includeMeetings) {
    const result = await meetingRepository.listMeetings({
      page,
      pageSize,
      search: filters.search,
      startDate: range.startDate,
      endDate: range.endDate,
    });
    meetings = result.meetings;
    meetingsTotal = result.total;
  }

  return {
    type: filters.type,
    period: filters.period,
    range,
    complaints,
    meetings,
    complaintsTotal,
    meetingsTotal,
  };
}

export const systemReportRepository = {
  resolveDateRange,
  getSystemReport,
};