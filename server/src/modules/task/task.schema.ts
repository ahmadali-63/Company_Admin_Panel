import { z } from "zod";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../../common/constants/roles.js";
import {
  objectIdSchema,
  optionalDate,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "is required").max(200),
  description: z.string().trim().max(2000).default(""),
  projectId: objectIdSchema,
  assignedTo: objectIdSchema,
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
  dueDate: optionalDate,
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000),
    assignedTo: objectIdSchema,
    priority: z.enum(TASK_PRIORITIES),
    status: z.enum(TASK_STATUSES),
    dueDate: optionalDate,
  })
  .partial();

export const addCommentSchema = z.object({
  text: z.string().trim().min(1, "is required").max(1000),
});

export const listTasksQuerySchema = paginationQuerySchema.extend({
  projectId: objectIdSchema.optional(),
  assignedTo: objectIdSchema.optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
