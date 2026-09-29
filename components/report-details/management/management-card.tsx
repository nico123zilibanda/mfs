import {
  Settings2,
  ShieldCheck,
} from "lucide-react";

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
    <section className="space-y-6">
      {/* Management Header */}
      <div
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
        {/* Accent */}
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

        <div
          className="
            flex
            flex-col
            gap-4
            p-5
            sm:p-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          {/* Title */}
          <div className="flex items-start gap-4">
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
              <Settings2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Usimamizi wa Taarifa
              </h2>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Sasisha hali ya taarifa, ongeza dokezo la
                ndani, au simamia uhifadhi wa taarifa hii.
              </p>
            </div>
          </div>

          {/* Reference */}
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            <ShieldCheck
              className="
                h-4
                w-4
                text-slate-400
                dark:text-slate-500
              "
            />

            <div>
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Kumbukumbu
              </p>

              <p
                className="
                  font-mono
                  text-xs
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                {report.referenceNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Grid */}
      <div
        className="
          py-2
        "
      >
        {/* Status */}
        <div className="min-w-0 py-2">
          <StatusForm report={report} />
        </div>

        {/* Admin Note */}
        <div className="min-w-0 py-2">
          <AdminNoteForm report={report} />
        </div>

        {/* Archive / Danger */}
        <div className="min-w-0 xl:col-span-2 py-2">
          <DangerZone report={report} />
        </div>
      </div>
    </section>
  );
}
