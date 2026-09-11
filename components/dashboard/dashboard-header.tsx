import type { ReactNode } from "react";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        {/* Government Section Label */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-purple-700" />

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-700 dark:text-purple-500">
            Mfumo wa Usimamizi wa Taarifa
          </p>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        {/* Page Description */}
        {description && (
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}