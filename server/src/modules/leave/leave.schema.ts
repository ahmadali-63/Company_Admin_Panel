import { z } from "zod";

import { LEAVE_STATUSES, LEAVE_TYPES } from "../../common/constants/roles.js";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const createLeaveSchema = z.object({
  leaveType: z.enum(LEAVE_TYPES),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(1000),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export const respondLeaveSchema = z.object({
  responseComment: z.string().trim().max(500).optional().default(""),
});

export const listLeavesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(LEAVE_STATUSES).optional(),
  leaveType: z.enum(LEAVE_TYPES).optional(),
  userId: objectIdSchema.optional(),
  hrId: objectIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type RespondLeaveInput = z.infer<typeof respondLeaveSchema>;
export type ListLeavesQuery = z.infer<typeof listLeavesQuerySchema>;
