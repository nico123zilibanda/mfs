import DashboardPage from "@/components/dashboard/dashboard-page";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import EmptyState from "@/components/dashboard/empty-state";

import ReportHeader from "@/components/report-details/report-header";
import ReportInformation from "@/components/report-details/report-information";
import CitizenInformation from "@/components/report-details/citizen-information";
import ComplaintInformation from "@/components/report-details/complaint-information";
import TimelineCard from "@/components/report-details/timeline-card";

import RestoreCard from "@/components/report-details/management/restore-card";
import PermanentDeleteDangerZone from "@/components/report-details/management/permanent-delete-danger-zone";

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
          title="Taarifa Zilizofutwa"
          description="Tazama na urejeshe ripoti za maoni ya raia zilizofutwa."
        />


        <EmptyState
          title="Taarifa zilizofutwa hazipo!"
          description={result.message}
        />

      </DashboardPage>
    );
  }



  return (
    <DashboardPage>

      <DashboardHeader
        title="Taarifa Zilizofutwa."
        description="Tazama na urejeshe ripoti za maoni ya raia zilizofutwa."
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
