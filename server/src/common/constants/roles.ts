export const ROLES = ["admin", "hr", "employee"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE = {
  ADMIN: "admin",
  HR: "hr",
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
  "overdue",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const LEAVE_TYPES = [
  "annual",
  "sick",
  "casual",
  "emergency",
  "unpaid",
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ["pending", "approved", "rejected"] as const;

export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export const ATTENDANCE_STATUSES = [
  "Present",
  "Absent",
  "Late",
  "Half Day",
  "On Leave",
  "Checked Out",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "task",
  "leave",
  "attendance",
  "project",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
