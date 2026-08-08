import ReportTable from "@/components/table/report-table";
import type { ReportListItem, ReportsFilters } from "@/lib/types/report";

type Props = {
    reports: ReportListItem[];
    filters: ReportsFilters;
    pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

export default function ReportsTable(props: Props) {
  return (
    <ReportTable
      {...props}
      title="Taarifa zote"
      description="Kagua na simamia taarifa zote za wananchi."
      detailBasePath="/reports"
    />
  );
}
