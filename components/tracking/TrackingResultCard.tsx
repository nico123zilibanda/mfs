"use client";

import {
  CalendarDays,
  FileText,
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

import StatusBadge from "@/components/tracking/StatusBadge";

import type { FeedbackTracking } from "@/lib/types/tracking";

type TrackingResultCardProps = {
  feedback: FeedbackTracking;
};

export default function TrackingResultCard({
  feedback,
}: TrackingResultCardProps) {
  const submittedDate = new Date(
    feedback.createdAt
  ).toLocaleDateString("sw-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card
      className="
          relative
          overflow-hidden
          rounded-2xl
          border
          mt-5
          border-slate-200
          bg-white
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
      "
    >
      {/* =====================================================
          TOP ACCENT
      ====================================================== */}
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

      {/* =====================================================
          HEADER
      ====================================================== */}
      <CardHeader
        className="
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-6
          dark:border-slate-800
        "
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
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
              text-purple-600
              ring-1
              ring-purple-100
              dark:bg-purple-950/40
              dark:text-purple-400
              dark:ring-purple-900/50
            "
          >
            <FileText className="h-5 w-5" />
          </div>

          {/* Heading */}
          <div className="min-w-0">
            <CardTitle
              className="
                text-base
                font-bold
                tracking-tight
                text-slate-900
                sm:text-lg
                dark:text-white
              "
            >
              Taarifa yako
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
              Maelezo ya taarifa yako pamoja na hali
              yake ya sasa.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5 sm:p-6">
        {/* ===================================================
            STATUS & REFERENCE
        ==================================================== */}
        <div
          className="
            grid
            gap-4
            md:grid-cols-[1fr_auto]
          "
        >
          {/* Status */}
          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50/70
              p-4
              dark:border-slate-800
              dark:bg-slate-800/40
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                  ring-4
                  ring-emerald-500/10
                "
              />

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Hali ya taarifa
              </p>
            </div>

            <div className="mt-3">
              <StatusBadge
                status={feedback.status}
              />
            </div>
          </div>

          {/* Reference */}
          <div
            className="
              rounded-xl
              border
              border-purple-100
              bg-purple-50/60
              p-4
              md:min-w-64
              dark:border-purple-900/50
              dark:bg-purple-950/30
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.08em]
                text-purple-600
                dark:text-purple-400
              "
            >
              Namba ya marejeleo
            </p>

            <p
              className="
                mt-2
                break-all
                font-mono
                text-sm
                font-bold
                tracking-wide
                text-slate-900
                dark:text-white
              "
            >
              {feedback.referenceNumber}
            </p>
          </div>
        </div>

        {/* ===================================================
            SUBMISSION DATE
        ==================================================== */}
        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-slate-100
            bg-slate-50/50
            px-4
            py-3
            dark:border-slate-800
            dark:bg-slate-800/30
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
              bg-white
              text-slate-500
              ring-1
              ring-slate-200
              dark:bg-slate-900
              dark:text-slate-400
              dark:ring-slate-700
            "
          >
            <CalendarDays className="h-4 w-4" />
          </div>

          <div>
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
                dark:text-slate-500
              "
            >
              Tarehe ya kuwasilishwa
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              {submittedDate}
            </p>
          </div>
        </div>

        {/* ===================================================
            CITIZEN INFORMATION
        ==================================================== */}
        <div>
          <SectionHeading title="Taarifa za mwombaji" />

          <div
            className="
              mt-3
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            <InfoItem
              icon={<UserRound />}
              label="Jina kamili"
              value={feedback.fullName}
            />

            <InfoItem
              icon={<Phone />}
              label="Namba ya simu"
              value={feedback.phone}
            />

            <InfoItem
              icon={<MapPin />}
              label="Kijiji"
              value={feedback.village}
            />

            <InfoItem
              icon={<MapPin />}
              label="Kata"
              value={feedback.ward}
            />

            <InfoItem
              label="Je, uliombwa rushwa?"
              value={
                feedback.hasBribeRequest
                  ? "Ndiyo"
                  : "Hapana"
              }
              highlight={
                feedback.hasBribeRequest
              }
            />
          </div>
        </div>

        {/* ===================================================
            COMPLAINT DESCRIPTION
        ==================================================== */}
        <div>
          <SectionHeading title="Maelezo ya malalamiko" />

          <div
            className="
              mt-3
              rounded-xl
              border
              border-slate-200
              bg-slate-50/70
              p-5
              dark:border-slate-800
              dark:bg-slate-800/40
            "
          >
            <p
              className="
                whitespace-pre-wrap
                text-sm
                leading-7
                text-slate-700
                dark:text-slate-300
              "
            >
              {feedback.corruptionDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  title,
}: {
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="
          h-4
          w-1
          rounded-full
          bg-purple-600
          dark:bg-purple-400
        "
      />

      <h3
        className="
          text-sm
          font-bold
          tracking-tight
          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h3>
    </div>
  );
}

/* ============================================================
   INFORMATION ITEM
============================================================ */

function InfoItem({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <p
        className="
          flex
          items-center
          gap-2
          text-[11px]
          font-bold
          uppercase
          tracking-[0.06em]
          text-slate-400
          dark:text-slate-500
        "
      >
        {icon && (
          <span
            className="
              text-slate-400
              dark:text-slate-500
              [&_svg]:h-3.5
              [&_svg]:w-3.5
            "
          >
            {icon}
          </span>
        )}

        {label}
      </p>

      <p
        className={`
          mt-2
          text-sm
          font-semibold
          ${
            highlight
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-900 dark:text-white"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}
