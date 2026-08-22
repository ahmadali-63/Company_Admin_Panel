import type { Response } from "express";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import { validatedQuery } from "../../common/middleware/validate.js";
import type { IdParam } from "../../common/schemas/common.schema.js";
import type { AuthedRequest } from "../../common/types/http.js";
import { taskService } from "./task.service.js";
import type {
  AddTaskCommentInput,
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "./task.schema.js";

export const taskController = {
  async create(
    req: AuthedRequest<Record<string, string>, unknown, CreateTaskInput>,
    res: Response,
  ) {
    const task = await taskService.create(req.user, req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.TASK_CREATED,
      task,
      data: task,
    });
  },

  async list(req: AuthedRequest, res: Response) {
    const query = validatedQuery<ListTasksQuery>(res);
    const { tasks, pagination } = await taskService.list(req.user, query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      data: tasks,
      pagination,
    });
  },

  async getById(req: AuthedRequest<IdParam>, res: Response) {
    const task = await taskService.getById(req.user, req.params.id);

    res.status(200).json({ success: true, task, data: task });
  },

  async update(
    req: AuthedRequest<IdParam, unknown, UpdateTaskInput>,
    res: Response,
  ) {
    const task = await taskService.update(req.user, req.params.id, req.body);


    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.TASK_UPDATED,
      task,
      data: task,
    });
  },

  async updateStatus(
    req: AuthedRequest<IdParam, unknown, UpdateTaskStatusInput>,
    res: Response,
  ) {
    const task = await taskService.updateStatus(req.user, req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task,
      data: task,
    });
  },

  async addComment(
    req: AuthedRequest<IdParam, unknown, AddTaskCommentInput>,
    res: Response,
  ) {
    const task = await taskService.addComment(req.user, req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      task,
      data: task,
    });
  },

  async remove(req: AuthedRequest<IdParam>, res: Response) {
    await taskService.remove(req.user, req.params.id);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.TASK_DELETED,
    });
  },
};
