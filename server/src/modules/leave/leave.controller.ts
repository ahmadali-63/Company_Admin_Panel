import type { Request, Response } from "express";

import { leaveService } from "./leave.service.js";
import type {
  CreateLeaveInput,
  ListLeavesQuery,
  RespondLeaveInput,
} from "./leave.schema.js";

export const leaveController = {
  async apply(req: Request, res: Response): Promise<void> {
    const leave = await leaveService.apply(
      req.user!,
      req.body as CreateLeaveInput,
    );
    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await leaveService.list(
      req.user!,
      req.query as unknown as ListLeavesQuery,
    );
    res.status(200).json({
      success: true,
      data: result.leaves,
      pagination: result.pagination,
    });
  },

  async getMyLeaves(req: Request, res: Response): Promise<void> {
    const result = await leaveService.getMyLeaves(
      req.user!,
      req.query as unknown as ListLeavesQuery,
    );
    res.status(200).json({
      success: true,
      data: result.leaves,
      pagination: result.pagination,
    });
  },

  async approve(req: Request, res: Response): Promise<void> {
    const leave = await leaveService.approve(
      req.user!,
      String(req.params.id),
      req.body as RespondLeaveInput,
    );
    res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: leave,
    });
  },

  async reject(req: Request, res: Response): Promise<void> {
    const leave = await leaveService.reject(
      req.user!,
      String(req.params.id),
      req.body as RespondLeaveInput,
    );
    res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      data: leave,
    });
  },
};
