import { z } from "zod";

export const trackingSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .min(1, "Reference number is required."),
});

export type TrackingInput = z.infer<
  typeof trackingSchema
>;