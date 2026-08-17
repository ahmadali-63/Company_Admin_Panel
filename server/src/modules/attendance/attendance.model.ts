import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export const ATTENDANCE_STATUSES = ["present", "half_day", "absent", "on_leave"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceAttrs {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD format
  checkIn: Date; // Automatically set by server on enter
  checkOut: Date | null; // Automatically set by server on exit
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
