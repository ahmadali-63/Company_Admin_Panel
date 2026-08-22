import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../../common/constants/roles.js";

export interface TaskComment {
  _id?: Types.ObjectId;
  text: string;
  author: Types.ObjectId;
  createdAt: Date;
}

export interface TaskAttrs {
  title: string;
  description: string;
  projectId?: Types.ObjectId | null;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date;
  dueDate: Date; // alias for compatibility
  comments: TaskComment[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = HydratedDocument<TaskAttrs>;
export type TaskModelType = Model<TaskAttrs>;

const taskCommentSchema = new Schema<TaskComment>(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const taskSchema = new Schema<TaskAttrs, TaskModelType>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: TASK_STATUSES, default: "pending", index: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    deadline: { type: Date, required: true },
    dueDate: { type: Date },
    comments: [taskCommentSchema],
    completedAt: { type: Date, default: null },
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

taskSchema.pre("save", function () {
  if (this.deadline && !this.dueDate) {
    this.dueDate = this.deadline;
  }
  if (!this.deadline && this.dueDate) {
    this.deadline = this.dueDate;
  }
  if (this.assignedBy && !this.createdBy) {
    this.createdBy = this.assignedBy;
  }
  if (!this.assignedBy && this.createdBy) {
    this.assignedBy = this.createdBy;
  }
  // Auto overdue if deadline passed and status is not completed
  if (this.status !== "completed" && this.deadline && new Date() > new Date(this.deadline)) {
    this.status = "overdue";
  }
});

taskSchema.index({ projectId: 1, assignedTo: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ createdAt: -1 });

export const TaskModel = model<TaskAttrs, TaskModelType>("Task", taskSchema);
