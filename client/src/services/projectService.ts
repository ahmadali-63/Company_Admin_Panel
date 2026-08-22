import api from "./api";
import type { ApiResponse, Project, ProjectStatus } from "../types";

export interface CreateProjectPayload {
  name: string;
  code: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  hrIds?: string[];
  employeeIds?: string[];
}

export interface UpdateProjectPayload {
  name?: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  hrIds?: string[];
  employeeIds?: string[];
  isActive?: boolean;
}

export interface ProjectFilterParams {
  status?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const projectService = {
  async list(params: ProjectFilterParams = {}) {
    const response = await api.get<ApiResponse<Project[]>>("/projects", {
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  async create(payload: CreateProjectPayload) {
    const response = await api.post<ApiResponse<Project>>("/projects", payload);
    return response.data;
  },

  async update(id: string, payload: UpdateProjectPayload) {
    const response = await api.put<ApiResponse<Project>>(
      `/projects/${id}`,
      payload,
    );
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },
};
