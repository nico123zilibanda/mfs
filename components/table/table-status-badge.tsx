import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

type TableStatusBadgeProps = {
  label: string;
  className?: string;
};

export default function TableStatusBadge({
  label,
  className,
}: TableStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export const feedbackStatusStyles = {
  received: {
    label: "Received",

    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },

  in_review: {
    label: "In Review",

    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },

  resolved: {
    label: "Resolved",

    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
  },
} as const;