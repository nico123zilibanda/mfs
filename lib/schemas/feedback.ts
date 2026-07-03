import { z } from "zod";

export const feedbackSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name is required")
    .max(100),

  village: z
    .string()
    .trim()
    .min(2)
    .max(100),

  ward: z
    .string()
    .trim()
    .min(2)
    .max(100),

  phone: z
    .string()
    .trim()
    .regex(
      /^(\+255|0)[67][0-9]{8}$/,
      "Invalid Tanzanian phone number"
    ),

  corruptionDescription: z
    .string()
    .trim()
    .min(10)
    .max(1000),

  hasBribeRequest: z.boolean(),
});

export type FeedbackInput =
  z.infer<typeof feedbackSchema>;