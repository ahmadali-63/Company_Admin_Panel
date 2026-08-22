import type { Types } from "mongoose";

import type { Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import {
  AttendanceModel,
  type AttendanceAttrs,
  type AttendanceDocument,
} from "./attendance.model.js";

const POPULATE_USER = {
  path: "userId",
  select: "name email employeeId department designation role profileImage hrId",
  populate: {
    path: "hrId",
    select: "name email employeeId",
  },
};

export const attendanceRepository = {
  model: AttendanceModel,

  create(data: Partial<AttendanceAttrs>): Promise<AttendanceDocument> {
    return AttendanceModel.create(data);
  },

  findById(id: Types.ObjectId | string): Promise<AttendanceDocument | null> {
    return AttendanceModel.findById(id).populate(POPULATE_USER).exec();
  },

  findByUserAndDate(
    userId: Types.ObjectId | string,
    date: string,
  ): Promise<AttendanceDocument | null> {
    return AttendanceModel.findOne({ userId, date }).exec();
  },

  findMany(filter: Filter<AttendanceAttrs>, pagination?: ResolvedPagination) {
    let query = AttendanceModel.find(filter)
      .populate(POPULATE_USER)
      .sort({ date: -1, createdAt: -1 });

    if (pagination) {
      if (pagination.skip !== undefined) query = query.skip(pagination.skip);
      if (pagination.limit !== undefined) query = query.limit(pagination.limit);
    }

    return query.lean().exec();
  },

  count(filter: Filter<AttendanceAttrs>): Promise<number> {
    return AttendanceModel.countDocuments(filter).exec();
  },

  getTodayRecords(date: string) {
    return AttendanceModel.find({ date }).populate(POPULATE_USER).lean().exec();
  },

  deleteMany(filter: Filter<AttendanceAttrs>) {
    return AttendanceModel.deleteMany(filter).exec();
  },
};

export type AttendanceRepository = typeof attendanceRepository;
