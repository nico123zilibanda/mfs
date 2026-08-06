import { z } from "zod";

export const feedbackDeleteSchema = z.object({
  id: z.uuid("Invalid feedback ID."),
});

export type FeedbackDeleteInput = z.infer<
  typeof feedbackDeleteSchema
>;