import type { Request, Response } from "express";
import { attendanceService } from "./attendance.service.js";

export class AttendanceController {
  async checkIn(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const { notes } = req.body;
    const attendance = await attendanceService.checkIn(userId);
    res.status(201).json({
      success: true,
      message: "Successfully checked in automatically at current office arrival time",
      data: attendance,
    });
  }

  async checkOut(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const attendance = await attendanceService.checkOut(userId);
    res.status(200).json({
      success: true,
      message: "Successfully checked out",
      data: attendance,
    });
  }

  async getTodayStatus(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const attendance = await attendanceService.getTodayStatus(userId);
    res.status(200).json({
      success: true,
      data: attendance,
    });
  }

  async getMyAttendance(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await attendanceService.getUserAttendance(userId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async getAllAttendance(req: Request, res: Response) {
    const result = await attendanceService.getAllAttendance(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export const attendanceController = new AttendanceController();
