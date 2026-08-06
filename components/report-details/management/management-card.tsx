import { Separator } from "@/components/ui/separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Feedback } from "@/lib/types/feedback";
import StatusForm from "./status-form";
import AdminNoteForm from "./admin-note-form";
import DangerZone from "./danger-zone";

type ManagementCardProps = {
  report: Feedback;
};

export default function ManagementCard({
  report,
}: ManagementCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle>
          Usimamizi
        </CardTitle>

        <CardDescription>
          Sasisha hali, hifadhi dokezo la ndani au ondoa taarifa kwenye orodha hai.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">

        {/* Status */}

        <section className="space-y-4">

          {/* StatusForm */}
        <StatusForm report={report} />


        </section>

        <Separator />

        {/* Admin Note */}

        <section className="space-y-4">

          {/* AdminNoteForm */}
          <AdminNoteForm report={report} />

        </section>

        <Separator />

        {/* Danger Zone */}

        <section className="space-y-4">

          {/* DangerZone */}
          <DangerZone report={report} />

        </section>

      </CardContent>
    </Card>
  );
}
