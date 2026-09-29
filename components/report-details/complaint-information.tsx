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
  const hasBribeRequest = report.hasBribeRequest;

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
      {/* Government Accent */}
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
        <div className="flex items-start gap-4">
          {/* Section Icon */}
          <div
            className="
              flex
              h-11
              w-11
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
            <FileWarning className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <CardTitle
              className="
                text-lg
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Maelezo ya Tukio
            </CardTitle>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Maelezo ya malalamiko yaliyowasilishwa
              na mwananchi.
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Complaint Description */}
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            dark:border-slate-800
            dark:bg-slate-800/30
          "
        >
          {/* Section Label */}
          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-slate-200
              px-4
              py-3
              dark:border-slate-800
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-purple-50
                text-[#6d28d9]
                ring-1
                ring-purple-100
                dark:bg-purple-950/40
                dark:text-purple-300
                dark:ring-purple-900/50
              "
            >
              <MessageSquareText className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Maelezo ya Malalamiko
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 sm:p-5">
            <div
              className="
                rounded-xl
                border
                border-purple-100
                bg-white
                px-4
                py-4
                shadow-sm
                dark:border-purple-900/40
                dark:bg-slate-900/70
              "
            >
              <p
                className="
                  whitespace-pre-wrap
                  wrap-break-word
                  text-sm
                  leading-7
                  text-slate-700
                  dark:text-slate-200
                "
              >
                {report.corruptionDescription || (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    Hakuna maelezo yaliyowekwa.
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Bribe Request */}
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            p-4
            transition-colors
            dark:border-slate-800
            dark:bg-slate-800/30
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Information */}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ring-1
                  ${
                    hasBribeRequest
                      ? `
                        bg-red-50
                        text-red-600
                        ring-red-100
                        dark:bg-red-950/40
                        dark:text-red-400
                        dark:ring-red-900/50
                      `
                      : `
                        bg-purple-50
                        text-[#6d28d9]
                        ring-purple-100
                        dark:bg-purple-950/40
                        dark:text-purple-300
                        dark:ring-purple-900/50
                      `
                  }
                `}
              >
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Je, Rushwa Iliombwa?
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Taarifa iliyotolewa na mwananchi.
                </p>
              </div>
            </div>

            {/* Status */}
            <Badge
              variant={hasBribeRequest ? "destructive" : "secondary"}
              className="
                w-fit
                shrink-0
                rounded-lg
                px-3
                py-1
                text-xs
                font-bold
              "
            >
              {hasBribeRequest ? "Ndiyo" : "Hapana"}
            </Badge>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
