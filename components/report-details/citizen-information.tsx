import {
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

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

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
        <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 wrap-break-word font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function CitizenInformation({
  report,
}: CitizenInformationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserRound className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
          Taarifa za Mwananchi
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
        <InfoItem
          icon={UserRound}
          label="Jina Kamili"
          value={report.fullName || "Bila jina"}
        />

        <InfoItem
          icon={Phone}
          label="Namba ya Simu"
          value={report.phone}
        />

        <InfoItem
          icon={MapPin}
          label="Kijiji"
          value={report.village}
        />

        <InfoItem
          icon={MapPin}
          label="Kata"
          value={report.ward}
        />
      </CardContent>
    </Card>
  );
}