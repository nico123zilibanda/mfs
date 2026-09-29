import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        `
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-purple-200
          hover:shadow-md
          dark:border-slate-800
          dark:bg-slate-900
          dark:hover:border-purple-900/70
          dark:hover:shadow-black/20
        `,
        className
      )}
    >
      {/* Government Accent */}
      <div
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
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
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
              {title}
            </p>

            <p
              className="
                mt-2
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-4xl
                dark:text-white
              "
            >
              {value}
            </p>
          </div>

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
              text-[#6d28d9]
              ring-1
              ring-purple-100
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:bg-purple-100
              dark:bg-purple-950/40
              dark:text-purple-300
              dark:ring-purple-900/50
              dark:group-hover:bg-purple-950/70
            "
          >
            <Icon
              className={cn(
                "h-5 w-5",
                iconClassName
              )}
            />
          </div>
        </div>

        {/* Description */}
        {description && (
          <div
            className="
              mt-5
              border-t
              border-slate-100
              pt-4
              dark:border-slate-800
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-slate-500
                dark:text-slate-400
              "
            >
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
