import api from "./api";
import type { ApiResponse, Attendance, Leave, Task, User } from "../types";

export interface AdminDashboardData {
  stats: {
    totalEmployees: number;
    totalHRs: number;
    totalStaff: number;
    presentToday: number;
    absentToday: number;
    currentlyInOffice: number;
    onLeave: number;
    pendingLeaves: number;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalProjects: number;
    activeProjects: number;
    planningProjects: number;
    completedProjects: number;
    onHoldProjects: number;
  };
  charts: {
    attendanceBreakdown: { name: string; value: number; color?: string }[];
    departmentDistribution: { name: string; count: number }[];
    taskStatusDistribution: { name: string; value: number }[];
    projectStatusDistribution: { name: string; value: number }[];
  };
  todayAttendance: Attendance[];
  upcomingDeadlines: Task[];
  overdueTasks: Task[];
  recentUsers: User[];
}

export interface HRDashboardData {
  stats: {
    myEmployeesCount: number;
    presentToday: number;
    absentToday: number;
    onLeave: number;
    pendingLeaveRequests: number;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    assignedProjectsCount: number;
  };
  charts: {
    attendanceBreakdown: { name: string; value: number }[];
    taskStatusDistribution: { name: string; value: number }[];
  };
  todayAttendance: Attendance[];
  pendingLeaveRequests: Leave[];
  upcomingDeadlines: Task[];
  overdueTasks: Task[];
  myEmployees: User[];
}

export interface EmployeeDashboardData {
  stats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    assignedProjectsCount: number;
    pendingLeaves: number;
    approvedLeaves: number;
  };
  todayAttendance: {
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    checkInTime?: string;
    checkOutTime?: string | null;
    workingHours?: string;
    status: string;
  };
  recentTasks: Task[];
  upcomingDeadlines: Task[];
  recentLeaves: Leave[];
}

export const statsService = {
  async getDashboard() {
    const response = await api.get<ApiResponse<any>>("/stats/dashboard");
    return response.data;
  },
};
