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
        "border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{value}</h2>
          </div>

          <div className="rounded-xl bg-emerald-50 p-3">
            <Icon
              className={cn("h-6 w-6 text-[#006b3c]", iconClassName)}
            />
          </div>
        </div>

        {description ? (
          <p className="mt-4 text-sm text-slate-500">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
