import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardPage from "@/components/dashboard/dashboard-page";
import PageSection from "@/components/dashboard/page-section";
import DataTable from "@/components/table/data-table";
import { ReportTableSkeleton } from "@/components/table/table-skeletons";

export default function Loading() {
  return (
    <DashboardPage>
      <DashboardHeader title="Taarifa" description="Inapakia taarifa za wananchi." />
      <PageSection>
        <DataTable title="Taarifa zote" description="Inapakia taarifa...">
          <ReportTableSkeleton />
        </DataTable>
      </PageSection>
    </DashboardPage>
  );
}
