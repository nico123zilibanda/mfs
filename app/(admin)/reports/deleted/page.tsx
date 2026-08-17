import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardPage from "@/components/dashboard/dashboard-page";
import PageSection from "@/components/dashboard/page-section";

import DataTableError from "@/components/table/data-table-error";

import DeletedTable from "./deleted-rpt-table";

import { getDeletedReports } from "@/lib/actions/get-deleted-reports";

import type { ReportsFilters } from "@/lib/types/report";
import { FEEDBACK_STATUS } from "@/lib/constants/feedback-status";

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

  const page = Number(params.page);
  const status = params.status;
  const filters: ReportsFilters = {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.search ?? "",
    status: status && status in FEEDBACK_STATUS ? (status as ReportsFilters["status"]) : "all",
  };

  const result = await getDeletedReports(filters);

  return (
    <DashboardPage>
      <DashboardHeader
        title="Taarifa zilizofutwa"
        description="Rejesha au futa kabisa taarifa za wananchi zilizofutwa."
      />

      <PageSection>
        {!result.success ? (
          <DataTableError
            description={result.message}
          />
        ) : (
          <DeletedTable
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
