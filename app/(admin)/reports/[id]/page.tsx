import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import EmptyState from "@/components/admin/dashboard/empty-state";

import { getReportById } from "@/lib/actions/report-details";


export default async function ReportDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const result = await getReportById(id);

  return (
    <main className="space-y-6">
      <DashboardHeader
        title="Report Details"
        description="View full citizen complaint information"
      />

      {!result.success ? (
        <EmptyState
          title="Report not found"
          description={result.message}
        />
      ) : (
        <div className="grid gap-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Reference Number
            </p>
            <h2 className="text-xl font-semibold">
              {result.data.referenceNumber}
            </h2>
          </div>

          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Citizen Information
            </p>

            <div className="mt-2 space-y-1">
              <p className="font-medium">
                {result.data.fullName}
              </p>
              <p className="text-sm">
                {result.data.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.data.village}, {result.data.ward}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Complaint Description
            </p>

            <p className="mt-2 whitespace-pre-line">
              {result.data.corruptionDescription}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Current Status
            </p>

            <p className="mt-2 font-medium">
              {result.data.status}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}