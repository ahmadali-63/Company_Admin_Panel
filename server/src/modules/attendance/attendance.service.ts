import type { Types } from "mongoose";

import { ROLE } from "../../common/constants/roles.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import { sameId } from "../../common/utils/objectId.js";
import {
  buildPaginationMeta,
  resolvePagination,
} from "../../common/utils/pagination.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import { UserModel } from "../user/user.model.js";
import {
  AttendanceModel,
  type AttendanceAttrs,
} from "./attendance.model.js";
import { attendanceRepository } from "./attendance.repository.js";
import type {
  CheckInInput,
  CheckOutInput,
  ListAttendanceQuery,
} from "./attendance.schema.js";

export const getTodayDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatWorkingHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export const attendanceService = {
  async checkIn(actor: AuthenticatedUser, input: CheckInInput) {
    if (actor.role === ROLE.ADMIN) {
      throw new ForbiddenError("Admin does not require attendance.");
    }

    const today = getTodayDateString();
    const existing = await attendanceRepository.findByUserAndDate(actor._id, today);

    if (existing) {
      throw new BadRequestError("You have already checked in today.");
    }

    const now = new Date();
    // Office start time 9:00 AM, 15 min grace period -> late after 9:15 AM
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 15);

    const record = await attendanceRepository.create({
      userId: actor._id as unknown as Types.ObjectId,
      date: today,
      checkIn: now,
      checkOut: null,
      workingHours: "",
      workingMinutes: 0,
      status: isLate ? "Late" : "Present",
      notes: input.notes || "",
    });

    return attendanceRepository.findById(record._id);
  },

  async checkOut(actor: AuthenticatedUser, input: CheckOutInput) {
    if (actor.role === ROLE.ADMIN) {
      throw new ForbiddenError("Admin does not require attendance.");
    }

    const today = getTodayDateString();
    const record = await attendanceRepository.findByUserAndDate(actor._id, today);

    if (!record) {
      throw new BadRequestError("No check-in record found for today. Please check in first.");
    }

    if (record.checkOut) {
      throw new BadRequestError("You have already checked out today.");
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const diffMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
    const formattedHours = formatWorkingHours(diffMinutes);

    // If working less than 4 hours, mark as Half Day unless already late
    let finalStatus = record.status;
    if (diffMinutes < 240 && record.status !== "Late") {
      finalStatus = "Half Day";
    }

    record.checkOut = now;
    record.workingHours = formattedHours;
    record.workingMinutes = diffMinutes;
    record.status = finalStatus;
    if (input.notes) {
      record.notes = record.notes ? `${record.notes} | ${input.notes}` : input.notes;
    }

    await record.save();

    return attendanceRepository.findById(record._id);
  },

  async getMyTodayStatus(actor: AuthenticatedUser) {
    if (actor.role === ROLE.ADMIN) {
      return {
        isAdmin: true,
        message: "Admin does not require attendance.",
        todayRecord: null,
        recentHistory: [],
      };
    }

    const today = getTodayDateString();
    const todayRecord = await attendanceRepository.findByUserAndDate(actor._id, today);
    const recentHistory = await attendanceRepository.findMany(
      { userId: actor._id as unknown as Types.ObjectId } as Filter<AttendanceAttrs>,
      { page: 1, limit: 10, skip: 0 },
    );

    return {
      isAdmin: false,
      hasCheckedIn: !!todayRecord,
      hasCheckedOut: !!todayRecord?.checkOut,
      todayRecord,
      recentHistory,
    };
  },

  async list(actor: AuthenticatedUser, query: ListAttendanceQuery) {
    const filter: Filter<AttendanceAttrs> = {};

    if (query.date) {
      filter.date = query.date;
    } else if (query.startDate || query.endDate) {
      filter.date = {} as unknown as string;
      if (query.startDate) (filter.date as unknown as Record<string, string>).$gte = query.startDate;
      if (query.endDate) (filter.date as unknown as Record<string, string>).$lte = query.endDate;
    }

    if (query.status) {
      filter.status = query.status;
    }

    // Role-based scope
    if (actor.role === ROLE.EMPLOYEE) {
      // Employee sees ONLY own attendance
      filter.userId = actor._id as unknown as Types.ObjectId;
    } else if (actor.role === ROLE.HR) {
      if (query.userId) {
        const targetUser = await UserModel.findById(query.userId).lean();
        if (!targetUser || (!sameId(targetUser._id, actor._id) && !sameId(targetUser.hrId, actor._id))) {
          throw new ForbiddenError("You do not have access to view this employee's attendance.");
        }
        filter.userId = query.userId as unknown as Types.ObjectId;
      } else {
        // HR sees managed employees + self
        const managedUsers = await UserModel.find({
          $or: [{ hrId: actor._id }, { _id: actor._id }],
        }).select("_id").lean();
        const userIds = managedUsers.map((u) => u._id);
        filter.userId = { $in: userIds } as unknown as Types.ObjectId;
      }
    } else if (actor.role === ROLE.ADMIN) {
      if (query.userId) {
        filter.userId = query.userId as unknown as Types.ObjectId;
      } else if (query.hrId) {
        const managed = await UserModel.find({ hrId: query.hrId }).select("_id").lean();
        const userIds = managed.map((u) => u._id);
        filter.userId = { $in: userIds } as unknown as Types.ObjectId;
      } else if (query.department) {
        const deptUsers = await UserModel.find({ department: query.department }).select("_id").lean();
        const userIds = deptUsers.map((u) => u._id);
        filter.userId = { $in: userIds } as unknown as Types.ObjectId;
      }
    }

    const pagination = resolvePagination(query);

    const [records, total] = await Promise.all([
      attendanceRepository.findMany(filter, pagination),
      attendanceRepository.count(filter),
    ]);

    return { records, pagination: buildPaginationMeta(total, pagination) };
  },

  async getByUserId(actor: AuthenticatedUser, targetUserId: string, query: ListAttendanceQuery) {
    if (actor.role === ROLE.EMPLOYEE && !sameId(actor._id, targetUserId)) {
      throw new ForbiddenError("You can only view your own attendance.");
    }

    if (actor.role === ROLE.HR && !sameId(actor._id, targetUserId)) {
      const targetUser = await UserModel.findById(targetUserId).lean();
      if (!targetUser || !sameId(targetUser.hrId, actor._id)) {
        throw new ForbiddenError("You can only view attendance for employees managed by you.");
      }
    }

    const filter: Filter<AttendanceAttrs> = {
      userId: targetUserId as unknown as Types.ObjectId,
    };

    if (query.date) filter.date = query.date;
    if (query.status) filter.status = query.status;

    const pagination = resolvePagination(query);

    const [records, total] = await Promise.all([
      attendanceRepository.findMany(filter, pagination),
      attendanceRepository.count(filter),
    ]);

    return { records, pagination: buildPaginationMeta(total, pagination) };
  },
};
