import { z } from "zod";

import { ROLES } from "../../common/constants/roles.js";
import {
  booleanQuerySchema,
  objectIdSchema,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const passwordSchema = z
  .string()
  .min(8, "must be at least 8 characters")
  .max(128);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "is required").max(100),
  email: z.email().toLowerCase().trim(),
  password: passwordSchema,
  role: z.enum(ROLES),
  phone: z.string().trim().max(30).default(""),
  department: z.string().trim().max(100).default(""),
  designation: z.string().trim().max(100).default(""),
  hrId: objectIdSchema.nullish(),
  teamLeadId: objectIdSchema.nullish(),
  projectIds: z.array(objectIdSchema).default([]),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.email().toLowerCase().trim(),
    password: passwordSchema,
    role: z.enum(ROLES),
    phone: z.string().trim().max(30),
    department: z.string().trim().max(100),
    designation: z.string().trim().max(100),
    hrId: objectIdSchema.nullable(),
    teamLeadId: objectIdSchema.nullable(),
    projectIds: z.array(objectIdSchema),
  })
  .partial();

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(ROLES).optional(),
  isActive: booleanQuerySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
