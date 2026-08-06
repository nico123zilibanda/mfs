import { z } from "zod";

import { FEEDBACK_STATUS } from "@/lib/types/feedback";

export const feedbackStatusSchema = z.object({
  id: z.uuid("Invalid feedback ID."),

  status: z.enum(FEEDBACK_STATUS, {
    error: "Please select a valid status.",
  }),
});

export type FeedbackStatusInput = z.infer<
  typeof feedbackStatusSchema
>;