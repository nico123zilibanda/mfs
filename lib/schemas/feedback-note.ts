import { z } from "zod";

export const feedbackNoteSchema = z.object({
  id: z.uuid("Invalid feedback ID."),

  adminNote: z
    .string()
    .trim()
    .max(1000, "Admin note cannot exceed 1000 characters.")
    .nullable(),
});

export type FeedbackNoteInput = z.infer<
  typeof feedbackNoteSchema
>;