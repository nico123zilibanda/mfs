import {
  CalendarDays,
  CheckCircle2,
  FileBadge,
  ShieldAlert,
} from "lucide-react";

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

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/40">
        <Icon className="h-5 w-5 text-purple-700 dark:text-purple-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <div className="mt-1 text-sm font-medium text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ReportInformation({
  report,
}: ReportInformationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileBadge className="h-5 w-5 text-purple-700 dark:text-purple-500" />
          Muhtasari wa Taarifa
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <InfoRow
          icon={FileBadge}
          label="Namba ya Kumbukumbu"
        >
          <span className="break-all font-mono">
            {report.referenceNumber}
          </span>
        </InfoRow>

        <InfoRow
          icon={CheckCircle2}
          label="Hali ya Taarifa"
        >
          <FeedbackStatusBadge status={report.status} />
        </InfoRow>

        <InfoRow
          icon={ShieldAlert}
          label="Rushwa Iliombwa?"
        >
          <span>
            {report.hasBribeRequest ? "Ndiyo" : "Hapana"}
          </span>
        </InfoRow>

        <InfoRow
          icon={CalendarDays}
          label="Ilitumwa"
        >
          {formatDate(report.createdAt)}
        </InfoRow>

        <InfoRow
          icon={CalendarDays}
          label="Ilisasishwa"
        >
          {formatDate(report.updatedAt)}
        </InfoRow>
      </CardContent>
    </Card>
  );
}