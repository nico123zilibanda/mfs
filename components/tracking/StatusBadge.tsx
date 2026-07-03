import { Badge } from "@/components/ui/badge";

import { FEEDBACK_STATUS } from "@/lib/constants/feedback-status";

import type { FeedbackStatus } from "@/lib/types/feedback";

type StatusBadgeProps = {
  status: FeedbackStatus;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = FEEDBACK_STATUS[status];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </Badge>
  );
}