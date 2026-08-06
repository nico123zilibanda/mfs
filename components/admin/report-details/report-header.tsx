
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FeedbackStatusBadge from "@/components/admin/status/feedback-status-badge";

import type { Feedback } from "@/lib/types/feedback";

type ReportHeaderProps = {
  report: Feedback;
};

export default function ReportHeader({
  report,
}: ReportHeaderProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-mono text-2xl text-slate-950">
              {report.referenceNumber}
            </CardTitle>

            <CardDescription>
              Taarifa ya mwananchi iliyowasilishwa kupitia mfumo.
            </CardDescription>
          </div>

          <FeedbackStatusBadge status={report.status} />
        </div>
      </CardHeader>

      <CardContent className="border-t border-slate-100 bg-slate-50/60">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
          <p>
            <span className="font-medium text-foreground">
              Imetumwa:
            </span>{" "}
            {new Date(
              report.createdAt
            ).toLocaleString()}
          </p>

          <p>
            <span className="font-medium text-foreground">
              Imesasishwa:
            </span>{" "}
            {new Date(
              report.updatedAt
            ).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
