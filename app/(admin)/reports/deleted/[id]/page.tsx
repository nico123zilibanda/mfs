import DashboardPage from "@/components/admin/dashboard/dashboard-page";
import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import EmptyState from "@/components/admin/dashboard/empty-state";

import ReportHeader from "@/components/admin/report-details/report-header";
import ReportInformation from "@/components/admin/report-details/report-information";
import CitizenInformation from "@/components/admin/report-details/citizen-information";
import ComplaintInformation from "@/components/admin/report-details/complaint-information";
import TimelineCard from "@/components/admin/report-details/timeline-card";

import RestoreCard from "@/components/admin/report-details/management/restore-card";
import PermanentDeleteDangerZone from "@/components/admin/report-details/management/permanent-delete-danger-zone";

import { getDeletedReport } from "@/lib/actions/get-deleted-report";


type DeletedReportDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};


export default async function DeletedReportDetailsPage({
  params,
}: DeletedReportDetailsPageProps) {

  const {
    id,
  } = await params;


  const result =
    await getDeletedReport(id);



  if (!result.success) {

    return (
      <DashboardPage>

        <DashboardHeader
          title="Deleted Report"
          description="View and restore deleted citizen feedback reports."
        />


        <EmptyState
          title="Deleted report not found"
          description={result.message}
        />

      </DashboardPage>
    );
  }



  return (
    <DashboardPage>

      <DashboardHeader
        title="Deleted Report"
        description="View and restore deleted citizen feedback reports."
      />



      <div className="grid gap-6 lg:grid-cols-3">


        {/* Report Information */}

        <div className="space-y-6 lg:col-span-2">

          <ReportHeader
            report={result.data}
          />


          <ReportInformation
            report={result.data}
          />


          <CitizenInformation
            report={result.data}
          />


          <ComplaintInformation
            report={result.data}
          />


          <TimelineCard
            report={result.data}
          />

        </div>




        {/* Deleted Management */}

        <div className="space-y-6">

          <RestoreCard
            report={result.data}
          />


          <PermanentDeleteDangerZone
            report={result.data}
          />

        </div>


      </div>


    </DashboardPage>
  );
}
