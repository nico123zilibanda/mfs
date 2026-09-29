import {
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
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
    <Card
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Top Accent */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-linear-to-r
          from-purple-500
          via-[#6d28d9]
          to-indigo-500
        "
      />

      {/* Header */}
      <CardHeader className="p-5 sm:p-6">
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          {/* Report Identity */}
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-50
                  text-[#6d28d9]
                  ring-1
                  ring-purple-100
                  dark:bg-purple-950/40
                  dark:text-purple-300
                  dark:ring-purple-900/50
                "
              >
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#6d28d9]
                    dark:text-purple-300
                  "
                >
                  Taarifa ya malalamiko
                </p>

                <h1
                  className="
                    mt-1
                    truncate
                    font-mono
                    text-xl
                    font-bold
                    tracking-tight
                    text-slate-950
                    sm:text-2xl
                    dark:text-white
                  "
                >
                  {report.referenceNumber}
                </h1>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Taarifa ya mwananchi iliyowasilishwa kupitia
                  mfumo wa Serikali ya Wilaya ya Mlele.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div
            className="
              flex
              shrink-0
              items-center
              lg:pt-1
            "
          >
            <FeedbackStatusBadge status={report.status} />
          </div>
        </div>
      </CardHeader>

      {/* Metadata */}
      <CardContent
        className="
          border-t
          border-slate-100
          p-5
          sm:p-6
          dark:border-slate-800
        "
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Submitted */}
          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            iconClassName="
              bg-purple-50
              text-[#6d28d9]
              dark:bg-purple-950/40
              dark:text-purple-300
            "
            label="Imetumwa"
            value={formatDateTime(report.createdAt)}
          />

          {/* Updated */}
          <InfoItem
            icon={<Clock3 className="h-4 w-4" />}
            iconClassName="
              bg-amber-50
              text-amber-600
              dark:bg-amber-950/40
              dark:text-amber-300
            "
            label="Imesasishwa"
            value={formatDateTime(report.updatedAt)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  iconClassName,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-slate-100
        bg-slate-50/70
        p-3.5
        transition-colors
        dark:border-slate-800
        dark:bg-slate-800/50
      "
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${iconClassName}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-400
            dark:text-slate-500
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-sm
            font-semibold
            text-slate-700
            dark:text-slate-200
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
