import api from "./api";
import type { ApiResponse, Role, User } from "../types";

export interface CreateUserPayload {
  employeeId?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  department?: string;
  designation?: string;
  hrId?: string | null;
  projectIds?: string[];
  joiningDate?: string;
  profileImage?: string;
}

export interface UpdateUserPayload {
  employeeId?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  phone?: string;
  department?: string;
  designation?: string;
  hrId?: string | null;
  projectIds?: string[];
  joiningDate?: string;
  profileImage?: string;
  isActive?: boolean;
}

export interface UserFilterParams {
  role?: Role;
  isActive?: boolean;
  department?: string;
  hrId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async list(params: UserFilterParams = {}) {
    const response = await api.get<ApiResponse<User[]>>("/users", { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async create(payload: CreateUserPayload) {
    const response = await api.post<ApiResponse<User>>("/users", payload);
    return response.data;
  },

  async update(id: string, payload: UpdateUserPayload) {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, isActive: boolean) {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },
};
