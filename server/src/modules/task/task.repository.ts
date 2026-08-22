import type { Types } from "mongoose";

import { populateAll, type Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import { TaskModel, type TaskAttrs, type TaskDocument } from "./task.model.js";

const RELATIONS = [
  ["projectId", "name code status"],
  ["assignedTo", "name email employeeId role department designation profileImage"],
  ["assignedBy", "name email employeeId role"],
  ["createdBy", "name email employeeId role"],
  ["comments.author", "name email role profileImage"],
] as const;


const withRelations = <T extends object>(query: T): T =>
  populateAll(query, RELATIONS);

export const taskRepository = {
  model: TaskModel,

  create(data: Partial<TaskAttrs>): Promise<TaskDocument> {
    return TaskModel.create(data) as unknown as Promise<TaskDocument>;
  },

  findById(id: Types.ObjectId | string): Promise<TaskDocument | null> {
    return TaskModel.findById(id).exec();
  },

  findPopulatedById(id: Types.ObjectId | string) {
    return withRelations(TaskModel.findById(id)).lean().exec();
  },

  findMany(filter: Filter<TaskAttrs>, pagination?: ResolvedPagination) {
    let query = withRelations(TaskModel.find(filter)).sort({ deadline: 1, createdAt: -1 });

    if (pagination) {
      if (pagination.skip !== undefined) query = query.skip(pagination.skip);
      if (pagination.limit !== undefined) query = query.limit(pagination.limit);
    }

    return query.lean().exec();
  },

  count(filter: Filter<TaskAttrs>): Promise<number> {
    return TaskModel.countDocuments(filter).exec();
  },

  deleteById(id: Types.ObjectId | string): Promise<TaskDocument | null> {
    return TaskModel.findByIdAndDelete(id).exec();
  },

  deleteByProject(projectId: Types.ObjectId | string) {
    return TaskModel.deleteMany({ projectId }).exec();
  },
};

export type TaskRepository = typeof taskRepository;
