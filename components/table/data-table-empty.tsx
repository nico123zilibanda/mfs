import type { ReactNode } from "react";

import { Inbox } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type DataTableEmptyProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export default function DataTableEmpty({
  title = "Hakuna taarifa zilizopatikana",
  description = "Hakuna data ya kuonyesha kwa sasa.",
  icon,
  action,
}: DataTableEmptyProps) {
  return (
    <Card
      className="
        overflow-hidden
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-white
        shadow-none
        transition-colors
        dark:border-slate-700
        dark:bg-slate-950
      "
    >
      <CardContent
        className="
          flex
          min-h-64
          flex-col
          items-center
          justify-center
          px-4
          py-10
          text-center
          sm:min-h-72
          sm:px-6
          sm:py-12
        "
      >
        {/* Icon */}
        <div
          className="
            relative
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            text-slate-400
            shadow-sm
            sm:h-16
            sm:w-16
            dark:border-slate-800
            dark:bg-slate-900
            dark:text-slate-500
          "
        >
          {/* Soft glow */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              rounded-2xl
              bg-linear-to-br
              from-purple-500/5
              via-transparent
              to-indigo-500/5
            "
          />

          <div className="relative">
            {icon ?? <Inbox className="h-7 w-7 sm:h-8 sm:w-8" />}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-md space-y-1.5">
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
              mx-auto
              max-w-sm
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
              sm:leading-6
              dark:text-slate-400
            "
          >
            {description}
          </p>
        </div>

        {/* Action */}
        {action ? (
          <div
            className="
              mt-5
              flex
              w-full
              justify-center
              sm:mt-6
            "
          >
            {action}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
