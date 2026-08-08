import ReportTable from "@/components/table/report-table";
import type { RecentFeedback } from "@/lib/types/dashboard";

export default function RecentReportsTable({
  reports,
}: {
  reports: RecentFeedback[];
}) {
  return (
    <ReportTable
      reports={reports}
      title="Taarifa za karibuni"
      description="Taarifa za wananchi zilizowasilishwa hivi karibuni."
      detailBasePath="/reports"
      searchable={false}
    />
    
  );
}
