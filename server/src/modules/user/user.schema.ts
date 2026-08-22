import { z } from "zod";

import { ROLES } from "../../common/constants/roles.js";
import {
  booleanQuerySchema,
  objectIdSchema,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const passwordSchema = z
  .string()
  .min(6, "must be at least 6 characters")
  .max(128);

export const createUserSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required").max(30).optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: passwordSchema,
  role: z.enum(ROLES),
  phone: z.string().trim().max(30).default(""),
  department: z.string().trim().max(100).default(""),
  designation: z.string().trim().max(100).default(""),
  hrId: objectIdSchema.nullish(),
  projectIds: z.array(objectIdSchema).default([]),
  joiningDate: z.coerce.date().optional(),
  profileImage: z.string().default(""),
});

export const updateUserSchema = z
  .object({
    employeeId: z.string().trim().max(30),
    name: z.string().trim().min(1).max(100),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: passwordSchema,
    role: z.enum(ROLES),
    phone: z.string().trim().max(30),
    department: z.string().trim().max(100),
    designation: z.string().trim().max(100),
    hrId: objectIdSchema.nullable(),
    projectIds: z.array(objectIdSchema),
    joiningDate: z.coerce.date(),
    profileImage: z.string(),
    isActive: z.boolean(),
  })
  .partial();

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(ROLES).optional(),
  isActive: booleanQuerySchema.optional(),
  department: z.string().trim().optional(),
  hrId: objectIdSchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
