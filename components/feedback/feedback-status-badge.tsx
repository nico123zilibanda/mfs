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
    <Badge
      className={`
        inline-flex
        items-center
        gap-1.5

        rounded-full

        px-3
        py-1.5

        text-xs
        font-semibold

        tracking-wide

        shadow-sm

        transition-all

        ${config.className}
      `}
    >

      <Icon
        className="
          h-3.5
          w-3.5
          shrink-0
        "
      />

      <span>
        {config.label}
      </span>

    </Badge>
  );
}