import DashboardPage from "@/components/dashboard/dashboard-page";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import EmptyState from "@/components/dashboard/empty-state";

import ReportHeader from "@/components/report-details/report-header";
import CitizenInformation from "@/components/report-details/citizen-information";
import ComplaintInformation from "@/components/report-details/complaint-information";

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

        <EmptyState
          title="Taarifa zilizohifadhiwa hazipo!"
          description={result.message}
        />

      </DashboardPage>
    );
  }



  return (
    <DashboardPage>
      <div className="grid gap-6 lg:grid-cols-3">


        {/* Report Information */}

        <div className="space-y-6 lg:col-span-2">

          <ReportHeader
            report={result.data}
          />


          <CitizenInformation
            report={result.data}
          />


          <ComplaintInformation
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
