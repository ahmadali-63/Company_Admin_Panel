import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import { ATTENDANCE_STATUSES, type AttendanceStatus } from "../../common/constants/roles.js";

export interface AttendanceAttrs {
  userId: Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  checkIn: Date;
  checkOut: Date | null;
  workingHours: string;
  workingMinutes: number;
  status: AttendanceStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceDocument = HydratedDocument<AttendanceAttrs>;

export type AttendanceModelType = Model<AttendanceAttrs>;

const attendanceSchema = new Schema<AttendanceAttrs, AttendanceModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workingHours: {
      type: String,
      default: "",
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: "Present",
    },
    notes: {
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

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

export const AttendanceModel = model<AttendanceAttrs, AttendanceModelType>(
  "Attendance",
  attendanceSchema,
);
