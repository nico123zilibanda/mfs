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
  CardDescription,
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

  return (
    <Card
      className="
        mt-8
        overflow-hidden
        border
        border-slate-200
        bg-white
        shadow-lg
        shadow-emerald-950/5

        dark:border-slate-800
        dark:bg-slate-950
      "
    >

      {/* Header */}

      <CardHeader
        className="
          border-b
          border-slate-100
          bg-emerald-50/50
          pb-6

          dark:border-slate-800
          dark:bg-emerald-950/20
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#006b3c]
              text-white
            "
          >

            <FileText className="h-5 w-5" />

          </div>


          <div>

            <CardTitle
              className="
                text-xl
                text-slate-950

                dark:text-white
              "
            >
              Taarifa yako
            </CardTitle>


            <CardDescription
              className="
                mt-1
                leading-6

                dark:text-slate-400
              "
            >
              Hapa unaweza kuona maelezo ya taarifa
              uliyowasilisha pamoja na hali yake ya sasa.
            </CardDescription>

          </div>


        </div>

      </CardHeader>



      <CardContent
        className="
          space-y-8
          p-5

          sm:p-8
        "
      >


        {/* Status */}

        <div
          className="
            flex
            flex-col
            gap-5

            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-5

            md:flex-row
            md:items-center
            md:justify-between

            dark:border-slate-800
            dark:bg-slate-900
          "
        >

          <div>

            <p
              className="
                mb-2
                text-sm
                font-medium
                text-slate-500

                dark:text-slate-400
              "
            >
              Hali ya Taarifa
            </p>


            <StatusBadge
              status={feedback.status}
            />

          </div>



          <div
            className="
              md:text-right
            "
          >

            <p
              className="
                flex
                items-center
                gap-2
                text-sm
                text-slate-500

                md:justify-end

                dark:text-slate-400
              "
            >

              <CalendarDays className="h-4 w-4" />

              Tarehe ya Kuwasilishwa

            </p>


            <p
              className="
                mt-1
                font-semibold
                text-slate-900

                dark:text-white
              "
            >

              {new Date(
                feedback.createdAt
              ).toLocaleDateString(
                "sw-TZ",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}

            </p>


          </div>

        </div>




        {/* Information Grid */}

        <div
          className="
            grid
            gap-5

            md:grid-cols-2
          "
        >

          <InfoItem
            label="Namba ya Marejeleo"
            value={feedback.referenceNumber}
          />


          <InfoItem
            icon={<UserRound className="h-4 w-4" />}
            label="Jina Kamili"
            value={feedback.fullName}
          />


          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Kijiji"
            value={feedback.village}
          />


          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Kata"
            value={feedback.ward}
          />


          <InfoItem
            icon={<Phone className="h-4 w-4" />}
            label="Namba ya Simu"
            value={feedback.phone}
          />


          <InfoItem
            label="Je, uliombwa rushwa?"
            value={
              feedback.hasBribeRequest
                ? "Ndiyo"
                : "Hapana"
            }
          />

        </div>




        {/* Description */}

        <div>

          <p
            className="
              mb-3
              text-sm
              font-medium
              text-slate-500

              dark:text-slate-400
            "
          >
            Maelezo ya Ufisadi
          </p>


          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5

              dark:border-slate-800
              dark:bg-slate-900
            "
          >

            <p
              className="
                whitespace-pre-wrap
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



function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
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
        dark:bg-slate-950
      "
    >

      <p
        className="
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-500

          dark:text-slate-400
        "
      >

        {icon}

        {label}

      </p>


      <p
        className="
          mt-2
          font-semibold
          text-slate-900

          dark:text-white
        "
      >
        {value}
      </p>


    </div>

  );
}