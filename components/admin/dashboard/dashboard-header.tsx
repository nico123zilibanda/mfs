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
    <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex items-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}