import api from "./api";
import type { ApiResponse, Leave, LeaveStatus, LeaveType } from "../types";

export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface RespondLeavePayload {
  responseComment?: string;
}

export interface LeaveFilterParams {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  userId?: string;
  hrId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const leaveService = {
  async apply(payload: ApplyLeavePayload) {
    const response = await api.post<ApiResponse<Leave>>("/leaves", payload);
    return response.data;
  },

  async list(params: LeaveFilterParams = {}) {
    const response = await api.get<ApiResponse<Leave[]>>("/leaves", { params });
    return response.data;
  },

  async getMyLeaves(params: LeaveFilterParams = {}) {
    const response = await api.get<ApiResponse<Leave[]>>("/leaves/my", {
      params,
    });
    return response.data;
  },

  async approve(id: string, payload: RespondLeavePayload = {}) {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/approve`,
      payload,
    );
    return response.data;
  },

  async reject(id: string, payload: RespondLeavePayload = {}) {
    const response = await api.patch<ApiResponse<Leave>>(
      `/leaves/${id}/reject`,
      payload,
    );
    return response.data;
  },
};
