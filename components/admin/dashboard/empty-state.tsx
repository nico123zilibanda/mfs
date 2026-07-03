import { Inbox } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export default function EmptyState({
  title = "No feedback found",
  description = "Citizen feedback will appear here once reports are submitted.",
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}