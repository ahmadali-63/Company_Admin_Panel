import type { Types } from "mongoose";

import { ROLE, type Role } from "../../common/constants/roles.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import { sameId } from "../../common/utils/objectId.js";
import {
  buildPaginationMeta,
  resolvePagination,
} from "../../common/utils/pagination.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import { projectRepository } from "../project/project.repository.js";
import type { UserAttrs, UserDocument } from "./user.model.js";
import { userRepository } from "./user.repository.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./user.schema.js";

/**
 * Row-level scope.
 * Admin: sees everything.
 * HR: sees itself plus employees assigned to this HR.
 * Employee: sees only itself.
 */
export const buildUserScopeFilter = (
  actor: AuthenticatedUser,
): Filter<UserAttrs> => {
  switch (actor.role) {
    case ROLE.ADMIN:
      return {};
    case ROLE.HR:
      return { $or: [{ _id: actor._id }, { hrId: actor._id }] };
    default:
      return { _id: actor._id };
  }
};

const generateEmployeeId = async (role: Role): Promise<string> => {
  const prefix = role === ROLE.ADMIN ? "ADM" : role === ROLE.HR ? "HR" : "EMP";
  const count = await userRepository.count({ role });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
};

export const userService = {
  async create(input: CreateUserInput) {
    if (input.role === ROLE.ADMIN) {
      throw new ForbiddenError("Cannot create another Admin account. There is only one Admin.");
    }

    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError("A user with this email already exists.");
    }

    let employeeId = input.employeeId?.trim();
    if (!employeeId) {
      employeeId = await generateEmployeeId(input.role);
    } else {
      const existingEmpId = await userRepository.findByEmployeeId(employeeId);
      if (existingEmpId) {
        throw new ConflictError("A user with this Employee ID already exists.");
      }
    }

    let assignedHrId: Types.ObjectId | null = null;
    if (input.role === ROLE.EMPLOYEE && input.hrId) {
      const hrUser = await userRepository.findById(input.hrId);
      if (!hrUser || hrUser.role !== ROLE.HR) {
        throw new BadRequestError("Assigned HR is invalid or not an HR role.");
      }
      assignedHrId = hrUser._id;
    }

    const user = await userRepository.create({
      employeeId,
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      phone: input.phone || "",
      department: input.department || "",
      designation: input.designation || "",
      hrId: assignedHrId,
      projectIds: (input.projectIds as unknown as Types.ObjectId[]) || [],
      isActive: true,
      joiningDate: input.joiningDate || new Date(),
      profileImage: input.profileImage || "",
    });

    return userRepository.findPublicById(user._id);
  },

  async list(actor: AuthenticatedUser, query: ListUsersQuery) {
    const scope = buildUserScopeFilter(actor);
    const filter: Filter<UserAttrs> = { ...scope };

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.department) filter.department = query.department;
    if (query.hrId) filter.hrId = query.hrId as unknown as Types.ObjectId;

    if (query.search) {
      const search = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { employeeId: { $regex: query.search, $options: "i" } },
        { department: { $regex: query.search, $options: "i" } },
        { designation: { $regex: query.search, $options: "i" } },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: search }];
        delete filter.$or;
      } else {
        filter.$or = search;
      }
    }

    const pagination = resolvePagination(query);

    const [users, total] = await Promise.all([
      userRepository.findMany(filter, pagination),
      userRepository.count(filter),
    ]);

    return { users, pagination: buildPaginationMeta(total, pagination) };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const user = await userRepository.findPublicById(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (!(await userService.canView(actor, id))) {
      throw new ForbiddenError("You do not have access to this user.");
    }

    return user;
  },

  async canView(actor: AuthenticatedUser, targetId: string): Promise<boolean> {
    if (actor.role === ROLE.ADMIN) return true;
    if (sameId(actor._id, targetId)) return true;

    const scope = buildUserScopeFilter(actor);
    const count = await userRepository.count({
      ...scope,
      _id: targetId,
    } as Filter<UserAttrs>);

    return count > 0;
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.findByIdWithPassword(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.role === ROLE.ADMIN && input.role && input.role !== ROLE.ADMIN) {
      throw new BadRequestError("Cannot change Admin role.");
    }

    if (input.role === ROLE.ADMIN && user.role !== ROLE.ADMIN) {
      throw new ForbiddenError("Cannot promote user to Admin.");
    }

    if (input.email && input.email !== user.email) {
      const taken = await userRepository.emailTakenByOther(input.email, id);
      if (taken) {
        throw new ConflictError("This email is already in use.");
      }
      user.email = input.email;
    }

    if (input.employeeId && input.employeeId !== user.employeeId) {
      const takenEmpId = await userRepository.employeeIdTakenByOther(input.employeeId, id);
      if (takenEmpId) {
        throw new ConflictError("This Employee ID is already in use.");
      }
      user.employeeId = input.employeeId;
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.department !== undefined) user.department = input.department;
    if (input.designation !== undefined) user.designation = input.designation;
    if (input.profileImage !== undefined) user.profileImage = input.profileImage;
    if (input.joiningDate !== undefined) user.joiningDate = input.joiningDate;

    if (input.hrId !== undefined) {
      if (input.hrId === null) {
        user.hrId = null;
      } else {
        const hrUser = await userRepository.findById(input.hrId);
        if (!hrUser || hrUser.role !== ROLE.HR) {
          throw new BadRequestError("Selected HR is invalid or not an HR.");
        }
        user.hrId = hrUser._id;
      }
    }

    if (input.role && input.role !== user.role && user.role !== ROLE.ADMIN) {
      user.role = input.role;
      if (user.role === ROLE.HR) {
        user.hrId = null;
      }
    }

    if (input.projectIds !== undefined) {
      user.projectIds = input.projectIds as unknown as Types.ObjectId[];
    }

    if (input.password) {
      user.password = input.password;
      user.tokenVersion += 1;
    }

    await user.save();

    return userRepository.findPublicById(user._id);
  },

  async setStatus(actor: AuthenticatedUser, id: string, isActive: boolean) {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError("User not found.");
    }

    if (targetUser.role === ROLE.ADMIN) {
      throw new BadRequestError("Admin account cannot be deactivated.");
    }

    if (sameId(actor._id, id) && !isActive) {
      throw new BadRequestError("You cannot deactivate your own account.");
    }

    const user = await userRepository.setActive(id, isActive);
    return user;
  },

  async remove(actor: AuthenticatedUser, id: string): Promise<void> {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError("User not found.");
    }

    if (targetUser.role === ROLE.ADMIN) {
      throw new BadRequestError("Admin account cannot be deleted.");
    }

    if (sameId(actor._id, id)) {
      throw new BadRequestError("You cannot delete your own account.");
    }

    const user: UserDocument | null = await userRepository.deleteById(id);

    if (user) {
      await Promise.all([
        userRepository.detachFromHierarchy(user._id),
        projectRepository.detachUser(user._id),
      ]);
    }
  },
};
