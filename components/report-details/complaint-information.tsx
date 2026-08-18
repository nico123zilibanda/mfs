import {
  AlertTriangle,
  FileWarning,
  MessageSquareText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import type { Feedback } from "@/lib/types/feedback";

type ComplaintInformationProps = {
  report: Feedback;
};

export default function ComplaintInformation({
  report,
}: ComplaintInformationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileWarning className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
          Maelezo ya Tukio
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Complaint Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />

            <p className="text-sm font-semibold text-foreground">
              Maelezo ya Maoni au Malalamiko
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">
              {report.corruptionDescription}
            </p>
          </div>
        </div>

        {/* Bribe Request */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-lg
                  ${
                    report.hasBribeRequest
                      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }
                `}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Je, Rushwa Iliombwa?
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Taarifa iliyotolewa na mwananchi.
                </p>
              </div>
            </div>

            <Badge
              variant={
                report.hasBribeRequest
                  ? "destructive"
                  : "secondary"
              }
            >
              {report.hasBribeRequest ? "Ndiyo" : "Hapana"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}