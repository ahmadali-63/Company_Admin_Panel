import { z } from "zod";

import { PROJECT_STATUSES } from "../../common/constants/roles.js";
import {
  booleanQuerySchema,
  objectIdSchema,
  optionalDate,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(50)
    .toUpperCase(),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(PROJECT_STATUSES).default("planning"),
  startDate: optionalDate,
  endDate: optionalDate,
  hrIds: z.array(objectIdSchema).default([]),
  employeeIds: z.array(objectIdSchema).default([]),
  memberIds: z.array(objectIdSchema).default([]),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    code: z.string().trim().min(1).max(50).toUpperCase(),
    description: z.string().trim().max(2000),
    status: z.enum(PROJECT_STATUSES),
    startDate: optionalDate,
    endDate: optionalDate,
    hrIds: z.array(objectIdSchema),
    employeeIds: z.array(objectIdSchema),
    memberIds: z.array(objectIdSchema),
    isActive: z.boolean(),
  })
  .partial();

export const assignProjectUsersSchema = z.object({
  hrIds: z.array(objectIdSchema).optional(),
  employeeIds: z.array(objectIdSchema).optional(),
  memberIds: z.array(objectIdSchema).optional(),
});

export const listProjectsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  isActive: booleanQuerySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignProjectUsersInput = z.infer<typeof assignProjectUsersSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
