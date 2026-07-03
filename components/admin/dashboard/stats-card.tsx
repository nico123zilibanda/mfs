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
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              {value}
            </h2>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <Icon
              className={cn(
                "h-6 w-6 text-muted-foreground",
                iconClassName
              )}
            />
          </div>
        </div>

        {description ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}