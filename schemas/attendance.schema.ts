import { z } from "zod";

export const locationPayloadSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).max(10_000).optional().nullable(),
});

export type LocationPayload = z.infer<typeof locationPayloadSchema>;
