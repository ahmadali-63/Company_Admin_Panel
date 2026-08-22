import type { Request, Response } from "express";

import { attendanceService } from "./attendance.service.js";
import type {
  CheckInInput,
  CheckOutInput,
  ListAttendanceQuery,
} from "./attendance.schema.js";

export const attendanceController = {
  async checkIn(req: Request, res: Response): Promise<void> {
    const record = await attendanceService.checkIn(
      req.user!,
      req.body as CheckInInput,
    );
    res.status(201).json({
      success: true,
      message: "Checked in successfully",
      data: record,
    });
  },

  async checkOut(req: Request, res: Response): Promise<void> {
    const record = await attendanceService.checkOut(
      req.user!,
      req.body as CheckOutInput,
    );
    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: record,
    });
  },

  async getMyTodayStatus(req: Request, res: Response): Promise<void> {
    const status = await attendanceService.getMyTodayStatus(req.user!);
    res.status(200).json({
      success: true,
      data: status,
    });
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await attendanceService.list(
      req.user!,
      req.query as unknown as ListAttendanceQuery,
    );
    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  },

  async getByUserId(req: Request, res: Response): Promise<void> {
    const result = await attendanceService.getByUserId(
      req.user!,
      String(req.params.userId),
      req.query as unknown as ListAttendanceQuery,
    );
    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  },
};
