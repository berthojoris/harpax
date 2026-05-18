import { z } from "zod";

export const reportFilterSchema = z.enum(["all", "on_time", "late", "overtime", "special"]).catch("all");

export const reportQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  filter: reportFilterSchema.optional(),
  page: z.coerce.number().int().min(1).max(100).catch(1),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
