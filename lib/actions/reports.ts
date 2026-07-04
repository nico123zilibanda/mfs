"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import type {
  ActionResult,
} from "@/lib/types/action-result";

import type {
  ReportsFilters,
  ReportsResponse,
  ReportListItem,
} from "@/lib/types/report";

/**
 * Helper: escape empty strings
 */
function normalizeFilters(filters: ReportsFilters) {
  return {
    page: filters.page ?? 1,
    search: filters.search?.trim() ?? "",
    status: filters.status ?? "all",
  };
}

export async function getReports(
  filters: ReportsFilters
): Promise<ActionResult<ReportsResponse>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { page, search, status } =
      normalizeFilters(filters);

    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("feedback")
      .select(
        `
          id,
          reference_number,
          full_name,
          village,
          corruption_description,
          has_bribe_request,
          ward,
          phone,
          status,
          created_at
        `,
        { count: "exact" }
      )
      .eq("is_deleted", false);

    /**
     * SEARCH (reference, name, phone)
     */
    if (search) {
      query = query.or(
        `reference_number.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    /**
     * STATUS FILTER
     */
    if (status !== "all") {
      query = query.eq("status", status);
    }

    /**
     * PAGINATION
     */
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Reports Error:", error);

      return {
        success: false,
        message: "Failed to fetch reports.",
      };
    }

    const reports: ReportListItem[] =
      (data ?? []).map((item) => ({
        id: item.id,
        referenceNumber: item.reference_number,
        fullName: item.full_name,
        village: item.village,
        ward: item.ward,
        corruptionDescription: item.corruption_description,
        hasBribeRequest: item.has_bribe_request,
        phone: item.phone,
        status: item.status,
        createdAt: item.created_at,
      }));

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      message: "Reports fetched successfully.",
      data: {
        reports,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Unexpected Reports Error:", error);

    return {
      success: false,
      message: "Unexpected server error.",
    };
  }
}