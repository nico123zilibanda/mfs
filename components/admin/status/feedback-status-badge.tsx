"use client";

import { FEEDBACK_STATUS } from "@/lib/constants/feedback-status";
import type { FeedbackStatus } from "@/lib/types/feedback";

import { Badge } from "@/components/ui/badge";

type Props = {
  status: FeedbackStatus;
};

export default function FeedbackStatusBadge({
  status,
}: Props) {
  const config = FEEDBACK_STATUS[status];

  const Icon = config.icon;

  return (
    <Badge className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
