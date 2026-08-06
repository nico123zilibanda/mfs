
import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Feedback } from "@/lib/types/feedback";

type CitizenInformationProps = {
  report: Feedback;
};

export default function CitizenInformation({
  report,
}: CitizenInformationProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-5">
        <CardTitle className="flex items-center gap-2 text-lg"><UserRound className="h-5 w-5 text-[#006b3c]" /> Taarifa za mwananchi</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Jina kamili
          </p>

          <p className="font-medium">
            {report.fullName || "Bila jina"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Namba ya simu
          </p>

          <p className="font-medium">
            {report.phone}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Kijiji
          </p>

          <p className="font-medium">
            {report.village}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Kata
          </p>

          <p className="font-medium">
            {report.ward}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
