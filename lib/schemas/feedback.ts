import { z } from "zod";

export const feedbackSchema = z.object({
  fullName: z
  .string()
  .trim()
  .max(100)
  .refine(
    (value) => value === "" || value.length >= 3,
    "Full name must be at least 3 characters"
  ),

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