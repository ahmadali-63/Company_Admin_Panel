import type { Types } from "mongoose";

import { populateAll, type Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import {
  ProjectModel,
  type ProjectAttrs,
  type ProjectDocument,
} from "./project.model.js";

const MEMBER_FIELDS = "name email role department designation";

const RELATIONS = [
  ["createdBy", "name email role"],
  ["hrIds", MEMBER_FIELDS],
  ["teamLeadIds", MEMBER_FIELDS],
  ["memberIds", MEMBER_FIELDS],
] as const;

const withRelations = <T extends object>(query: T): T =>
  populateAll(query, RELATIONS);

export type ProjectRole = "hrIds" | "teamLeadIds" | "memberIds";

export const projectRepository = {
  model: ProjectModel,

  create(data: Partial<ProjectAttrs>): Promise<ProjectDocument> {
    return ProjectModel.create(data) as unknown as Promise<ProjectDocument>;
  },

  findById(id: Types.ObjectId | string): Promise<ProjectDocument | null> {
    return ProjectModel.findById(id).exec();
  },

  findByCode(code: string): Promise<ProjectDocument | null> {
    return ProjectModel.findOne({ code }).exec();
  },

  codeTakenByOther(
    code: string,
    excludeId: Types.ObjectId | string,
  ): Promise<boolean> {
    return ProjectModel.exists({ code, _id: { $ne: excludeId } }).then(Boolean);
  },

  findPopulatedById(id: Types.ObjectId | string) {
    return withRelations(ProjectModel.findById(id)).lean().exec();
  },

  findMany(filter: Filter<ProjectAttrs>, pagination: ResolvedPagination) {
    let query = withRelations(ProjectModel.find(filter)).sort({
      createdAt: -1,
    });

    if (pagination.skip !== undefined) query = query.skip(pagination.skip);
    if (pagination.limit !== undefined) query = query.limit(pagination.limit);

    return query.lean().exec();
  },

  count(filter: Filter<ProjectAttrs>): Promise<number> {
    return ProjectModel.countDocuments(filter).exec();
  },

  findIds(filter: Filter<ProjectAttrs>): Promise<Types.ObjectId[]> {
    return ProjectModel.find(filter)
      .select("_id")
      .lean<{ _id: Types.ObjectId }[]>()
      .exec()
      .then((docs) => docs.map((doc) => doc._id));
  },

  deleteById(id: Types.ObjectId | string): Promise<ProjectDocument | null> {
    return ProjectModel.findByIdAndDelete(id).exec();
  },

  addAssignee(
    projectId: Types.ObjectId | string,
    field: ProjectRole,
    userId: Types.ObjectId | string,
  ) {
    return ProjectModel.updateOne(
      { _id: projectId },
      { $addToSet: { [field]: userId } },
    ).exec();
  },

  removeAssignee(
    projectId: Types.ObjectId | string,
    field: ProjectRole,
    userId: Types.ObjectId | string,
  ) {
    return ProjectModel.updateOne(
      { _id: projectId },
      { $pull: { [field]: userId } },
    ).exec();
  },

  /** Strip a user from every project they were assigned to. */
  detachUser(userId: Types.ObjectId | string) {
    return ProjectModel.updateMany(
      {
        $or: [{ hrIds: userId }, { teamLeadIds: userId }, { memberIds: userId }],
      },
      {
        $pull: { hrIds: userId, teamLeadIds: userId, memberIds: userId },
      },
    ).exec();
  },
};

export type ProjectRepository = typeof projectRepository;
