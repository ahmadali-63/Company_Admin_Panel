import api from "./api";
import type { ApiResponse, User } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<User>>("/auth/login", payload);
    return response.data;
  },

  async getMe() {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await api.post<ApiResponse<void>>(
      "/auth/change-password",
      payload,
    );
    return response.data;
  },
};
