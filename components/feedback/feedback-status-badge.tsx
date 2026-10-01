"use client";

import { motion } from "framer-motion";

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
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      whileHover={{
        y: -1,
        scale: 1.02,
      }}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="inline-flex"
    >
      <Badge
        className={`
          inline-flex
          items-center
          gap-1.5

          rounded-full

          border

          px-3
          py-1.5

          text-xs
          font-semibold

          tracking-wide

          shadow-sm

          transition-all
          duration-200

          ${config.className}
        `}
      >
        <motion.span
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.05,
            duration: 0.2,
          }}
          className="inline-flex"
        >
          <Icon
            className="
              h-3.5
              w-3.5
              shrink-0
            "
          />
        </motion.span>

        <span className="leading-none">
          {config.label}
        </span>
      </Badge>
    </motion.div>
  );
}