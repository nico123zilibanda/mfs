import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import EmptyState from "@/components/admin/dashboard/empty-state";

import ReportsToolbar from "@/components/admin/reports/reports-toolbar";
import ReportsTable from "@/components/admin/reports/reports-table";
import ReportsPagination from "@/components/admin/reports/reports-pagination";

import { getReports } from "@/lib/actions/reports";

import type { ReportsFilters } from "@/lib/types/report";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const filters: ReportsFilters = {
    page: Number(params.page) || 1,
    search: params.search || "",
    status: (params.status as any) || "all",
  };

  const result = await getReports(filters);

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <DashboardHeader
        title="Reports"
        description="Manage and review all citizen feedback reports."
      />

      {!result.success && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive">
            Failed to load reports
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.message}
          </p>
        </div>
      )}

      {result.success && (
        <>
          <ReportsToolbar
            defaultSearch={filters.search}
            defaultStatus={filters.status}
          />

          {result.data.reports.length === 0 ? (
            <EmptyState
              title="No reports found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <ReportsTable reports={result.data.reports} />

              <ReportsPagination
                page={result.data.page}
                totalPages={result.data.totalPages}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}