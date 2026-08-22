export const ROLES = [
  "admin",
  "hr",
  "team_lead",
  "team_member",
  "employee",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE = {
  ADMIN: "admin",
  HR: "hr",
  TEAM_LEAD: "team_lead",
  TEAM_MEMBER: "team_member",
  EMPLOYEE: "employee",
} as const satisfies Record<string, Role>;

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ROLES as readonly string[]).includes(value);

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
