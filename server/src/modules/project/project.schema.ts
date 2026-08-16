import { z } from "zod";

import { PROJECT_STATUSES } from "../../common/constants/roles.js";
import {
  objectIdSchema,
  optionalDate,
  paginationQuerySchema,
} from "../../common/schemas/common.schema.js";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "is required").max(150),
  code: z.string().trim().min(1, "is required").max(50).toUpperCase(),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(PROJECT_STATUSES).default("planning"),
  startDate: optionalDate,
  endDate: optionalDate,
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    code: z.string().trim().min(1).max(50).toUpperCase(),
    description: z.string().trim().max(2000),
    status: z.enum(PROJECT_STATUSES),
    startDate: optionalDate,
    endDate: optionalDate,
    isActive: z.boolean(),
  })
  .partial();

export const listProjectsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const assignHrSchema = z.object({ hrId: objectIdSchema });
export const assignTeamLeadSchema = z.object({ teamLeadId: objectIdSchema });
export const assignMemberSchema = z.object({ memberId: objectIdSchema });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type AssignHrInput = z.infer<typeof assignHrSchema>;
export type AssignTeamLeadInput = z.infer<typeof assignTeamLeadSchema>;
export type AssignMemberInput = z.infer<typeof assignMemberSchema>;
