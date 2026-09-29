import type { ElementType, ReactNode } from "react";

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

type InfoItemProps = {
  icon: ElementType;
  label: string;
  value: ReactNode;
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div
      className="
        group
        flex
        min-w-0
        items-start
        gap-3
        rounded-xl
        border
        border-slate-200
        bg-slate-50/70
        p-4
        transition-all
        hover:border-purple-200
        hover:bg-purple-50/40
        dark:border-slate-800
        dark:bg-slate-800/40
        dark:hover:border-purple-900/60
        dark:hover:bg-purple-950/20
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-purple-50
          text-[#6d28d9]
          ring-1
          ring-purple-100
          transition-colors
          group-hover:bg-purple-100
          dark:bg-purple-950/40
          dark:text-purple-300
          dark:ring-purple-900/50
          dark:group-hover:bg-purple-950/70
        "
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      {/* Information */}
      <div className="min-w-0 flex-1">
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
          {label}
        </p>

        <p
          className="
            mt-1.5
            wrap-break-word
            text-sm
            font-semibold
            leading-6
            text-slate-800
            dark:text-slate-100
          "
        >
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
            <UserRound className="h-5 w-5" />
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
              Taarifa za Mwananchi
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
              Taarifa za msingi za mwananchi aliyewasilisha
              malalamiko haya.
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Information Grid */}
      <CardContent
        className="
          grid
          gap-4
          px-5
          pb-5
          sm:grid-cols-2
          sm:px-6
          sm:pb-6
        "
      >
        <InfoItem
          icon={UserRound}
          label="Jina Kamili"
          value={report.fullName || "Bila jina"}
        />

        <InfoItem
          icon={Phone}
          label="Namba ya Simu"
          value={report.phone || "Haijawekwa"}
        />

        <InfoItem
          icon={MapPin}
          label="Kijiji"
          value={report.village || "Haijawekwa"}
        />

        <InfoItem
          icon={MapPin}
          label="Kata"
          value={report.ward || "Haijawekwa"}
        />
      </CardContent>
    </Card>
  );
}
