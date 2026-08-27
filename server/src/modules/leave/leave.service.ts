import { LeaveModel, type LeaveType, type LeaveStatus } from "./leave.model.js";
import { NotFoundError } from "../../common/errors/AppError.js";
import type { Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import { buildUserScopeFilter } from "../user/user.service.js";
import { UserModel } from "../user/user.model.js";

export class LeaveService {
  async applyLeave(
    userId: string | Types.ObjectId,
    data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string },
  ) {
    const leave = await LeaveModel.create({
      userId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "pending",
    });

    return leave;
  }

  async getMyLeaves(userId: string | Types.ObjectId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      LeaveModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      LeaveModel.countDocuments({ userId }),
    ]);

    return { records, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getAllLeaves(
    actor: AuthenticatedUser,
    query: {
    userId?: string;
    status?: LeaveStatus;
    leaveType?: LeaveType;
    page?: number;
    limit?: number;
  }) {
    const scopeFilter = buildUserScopeFilter(actor);
    const allowedUsers = await UserModel.find(scopeFilter).select("_id").lean();
    const allowedUserIds = allowedUsers.map(u => u._id);

    const filter: Record<string, unknown> = {};
    if (query.userId) {
      if (!allowedUserIds.some(id => id.toString() === query.userId)) {
        return { records: [], total: 0, page: query.page || 1, limit: query.limit || 20, pages: 0 };
      }
      filter.userId = query.userId;
    } else {
      filter.userId = { $in: allowedUserIds };
    }
    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      LeaveModel.find(filter)
        .populate("userId", "name email role designation department")
        .populate("reviewedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LeaveModel.countDocuments(filter),
    ]);

    return { records, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateLeaveStatus(
    leaveId: string,
    reviewerId: string | Types.ObjectId,
    status: LeaveStatus,
    reviewComment: string = "",
  ) {
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    leave.status = status;
    leave.reviewedBy = reviewerId as Types.ObjectId;
    leave.reviewComment = reviewComment;

    await leave.save();
    return leave;
  }
}

export const leaveService = new LeaveService();
