export type Role = "admin" | "hr" | "employee";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type LeaveType = "annual" | "sick" | "casual" | "emergency" | "unpaid";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Half Day"
  | "On Leave"
  | "Checked Out";

export type NotificationType =
  | "task"
  | "leave"
  | "attendance"
  | "project"
  | "system";

export interface User {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  department?: string;
  designation?: string;
  hrId?: string | User | null;
  projectIds?: string[] | Project[];
  isActive: boolean;
  joiningDate?: string;
  profileImage?: string;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  userId: string | User;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workingHours: string;
  workingMinutes: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  _id?: string;
  text: string;
  author: string | User;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  projectId?: string | Project | null;
  assignedTo: string | User;
  assignedBy: string | User;
  createdBy?: string | User;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  dueDate?: string;
  comments: TaskComment[];
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdBy: string | User;
  hrIds: (string | User)[];
  employeeIds: (string | User)[];
  memberIds?: (string | User)[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  _id: string;
  userId: string | User;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string | User | null;
  approvedAt?: string | null;
  responseComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  token?: string;
  refreshToken?: string;
  user?: User;
  count?: number;
  unreadCount?: number;
}
