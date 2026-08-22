import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from "../../common/constants/roles.js";

export interface ProjectAttrs {
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: Types.ObjectId;
  hrIds: Types.ObjectId[];
  employeeIds: Types.ObjectId[];
  memberIds: Types.ObjectId[]; // alias for compatibility
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectDocument = HydratedDocument<ProjectAttrs>;
export type ProjectModelType = Model<ProjectAttrs>;

const projectSchema = new Schema<ProjectAttrs, ProjectModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },
    description: { type: String, trim: true, default: "", maxlength: 2000 },
    status: { type: String, enum: PROJECT_STATUSES, default: "planning" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hrIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    employeeIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
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

projectSchema.pre("save", function () {
  if (this.employeeIds && (!this.memberIds || this.memberIds.length === 0)) {
    this.memberIds = this.employeeIds;
  }
  if (this.memberIds && (!this.employeeIds || this.employeeIds.length === 0)) {
    this.employeeIds = this.memberIds;
  }
});

projectSchema.index({ status: 1 });
projectSchema.index({ hrIds: 1 });
projectSchema.index({ employeeIds: 1 });
projectSchema.index({ memberIds: 1 });
projectSchema.index({ createdAt: -1 });

export const ProjectModel = model<ProjectAttrs, ProjectModelType>(
  "Project",
  projectSchema,
);
