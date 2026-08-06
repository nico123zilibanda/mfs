
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { FileWarning } from "lucide-react";

import type { Feedback } from "@/lib/types/feedback";

type ComplaintInformationProps = {
  report: Feedback;
};

export default function ComplaintInformation({
  report,
}: ComplaintInformationProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-5">
        <CardTitle className="flex items-center gap-2 text-lg"><FileWarning className="h-5 w-5 text-[#006b3c]" /> Maelezo ya tukio</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Maelezo ya malalamiko
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-wrap leading-7">
              {report.corruptionDescription}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Je, rushwa iliombwa?
          </p>

          <Badge
            variant={
              report.hasBribeRequest
                ? "destructive"
                : "secondary"
            }
          >
            {report.hasBribeRequest
              ? "Ndiyo"
              : "Hapana"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
