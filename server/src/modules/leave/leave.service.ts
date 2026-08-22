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
import { NotificationModel } from "../notification/notification.model.js";
import { LeaveModel, type LeaveAttrs } from "./leave.model.js";
import { leaveRepository } from "./leave.repository.js";
import type {
  CreateLeaveInput,
  ListLeavesQuery,
  RespondLeaveInput,
} from "./leave.schema.js";

export const leaveService = {
  async apply(actor: AuthenticatedUser, input: CreateLeaveInput) {
    if (actor.role === ROLE.ADMIN) {
      throw new ForbiddenError("Admin does not submit leave requests.");
    }

    const leave = await leaveRepository.create({
      userId: actor._id as unknown as Types.ObjectId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      responseComment: "",
    });

    // Notify HR or Admin
    const user = await UserModel.findById(actor._id).lean();
    if (user?.hrId) {
      await NotificationModel.create({
        userId: user.hrId,
        title: "New Leave Application",
        message: `${actor.name} (${user.employeeId}) has applied for ${input.leaveType} leave.`,
        type: "leave",
        isRead: false,
      });
    }

    return leaveRepository.findById(leave._id);
  },

  async list(actor: AuthenticatedUser, query: ListLeavesQuery) {
    const filter: Filter<LeaveAttrs> = {};

    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;

    if (actor.role === ROLE.EMPLOYEE) {
      filter.userId = actor._id as unknown as Types.ObjectId;
    } else if (actor.role === ROLE.HR) {
      if (query.userId) {
        const targetUser = await UserModel.findById(query.userId).lean();
        if (!targetUser || (!sameId(targetUser._id, actor._id) && !sameId(targetUser.hrId, actor._id))) {
          throw new ForbiddenError("You do not have permission to view this employee's leave records.");
        }
        filter.userId = query.userId as unknown as Types.ObjectId;
      } else {
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
      }
    }

    const pagination = resolvePagination(query);

    const [leaves, total] = await Promise.all([
      leaveRepository.findMany(filter, pagination),
      leaveRepository.count(filter),
    ]);

    return { leaves, pagination: buildPaginationMeta(total, pagination) };
  },

  async getMyLeaves(actor: AuthenticatedUser, query: ListLeavesQuery) {
    const filter: Filter<LeaveAttrs> = {
      userId: actor._id as unknown as Types.ObjectId,
    };
    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;

    const pagination = resolvePagination(query);

    const [leaves, total] = await Promise.all([
      leaveRepository.findMany(filter, pagination),
      leaveRepository.count(filter),
    ]);

    return { leaves, pagination: buildPaginationMeta(total, pagination) };
  },

  async approve(actor: AuthenticatedUser, leaveId: string, input: RespondLeaveInput) {
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found.");
    }

    if (leave.status !== "pending") {
      throw new BadRequestError(`Cannot approve a leave that is already ${leave.status}.`);
    }

    const applicant = await UserModel.findById(leave.userId).lean();
    if (!applicant) {
      throw new NotFoundError("Applicant user not found.");
    }

    if (actor.role === ROLE.HR) {
      // HR can only approve leave for employees assigned to this HR
      if (!applicant.hrId || !sameId(applicant.hrId, actor._id)) {
        throw new ForbiddenError("You can only approve leaves for your assigned employees.");
      }
    }

    leave.status = "approved";
    leave.approvedBy = actor._id as unknown as Types.ObjectId;
    leave.approvedAt = new Date();
    leave.responseComment = input.responseComment || "";
    await leave.save();

    // Create notification for applicant
    await NotificationModel.create({
      userId: leave.userId,
      title: "Leave Request Approved",
      message: `Your ${leave.leaveType} leave request has been approved by ${actor.name}.`,
      type: "leave",
      isRead: false,
    });

    return leaveRepository.findById(leave._id);
  },

  async reject(actor: AuthenticatedUser, leaveId: string, input: RespondLeaveInput) {
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found.");
    }

    if (leave.status !== "pending") {
      throw new BadRequestError(`Cannot reject a leave that is already ${leave.status}.`);
    }

    const applicant = await UserModel.findById(leave.userId).lean();
    if (!applicant) {
      throw new NotFoundError("Applicant user not found.");
    }

    if (actor.role === ROLE.HR) {
      if (!applicant.hrId || !sameId(applicant.hrId, actor._id)) {
        throw new ForbiddenError("You can only reject leaves for your assigned employees.");
      }
    }

    leave.status = "rejected";
    leave.approvedBy = actor._id as unknown as Types.ObjectId;
    leave.approvedAt = new Date();
    leave.responseComment = input.responseComment || "";
    await leave.save();

    // Create notification for applicant
    await NotificationModel.create({
      userId: leave.userId,
      title: "Leave Request Rejected",
      message: `Your ${leave.leaveType} leave request was not approved. ${input.responseComment ? "Reason: " + input.responseComment : ""}`,
      type: "leave",
      isRead: false,
    });

    return leaveRepository.findById(leave._id);
  },
};
