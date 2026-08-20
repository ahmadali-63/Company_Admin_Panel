import { z } from "zod";
import { LEAVE_TYPES, LEAVE_STATUSES } from "./leave.model.js";

export const applyLeaveSchema = z.object({
  leaveType: z.enum(LEAVE_TYPES),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(LEAVE_STATUSES),
  reviewComment: z.string().optional().default(""),
});

export const listLeavesQuerySchema = z.object({
  userId: z.string().optional(),
  status: z.enum(LEAVE_STATUSES).optional(),
  leaveType: z.enum(LEAVE_TYPES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
