import DashboardHeader from "@/components/dashboard/dashboard-header";
import EmptyState from "@/components/dashboard/empty-state";

import ReportHeader from "@/components/report-details/report-header";
import ReportDetailsLayout from "@/components/report-details/report-details-layout";

import { getReport } from "@/lib/actions/get-report";

type ReportDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailsPage({
  params,
}: ReportDetailsPageProps) {
  const { id } = await params;

  const result = await getReport(id);

  return (
    <main className="space-y-6">
      {!result.success ? (
        <EmptyState title="Taarifa haijapatikana" description={result.message} />
      ) : (
        <>
          <ReportHeader report={result.data} />

          <ReportDetailsLayout report={result.data} />
        </>
      )}
    </main>
  );
}
