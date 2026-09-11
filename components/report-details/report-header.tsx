import {
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FeedbackStatusBadge from "@/components/feedback/feedback-status-badge";

import type { Feedback } from "@/lib/types/feedback";

type ReportHeaderProps = {
  report: Feedback;
};

export default function ReportHeader({
  report,
}: ReportHeaderProps) {
  return (
    <Card className="overflow-hidden border-border shadow-sm">
      {/* Top Government Accent */}
      <div className="h-1 w-full bg-linear-to-r from-purple-700 via-purple-600 to-purple-500" />

      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <CardDescription className="text-xs uppercase tracking-[0.18em] text-purple-700 dark:text-purple-500">
                  Citizen Feedback Report
                </CardDescription>

                <CardTitle className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground">
                  {report.referenceNumber}
                </CardTitle>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Taarifa ya mwananchi iliyowasilishwa kupitia mfumo wa
              Serikali ya Wilaya ya Mlele.
            </p>
          </div>

          <FeedbackStatusBadge status={report.status} />
        </div>
      </CardHeader>

      <CardContent className="border-t border-border bg-muted/30">
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/40">
              <CalendarDays className="h-4 w-4 text-purple-700 dark:text-purple-400" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Imetumwa
              </p>

              <p className="font-medium text-foreground">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/40">
              <Clock3 className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Imesasishwa
              </p>

              <p className="font-medium text-foreground">
                {new Date(report.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}