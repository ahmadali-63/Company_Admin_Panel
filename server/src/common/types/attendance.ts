import { HydratedDocument, Model, Types } from "mongoose";
import { AttendanceStatus } from "../../modules/attendance/attendance.model.js";

    export interface AttendanceAttrs {
    userId: Types.ObjectId;
    date: string; // YYYY-MM-DD format
    checkIn: Date; // Automatically set by server on enter
    checkOut: Date | null; // Automatically set by server on exit
    workingHours: string | null;
    status: AttendanceStatus;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    }

    export type AttendanceDocument = HydratedDocument<AttendanceAttrs>;
    export type AttendanceModelType = Model<AttendanceAttrs>;