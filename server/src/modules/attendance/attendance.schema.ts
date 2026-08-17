import { z } from "zod";

export const createAttendanceSchema = z.object({
  notes: z.string().max(200).optional().default(""),
});

export const listAttendanceQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
