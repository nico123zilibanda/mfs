import {
  AlertCircle,
  SearchX,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type TrackingEmptyStateProps = {
  title?: string;
  description?: string;
};

export default function TrackingEmptyState({
  title = "Taarifa haijapatikana",
  description = "Hatukupata taarifa inayolingana na namba ya marejeleo uliyoingiza.",
}: TrackingEmptyStateProps) {
  return (
    <Card
      className="
        mt-5
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
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-amber-100
              bg-amber-50
              text-amber-600
              shadow-sm
              dark:border-amber-900/50
              dark:bg-amber-950/30
              dark:text-amber-400
            "
          >
            <SearchX className="h-6 w-6" />
          </div>

          {/* Heading */}
          <div className="mt-4 max-w-lg">
            <h3
              className="
                text-base
                font-bold
                tracking-tight
                text-slate-900
                sm:text-lg
                dark:text-white
              "
            >
              {title}
            </h3>

            <p
              className="
                mt-1.5
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              {description}
            </p>
          </div>
        </div>

        {/* Helpful Information */}
        <div
          className="
            mt-6
            rounded-xl
            border
            border-slate-200
            bg-slate-50/70
            p-4
            sm:p-5
            dark:border-slate-800
            dark:bg-slate-800/40
          "
        >
          <div className="flex items-start gap-3">
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
              <AlertCircle className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Tafadhali hakikisha
              </p>

              <ul
                className="
                  mt-2
                  space-y-2
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                <li className="flex items-start gap-2">
                  <span
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-purple-500
                    "
                  />

                  <span>
                    Namba ya marejeleo imeandikwa
                    kwa usahihi.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-purple-500
                    "
                  />

                  <span>
                    Hakuna nafasi au alama za ziada
                    kwenye namba.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-purple-500
                    "
                  />

                  <span>
                    Taarifa yako iliwasilishwa
                    kikamilifu kwenye mfumo.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div
          className="
            mt-4
            text-center
            text-xs
            text-slate-400
            dark:text-slate-500
          "
        >
          Jaribu tena kwa kutumia namba sahihi ya
          marejeleo.
        </div>
      </CardContent>
    </Card>
  );
}
