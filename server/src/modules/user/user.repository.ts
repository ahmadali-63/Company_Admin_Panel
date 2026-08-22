import type { Types } from "mongoose";

import { populateAll, type Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import { UserModel, type UserAttrs, type UserDocument } from "./user.model.js";

const PUBLIC_PROJECTION = "-password -tokenVersion";

const RELATIONS = [
  ["hrId", "name email role department designation employeeId profileImage"],
  ["projectIds", "name code status"],
] as const;

const withRelations = <T extends object>(query: T): T =>
  populateAll(query, RELATIONS);

export const userRepository = {
  model: UserModel,

  create(data: Partial<UserAttrs>): Promise<UserDocument> {
    return UserModel.create(data) as unknown as Promise<UserDocument>;
  },

  findById(id: Types.ObjectId | string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  },

  findByIdWithPassword(
    id: Types.ObjectId | string,
  ): Promise<UserDocument | null> {
    return UserModel.findById(id).select("+password").exec();
  },

  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select("+password").exec();
  },

  findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  },

  findByEmployeeId(employeeId: string): Promise<UserDocument | null> {
    return UserModel.findOne({ employeeId }).exec();
  },

  emailTakenByOther(
    email: string,
    excludeId: Types.ObjectId | string,
  ): Promise<boolean> {
    return UserModel.exists({ email, _id: { $ne: excludeId } }).then(Boolean);
  },

  employeeIdTakenByOther(
    employeeId: string,
    excludeId: Types.ObjectId | string,
  ): Promise<boolean> {
    return UserModel.exists({ employeeId, _id: { $ne: excludeId } }).then(Boolean);
  },

  findPublicById(id: Types.ObjectId | string) {
    return withRelations(UserModel.findById(id).select(PUBLIC_PROJECTION))
      .lean()
      .exec();
  },

  findMany(filter: Filter<UserAttrs>, pagination?: ResolvedPagination) {
    let query = withRelations(
      UserModel.find(filter).select(PUBLIC_PROJECTION),
    ).sort({ createdAt: -1 });

    if (pagination) {
      if (pagination.skip !== undefined) query = query.skip(pagination.skip);
      if (pagination.limit !== undefined) query = query.limit(pagination.limit);
    }

    return query.lean().exec();
  },

  count(filter: Filter<UserAttrs>): Promise<number> {
    return UserModel.countDocuments(filter).exec();
  },

  deleteById(id: Types.ObjectId | string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec();
  },

  setActive(
    id: Types.ObjectId | string,
    isActive: boolean,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      isActive ? { isActive } : { isActive, $inc: { tokenVersion: 1 } },
      { new: true },
    )
      .select(PUBLIC_PROJECTION)
      .exec();
  },

  addProject(
    userId: Types.ObjectId | string,
    projectId: Types.ObjectId | string,
  ) {
    return UserModel.updateOne(
      { _id: userId },
      { $addToSet: { projectIds: projectId } },
    ).exec();
  },

  removeProject(
    userId: Types.ObjectId | string,
    projectId: Types.ObjectId | string,
  ) {
    return UserModel.updateOne(
      { _id: userId },
      { $pull: { projectIds: projectId } },
    ).exec();
  },

  removeProjectFromAll(projectId: Types.ObjectId | string) {
    return UserModel.updateMany(
      { projectIds: projectId },
      { $pull: { projectIds: projectId } },
    ).exec();
  },

  detachFromHierarchy(userId: Types.ObjectId | string) {
    return UserModel.updateMany({ hrId: userId }, { $set: { hrId: null } }).exec();
  },
};

export type UserRepository = typeof userRepository;
