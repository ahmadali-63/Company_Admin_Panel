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
 * Row-level scope. Admin sees everything; HR sees itself plus its reports;
 * a team lead sees itself plus its members; a member sees only itself.
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

interface ResolvedHierarchy {
  hrId: Types.ObjectId | null;
}

/**
 * Enforces the org chart: employees must hang off an HR.
 * Admin and HR sit at the top with no parent.
 */
const resolveHierarchy = async (
  role: Role,
  hrId: string | null | undefined,
): Promise<ResolvedHierarchy> => {
  if (role === ROLE.ADMIN || role === ROLE.HR) {
    return { hrId: null };
  }

  if (!hrId) {
    throw new BadRequestError("Employee must be assigned to a valid HR.");
  }

  const hrUser = await userRepository.findById(hrId);

  if (!hrUser || hrUser.role !== ROLE.HR) {
    throw new BadRequestError("Selected HR is invalid or not an HR role.");
  }

  return { hrId: hrUser._id };
};


export const userService = {
  async create(input: CreateUserInput) {
    if (input.role === ROLE.ADMIN) {
      throw new BadRequestError("Cannot create an Admin account.");
    }

    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictError("A user with this email already exists.");
    }

    const existingEmpId = await userRepository.model.findOne({ employeeId: input.employeeId.toUpperCase() });
    if (existingEmpId) {
      throw new ConflictError("A user with this Employee ID already exists.");
    }

    const hierarchy = await resolveHierarchy(
      input.role,
      input.hrId,
    );

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      phone: input.phone,
      department: input.department,
      designation: input.designation,
      hrId: hierarchy.hrId,
      projectIds: input.projectIds as unknown as Types.ObjectId[],
      isActive: true,
      employeeId: input.employeeId.toUpperCase(),
      joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
      profileImage: input.profileImage || "",
    });

    return userRepository.findPublicById(user._id);
  },

  async list(actor: AuthenticatedUser, query: ListUsersQuery) {
    const scope = buildUserScopeFilter(actor);
    const filter: Filter<UserAttrs> = { ...scope };

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.search) {
      const search = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { employeeId: { $regex: query.search, $options: "i" } },
      ];

      // `scope` may already own `$or`; combine with `$and` so neither is lost.
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

  /** Ownership check: does `actor`'s scope contain the target user? */
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
      throw new BadRequestError("Cannot change system Admin role.");
    }

    if (input.email && input.email !== user.email) {
      const taken = await userRepository.emailTakenByOther(input.email, id);
      if (taken) {
        throw new ConflictError("This email is already in use.");
      }
      user.email = input.email;
    }

    if (input.employeeId && input.employeeId.toUpperCase() !== user.employeeId) {
      const takenEmpId = await userRepository.model.findOne({
        employeeId: input.employeeId.toUpperCase(),
        _id: { $ne: id },
      });
      if (takenEmpId) {
        throw new ConflictError("A user with this Employee ID already exists.");
      }
      user.employeeId = input.employeeId.toUpperCase();
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.department !== undefined) user.department = input.department;
    if (input.designation !== undefined) user.designation = input.designation;
    if (input.joiningDate !== undefined && input.joiningDate !== null) {
      user.joiningDate = new Date(input.joiningDate);
    }
    if (input.profileImage !== undefined) user.profileImage = input.profileImage;

    const targetRole = input.role ?? user.role;

    const hierarchyTouched =
      input.role !== undefined ||
      input.hrId !== undefined;

    if (hierarchyTouched) {
      const hierarchy = await resolveHierarchy(
        targetRole,
        input.hrId !== undefined ? input.hrId : user.hrId?.toString(),
      );

      user.hrId = hierarchy.hrId;
    }

    user.role = targetRole;

    if (input.projectIds !== undefined) {
      user.projectIds = input.projectIds as unknown as Types.ObjectId[];
    }

    if (input.password) {
      // Plaintext in, hashed by the model's pre-save hook. Bump tokenVersion
      // so any refresh token issued before the change stops working.
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

    if (!user) {
      throw new NotFoundError("User not found.");
    }

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

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Leave no dangling references behind: clear the org-chart pointers and
    // strip the user from every project assignment list.
    await Promise.all([
      userRepository.detachFromHierarchy(user._id),
      projectRepository.detachUser(user._id),
    ]);
  },
};
