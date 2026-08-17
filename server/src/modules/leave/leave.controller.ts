import type { Request, Response } from "express";
import { leaveService } from "./leave.service.js";

export class LeaveController {
  async applyLeave(req: Request, res: Response) {
    const userId = req.user!._id;
    const leave = await leaveService.applyLeave(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  }

  async getMyLeaves(req: Request, res: Response) {
    const userId = req.user!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await leaveService.getMyLeaves(userId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async getAllLeaves(req: Request, res: Response) {
    const result = await leaveService.getAllLeaves(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async updateLeaveStatus(req: Request, res: Response) {
    const leaveId = req.params.id;
    const reviewerId = req.user!._id;
    const { status, reviewComment } = req.body;
    const leave = await leaveService.updateLeaveStatus(leaveId, reviewerId, status, reviewComment);
    res.status(200).json({
      success: true,
      message: `Leave status updated to ${status}`,
      data: leave,
    });
  }
}

export const leaveController = new LeaveController();
