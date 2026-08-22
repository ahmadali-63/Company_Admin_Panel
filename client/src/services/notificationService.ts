import api from "./api";
import type { ApiResponse, Notification } from "../types";

export interface NotificationFilterParams {
  unreadOnly?: "true" | "false";
  page?: number;
  limit?: number;
}

export const notificationService = {
  async list(params: NotificationFilterParams = {}) {
    const response = await api.get<ApiResponse<Notification[]>>(
      "/notifications",
      { params },
    );
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch<ApiResponse<void>>(
      "/notifications/read-all",
    );
    return response.data;
  },
};
