import type { Response } from "express";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import { validatedQuery } from "../../common/middleware/validate.js";
import type { AuthedRequest } from "../../common/types/http.js";
import type { IdParam } from "../../common/schemas/common.schema.js";
import { userService } from "./user.service.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UpdateUserStatusInput,
} from "./user.schema.js";

export const userController = {
  async create(
    req: AuthedRequest<Record<string, string>, unknown, CreateUserInput>,
    res: Response,
  ) {
    const user = await userService.create(req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      user,
      data: user,
    });
  },

  async list(req: AuthedRequest, res: Response) {
    const query = validatedQuery<ListUsersQuery>(res);
    const { users, pagination } = await userService.list(req.user, query);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
      data: users,
      pagination,
    });
  },

  async getById(req: AuthedRequest<IdParam>, res: Response) {
    const user = await userService.getById(req.user, req.params.id);

    res.status(200).json({ success: true, user, data: user });
  },

  async update(
    req: AuthedRequest<IdParam, unknown, UpdateUserInput>,
    res: Response,
  ) {
    const user = await userService.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      user,
      data: user,
    });
  },

  async updateStatus(
    req: AuthedRequest<IdParam, unknown, UpdateUserStatusInput>,
    res: Response,
  ) {
    const user = await userService.setStatus(
      req.user,
      req.params.id,
      req.body.isActive,
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_STATUS_UPDATED,
      user,
      data: user,
    });
  },

  async remove(req: AuthedRequest<IdParam>, res: Response) {
    await userService.remove(req.user, req.params.id);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_DELETED,
    });
  },
};
