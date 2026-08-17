import { z } from "zod";

import { passwordSchema } from "../user/user.schema.js";

export const loginSchema = z.object({
  email: z.email("Email and password are required.").toLowerCase().trim(),
  password: z.string().min(1, "Email and password are required."),
});

/**
 * Public self-registration. `role` is intentionally absent: the server always
 * creates a `team_member`. Elevated roles are created through
 * `POST /api/users`, which is admin-only.
 */
export const signupSchema = z.object({
  name: z.string().trim().min(1, "is required").max(100),
  email: z.email().toLowerCase().trim(),
  password: passwordSchema,
  phone: z.string().trim().max(30).default(""),
  department: z.string().trim().max(100).default(""),
  designation: z.string().trim().max(100).default(""),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
