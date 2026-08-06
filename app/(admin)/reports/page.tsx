import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import DashboardPage from "@/components/admin/dashboard/dashboard-page";
import PageSection from "@/components/admin/dashboard/page-section";

import DataTableError from "@/components/admin/table/data-table-error";

import ReportsTable from "./reports-table";

import { getReports } from "@/lib/actions/get-reports";

import type { ReportsFilters } from "@/lib/types/report";

type ReportsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  const params = await searchParams;

  const filters: ReportsFilters = {
    page: Number(params.page) || 1,
    search: params.search ?? "",
    status:
      (params.status as ReportsFilters["status"]) ??
      "all",
  };

  const result = await getReports(filters);

  return (
    <DashboardPage>
      <DashboardHeader
        title="Taarifa"
        description="Tafuta, kagua na simamia taarifa zote za wananchi."
      />

      <PageSection>
        {!result.success ? (
          <DataTableError
            description={result.message}
          />
        ) : (
          <ReportsTable
            reports={result.data.reports}
            filters={filters}
            pagination={{
              page: result.data.page,
              totalPages: result.data.totalPages,
              totalItems: result.data.total,
              pageSize: result.data.pageSize,
            }}
          />
        )}
      </PageSection>
    </DashboardPage>
  );
}
