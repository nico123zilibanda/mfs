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
        rounded-3xl
        border
        border-border
        bg-card
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald-500/40
        hover:shadow-xl
        `,
        className
      )}
    >
      {/* Government Green Accent */}
      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-1
          origin-top
          scale-y-0
          bg-emerald-700
          transition-transform
          duration-300
          group-hover:scale-y-100
        "
      />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-card-foreground">
              {value}
            </h2>
          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-linear-to-br
              from-emerald-600
              via-emerald-700
              to-green-800
              shadow-lg
              transition-transform
              duration-300
              group-hover:scale-110
            "
          >
            <Icon
              className={cn(
                "h-7 w-7 text-white",
                iconClassName
              )}
            />
          </div>
        </div>

        {description && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}