import { z } from "zod";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../../common/constants/roles.js";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(2000).default(""),
  projectId: objectIdSchema.nullish(),
  assignedTo: objectIdSchema,
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
  deadline: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000),
    projectId: objectIdSchema.nullable(),
    assignedTo: objectIdSchema,
    priority: z.enum(TASK_PRIORITIES),
    status: z.enum(TASK_STATUSES),
    deadline: z.coerce.date(),
    dueDate: z.coerce.date(),
  })
  .partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
  comment: z.string().trim().max(1000).optional(),
});

export const addTaskCommentSchema = z.object({
  text: z.string().trim().min(1, "Comment cannot be empty").max(1000),
});

export const listTasksQuerySchema = paginationQuerySchema.extend({
  projectId: objectIdSchema.optional(),
  assignedTo: objectIdSchema.optional(),
  assignedBy: objectIdSchema.optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  search: z.string().trim().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type AddTaskCommentInput = z.infer<typeof addTaskCommentSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
