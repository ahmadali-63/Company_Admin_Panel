import { z } from "zod";

import { ATTENDANCE_STATUSES } from "../../common/constants/roles.js";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const checkInSchema = z.object({
  notes: z.string().trim().max(200).optional().default(""),
});

export const checkOutSchema = z.object({
  notes: z.string().trim().max(200).optional().default(""),
});

export const listAttendanceQuerySchema = paginationQuerySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  userId: objectIdSchema.optional(),
  hrId: objectIdSchema.optional(),
  status: z.enum(ATTENDANCE_STATUSES).optional(),
  department: z.string().trim().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
