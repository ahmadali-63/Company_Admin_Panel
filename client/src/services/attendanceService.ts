import api from "./api";
import type { ApiResponse, Attendance } from "../types";

export interface CheckInPayload {
  notes?: string;
}

export interface CheckOutPayload {
  notes?: string;
}

export interface AttendanceFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  hrId?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface MyTodayStatusResponse {
  isAdmin: boolean;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  todayRecord: Attendance | null;
  recentHistory: Attendance[];
  message?: string;
}

export const attendanceService = {
  async checkIn(payload: CheckInPayload = {}) {
    const response = await api.post<ApiResponse<Attendance>>(
      "/attendance/check-in",
      payload,
    );
    return response.data;
  },

  async checkOut(payload: CheckOutPayload = {}) {
    const response = await api.post<ApiResponse<Attendance>>(
      "/attendance/check-out",
      payload,
    );
    return response.data;
  },

  async getMyTodayStatus() {
    const response = await api.get<ApiResponse<MyTodayStatusResponse>>(
      "/attendance/me",
    );
    return response.data;
  },

  async list(params: AttendanceFilterParams = {}) {
    const response = await api.get<ApiResponse<Attendance[]>>("/attendance", {
      params,
    });
    return response.data;
  },

  async getByUserId(userId: string, params: AttendanceFilterParams = {}) {
    const response = await api.get<ApiResponse<Attendance[]>>(
      `/attendance/${userId}`,
      { params },
    );
    return response.data;
  },
};
