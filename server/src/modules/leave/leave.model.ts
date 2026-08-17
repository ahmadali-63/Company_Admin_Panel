import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export const LEAVE_TYPES = ["medical", "emergency", "urgent_work"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ["pending", "approved", "rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export interface LeaveAttrs {
  userId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  reviewedBy: Types.ObjectId | null;
  reviewComment: string;
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
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: LEAVE_STATUSES,
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewComment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

leaveSchema.index({ userId: 1 });
leaveSchema.index({ status: 1 });

export const LeaveModel = model<LeaveAttrs, LeaveModelType>("Leave", leaveSchema);
