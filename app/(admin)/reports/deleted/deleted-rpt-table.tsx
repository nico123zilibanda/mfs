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

export default function DeletedReportsTable(props: Props) {
  return (
    <ReportTable
      {...props}
      title="Taarifa zilizofutwa"
      description="Rejesha au futa kabisa taarifa zilizowekwa kwenye kumbukumbu ya taka."
      detailBasePath="/reports/deleted"
    />
  );
}
