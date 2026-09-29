import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Action = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

const actions: Action[] = [
  {
    title: "Angalia Taarifa",
    description:
      "Kagua na simamia taarifa zote za malalamiko yaliyowasilishwa kwenye mfumo.",
    href: "/all-reports",
    icon: FileText,
  },
  {
    title: "Fuatilia Taarifa",
    description:
      "Tafuta na ufuatilie maendeleo ya taarifa kwa kutumia namba ya marejeleo.",
    href: "/trackings",
    icon: Search,
  },
];

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title" className="space-y-5">
      {/* Section heading */}
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
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
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <h2
            id="quick-actions-title"
            className="
              text-lg
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            Vitendo vya Haraka
          </h2>

          <p
            className="
              mt-0.5
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Fikia moduli muhimu za usimamizi kwa haraka.
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="
                group
                block
                rounded-2xl
                outline-none
                focus-visible:ring-2
                focus-visible:ring-purple-500/40
                focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-slate-950
              "
            >
              <Card
                className="
                  relative
                  h-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:border-purple-200
                  group-hover:shadow-lg
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:group-hover:border-purple-900
                "
              >
                {/* Top accent */}
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-0.5
                    bg-linear-to-r
                    from-purple-500
                    via-[#6d28d9]
                    to-indigo-500
                    opacity-70
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
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
                        border
                        border-purple-100
                        bg-purple-50
                        text-purple-600
                        shadow-sm
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:border-purple-200
                        group-hover:bg-purple-100
                        dark:border-purple-900/50
                        dark:bg-purple-950/40
                        dark:text-purple-400
                        dark:group-hover:bg-purple-950/60
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Arrow */}
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        text-slate-400
                        transition-all
                        duration-300
                        group-hover:border-purple-200
                        group-hover:bg-purple-50
                        group-hover:text-purple-600
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-500
                        dark:group-hover:border-purple-900
                        dark:group-hover:bg-purple-950/50
                        dark:group-hover:text-purple-400
                      "
                    >
                      <ArrowUpRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          duration-300
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-5">
                    <h3
                      className="
                        text-base
                        font-bold
                        tracking-tight
                        text-slate-900
                        transition-colors
                        duration-200
                        group-hover:text-purple-700
                        dark:text-white
                        dark:group-hover:text-purple-300
                      "
                    >
                      {action.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-lg
                        text-sm
                        leading-6
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {action.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      border-t
                      border-slate-100
                      pt-4
                      dark:border-slate-800
                    "
                  >
                    <span
                      className={cn(
                        `
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-purple-600
                          transition-colors
                          duration-200
                          dark:text-purple-400
                        `
                      )}
                    >
                      Fungua Moduli
                    </span>

                    <span
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                        transition-colors
                        duration-200
                        group-hover:text-purple-500
                        dark:text-slate-500
                        dark:group-hover:text-purple-400
                      "
                    >
                      Endelea
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
