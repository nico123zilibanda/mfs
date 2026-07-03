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
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}