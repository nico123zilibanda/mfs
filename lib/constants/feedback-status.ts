import {
  Clock3,
  SearchCheck,
  CheckCircle2,
} from "lucide-react";

import type { FeedbackStatus } from "@/lib/types/feedback";

export const FEEDBACK_STATUS = {
  received: {
    label: "Imepokelewa",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  in_review: {
    label: "Inachunguzwa",
    icon: SearchCheck,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  resolved: {
    label: "Imetatuliwa",
    icon: CheckCircle2,
    className:
      "border-green-200 bg-green-50 text-green-700",
  },
} satisfies Record<
  FeedbackStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
>;