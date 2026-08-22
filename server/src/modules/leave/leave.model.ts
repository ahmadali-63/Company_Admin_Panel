import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import {
  LEAVE_STATUSES,
  LEAVE_TYPES,
  type LeaveStatus,
  type LeaveType,
} from "../../common/constants/roles.js";

export interface LeaveAttrs {
  userId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy: Types.ObjectId | null;
  approvedAt: Date | null;
  responseComment: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeaveDocument = HydratedDocument<LeaveAttrs>;

export type LeaveModelType = Model<LeaveAttrs>;

const leaveSchema = new Schema<LeaveAttrs, LeaveModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: LEAVE_STATUSES,
      default: "pending",
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    responseComment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

leaveSchema.index({ userId: 1, startDate: 1 });
leaveSchema.index({ status: 1, createdAt: -1 });

export const LeaveModel = model<LeaveAttrs, LeaveModelType>("Leave", leaveSchema);
