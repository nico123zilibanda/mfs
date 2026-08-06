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
    <Card className="border-dashed border-slate-300 bg-white shadow-none">
      <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon ?? (
            <Inbox className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-950">
            {title}
          </h3>

          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {action ? (
          <div className="mt-6">
            {action}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
