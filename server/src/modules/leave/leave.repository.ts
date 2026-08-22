import type { Types } from "mongoose";

import type { Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import { LeaveModel, type LeaveAttrs, type LeaveDocument } from "./leave.model.js";

const POPULATE_FIELDS = [
  {
    path: "userId",
    select: "name email employeeId department designation role profileImage hrId",
    populate: {
      path: "hrId",
      select: "name email employeeId",
    },
  },
  {
    path: "approvedBy",
    select: "name email employeeId role designation",
  },
];

export const leaveRepository = {
  model: LeaveModel,

  create(data: Partial<LeaveAttrs>): Promise<LeaveDocument> {
    return LeaveModel.create(data);
  },

  findById(id: Types.ObjectId | string): Promise<LeaveDocument | null> {
    return LeaveModel.findById(id).populate(POPULATE_FIELDS).exec();
  },

  findMany(filter: Filter<LeaveAttrs>, pagination?: ResolvedPagination) {
    let query = LeaveModel.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    if (pagination) {
      if (pagination.skip !== undefined) query = query.skip(pagination.skip);
      if (pagination.limit !== undefined) query = query.limit(pagination.limit);
    }

    return query.lean().exec();
  },

  count(filter: Filter<LeaveAttrs>): Promise<number> {
    return LeaveModel.countDocuments(filter).exec();
  },

  deleteMany(filter: Filter<LeaveAttrs>) {
    return LeaveModel.deleteMany(filter).exec();
  },
};

export type LeaveRepository = typeof leaveRepository;
