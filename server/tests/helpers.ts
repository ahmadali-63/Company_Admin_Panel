import type { Express } from "express";
import type { Types } from "mongoose";

import { createApp } from "../src/app.js";
import { ROLE, type Role } from "../src/common/constants/roles.js";
import { signAccessToken } from "../src/modules/auth/token.service.js";
import { UserModel, type UserDocument } from "../src/modules/user/user.model.js";
import { ProjectModel } from "../src/modules/project/project.model.js";

export const app: Express = createApp();

let counter = 0;

export const makeUser = async (
  overrides: Partial<{
    role: Role;
    email: string;
    password: string;
    name: string;
    employeeId: string;
    isActive: boolean;
    hrId: Types.ObjectId | null;
  }> = {},
): Promise<UserDocument> => {
  counter += 1;

  return UserModel.create({
    employeeId: overrides.employeeId ?? `EMP-${counter}`,
    name: overrides.name ?? `User ${counter}`,
    email: overrides.email ?? `user${counter}@example.com`,
    password: overrides.password ?? "Password123!",
    role: overrides.role ?? ROLE.EMPLOYEE,
    isActive: overrides.isActive ?? true,
    hrId: overrides.hrId ?? null,
  }) as unknown as Promise<UserDocument>;
};

export const authHeader = (user: UserDocument): string =>
  `Bearer ${signAccessToken(user._id.toString(), user.role)}`;

export const makeProject = async (
  createdBy: UserDocument,
  overrides: Record<string, unknown> = {},
) => {
  counter += 1;

  return ProjectModel.create({
    name: `Project ${counter}`,
    code: `PRJ${counter}`,
    createdBy: createdBy._id,
    ...overrides,
  });
};
