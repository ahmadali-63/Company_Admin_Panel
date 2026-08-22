import api from "./api";
import type { ApiResponse, Task, TaskPriority, TaskStatus } from "../types";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId?: string | null;
  assignedTo: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  projectId?: string | null;
  assignedTo?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  comment?: string;
}

export interface TaskFilterParams {
  projectId?: string;
  assignedTo?: string;
  assignedBy?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const taskService = {
  async list(params: TaskFilterParams = {}) {
    const response = await api.get<ApiResponse<Task[]>>("/tasks", { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  async create(payload: CreateTaskPayload) {
    const response = await api.post<ApiResponse<Task>>("/tasks", payload);
    return response.data;
  },

  async update(id: string, payload: UpdateTaskPayload) {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, payload: UpdateTaskStatusPayload) {
    const response = await api.patch<ApiResponse<Task>>(
      `/tasks/${id}/status`,
      payload,
    );
    return response.data;
  },

  async addComment(id: string, text: string) {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/comments`, {
      text,
    });
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  },
};
