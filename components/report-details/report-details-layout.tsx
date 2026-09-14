import ReportInformation from "./report-information";
import CitizenInformation from "./citizen-information";
import ComplaintInformation from "./complaint-information";
import TimelineCard from "./timeline-card";

import ManagementCard from "./management/management-card";

import type { Feedback } from "@/lib/types/feedback";

type ReportDetailsLayoutProps = {
  report: Feedback;
};

export default function ReportDetailsLayout({
  report,
}: ReportDetailsLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main content */}

      <div className="space-y-6 lg:col-span-2">
        <CitizenInformation report={report} />

        <ComplaintInformation report={report} />

      </div>

      {/* Sidebar */}

      <div className="space-y-6">
        <ManagementCard report={report} />
      </div>
    </div>
  );
}
