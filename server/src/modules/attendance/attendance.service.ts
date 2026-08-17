import { AttendanceModel, type AttendanceAttrs } from "./attendance.model.js";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError.js";
import type { Types } from "mongoose";

const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]!;
};

export class AttendanceService {
  async checkIn(userId: string | Types.ObjectId, notes: string = "") {
    const dateStr = getTodayString();
    const existing = await AttendanceModel.findOne({ userId, date: dateStr });

    if (existing) {
      throw new BadRequestError("You have already checked in for today.");
    }

    // Auto set server current timestamp
    const now = new Date();
    const attendance = await AttendanceModel.create({
      userId,
      date: dateStr,
      checkIn: now,
      checkOut: null,
      status: "present",
      notes,
    });

    return attendance;
  }

  async checkOut(userId: string | Types.ObjectId) {
    const dateStr = getTodayString();
    const attendance = await AttendanceModel.findOne({ userId, date: dateStr });

    if (!attendance) {
      throw new NotFoundError("No check-in record found for today.");
    }

    if (attendance.checkOut) {
      throw new BadRequestError("You have already checked out for today.");
    }

    // Auto set server current timestamp
    attendance.checkOut = new Date();

    // Check if worked hours < 4 hours for half day estimation
    const diffHours = (attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
    if (diffHours < 4) {
      attendance.status = "half_day";
    }

    await attendance.save();
    return attendance;
  }

  async getTodayStatus(userId: string | Types.ObjectId) {
    const dateStr = getTodayString();
    const attendance = await AttendanceModel.findOne({ userId, date: dateStr });
    return attendance;
  }

  async getUserAttendance(userId: string | Types.ObjectId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      AttendanceModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
      AttendanceModel.countDocuments({ userId }),
    ]);

    return { records, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getAllAttendance(query: { userId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};
    if (query.userId) filter.userId = query.userId;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) (filter.date as Record<string, string>).$gte = query.startDate;
      if (query.endDate) (filter.date as Record<string, string>).$lte = query.endDate;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      AttendanceModel.find(filter)
        .populate("userId", "name email role designation department")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      AttendanceModel.countDocuments(filter),
    ]);

    return { records, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

export const attendanceService = new AttendanceService();
