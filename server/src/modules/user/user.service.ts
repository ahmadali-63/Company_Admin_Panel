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
    case ROLE.TEAM_LEAD:
      return { $or: [{ _id: actor._id }, { teamLeadId: actor._id }] };
    default:
      return { _id: actor._id };
  }
};

interface ResolvedHierarchy {
  hrId: Types.ObjectId | null;
  teamLeadId: Types.ObjectId | null;
}

/**
 * Enforces the org chart: team leads hang off an HR, members hang off a team
 * lead (and inherit that lead's HR). Admin and HR sit at the top with no parent.
 */
const resolveHierarchy = async (
  role: Role,
  hrId: string | null | undefined,
  teamLeadId: string | null | undefined,
): Promise<ResolvedHierarchy> => {
  if (role === ROLE.ADMIN || role === ROLE.HR) {
    return { hrId: null, teamLeadId: null };
  }

  if (role === ROLE.TEAM_LEAD) {
    if (!hrId) {
      throw new BadRequestError("Team Lead must be assigned to a valid HR.");
    }

    const hrUser = await userRepository.findById(hrId);

    if (!hrUser || hrUser.role !== ROLE.HR) {
      throw new BadRequestError("Selected HR is invalid or not an HR role.");
    }

    return { hrId: hrUser._id, teamLeadId: null };
  }

  if (!teamLeadId) {
    throw new BadRequestError(
      "Team Member must be assigned to a valid Team Lead.",
    );
  }

  const leadUser = await userRepository.findById(teamLeadId);

  if (!leadUser || leadUser.role !== ROLE.TEAM_LEAD) {
    throw new BadRequestError(
      "Selected Team Lead is invalid or not a Team Lead role.",
    );
  }

  if (!leadUser.hrId) {
    throw new BadRequestError(
      "The selected Team Lead is not assigned to an HR.",
    );
  }

  if (hrId && !sameId(hrId, leadUser.hrId)) {
    throw new BadRequestError(
      "Team Member assigned to a Team Lead must belong to the same HR.",
    );
  }

  return { hrId: leadUser.hrId, teamLeadId: leadUser._id };
};

export const userService = {
  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictError("A user with this email already exists.");
    }

    const hierarchy = await resolveHierarchy(
      input.role,
      input.hrId,
      input.teamLeadId,
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
      teamLeadId: hierarchy.teamLeadId,
      projectIds: input.projectIds as unknown as Types.ObjectId[],
      isActive: true,
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

    if (input.email && input.email !== user.email) {
      const taken = await userRepository.emailTakenByOther(input.email, id);
      if (taken) {
        throw new ConflictError("This email is already in use.");
      }
      user.email = input.email;
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.department !== undefined) user.department = input.department;
    if (input.designation !== undefined) user.designation = input.designation;

    const targetRole = input.role ?? user.role;

    // Only re-derive the org chart when the caller actually touched it.
    // Re-validating on every edit would reject an unrelated change (a phone
    // number, say) for a pre-existing record whose parent links are empty.
    const hierarchyTouched =
      input.role !== undefined ||
      input.hrId !== undefined ||
      input.teamLeadId !== undefined;

    if (hierarchyTouched) {
      const hierarchy = await resolveHierarchy(
        targetRole,
        input.hrId !== undefined ? input.hrId : user.hrId?.toString(),
        input.teamLeadId !== undefined
          ? input.teamLeadId
          : user.teamLeadId?.toString(),
      );

      user.hrId = hierarchy.hrId;
      user.teamLeadId = hierarchy.teamLeadId;
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
