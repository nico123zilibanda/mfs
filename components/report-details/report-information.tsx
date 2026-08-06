
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FeedbackStatusBadge from "@/components/feedback/feedback-status-badge";

import type { Feedback } from "@/lib/types/feedback";

type ReportInformationProps = {
  report: Feedback;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ReportInformation({
  report,
}: ReportInformationProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>
          Muhtasari wa taarifa
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Namba ya kumbukumbu
          </p>

          <p className="font-medium break-all">
            {report.referenceNumber}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Hali
          </p>

          <FeedbackStatusBadge status={report.status} />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Rushwa iliombwa?
          </p>

          <p className="font-medium">
            {report.hasBribeRequest
              ? "Ndiyo"
              : "Hapana"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Imetumwa
          </p>

          <p className="font-medium">
            {formatDate(
              report.createdAt
            )}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Ilisasishwa
          </p>

          <p className="font-medium">
            {formatDate(
              report.updatedAt
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
