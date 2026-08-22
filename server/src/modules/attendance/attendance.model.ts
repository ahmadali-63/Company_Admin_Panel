import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import { ATTENDANCE_STATUSES } from "../../common/constants/attendance.js";
import { AttendanceAttrs, AttendanceModelType } from "../../common/types/attendance.js";

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];



const attendanceSchema = new Schema<AttendanceAttrs, AttendanceModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      default: null,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: "present",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AttendanceModel = model<AttendanceAttrs, AttendanceModelType>(
  "Attendance",
  attendanceSchema,
);
