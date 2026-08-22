import type { Response } from "express";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import { validatedQuery } from "../../common/middleware/validate.js";
import type { IdParam } from "../../common/schemas/common.schema.js";
import type { AuthedRequest } from "../../common/types/http.js";
import { projectService } from "./project.service.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "./project.schema.js";

export const projectController = {
  async create(
    req: AuthedRequest<Record<string, string>, unknown, CreateProjectInput>,
    res: Response,
  ) {
    const project = await projectService.create(req.user, req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_CREATED,
      project,
      data: project,
    });
  },

  async list(req: AuthedRequest, res: Response) {
    const query = validatedQuery<ListProjectsQuery>(res);
    const { projects, pagination } = await projectService.list(req.user, query);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
      data: projects,
      pagination,
    });
  },

  async getById(req: AuthedRequest<IdParam>, res: Response) {
    const project = await projectService.getById(req.user, req.params.id);

    res.status(200).json({ success: true, project, data: project });
  },

  async update(
    req: AuthedRequest<IdParam, unknown, UpdateProjectInput>,
    res: Response,
  ) {
    const project = await projectService.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_UPDATED,
      project,
      data: project,
    });
  },

  async remove(req: AuthedRequest<IdParam>, res: Response) {
    await projectService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_DELETED,
    });
  },
};
