import type { Types } from "mongoose";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import { ROLE, type Role } from "../../common/constants/roles.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import { containsId } from "../../common/utils/objectId.js";
import {
  buildPaginationMeta,
  resolvePagination,
} from "../../common/utils/pagination.js";
import { taskRepository } from "../task/task.repository.js";
import { userRepository } from "../user/user.repository.js";
import type { ProjectAttrs } from "./project.model.js";
import { projectRepository } from "./project.repository.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "./project.schema.js";

export const buildProjectScopeFilter = (
  actor: AuthenticatedUser,
): Filter<ProjectAttrs> => {
  switch (actor.role) {
    case ROLE.ADMIN:
      return {};
    case ROLE.HR:
      return { hrIds: actor._id as unknown as Types.ObjectId };
    default:
      return {
        $or: [
          { employeeIds: actor._id as unknown as Types.ObjectId },
          { memberIds: actor._id as unknown as Types.ObjectId },
        ],
      } as Filter<ProjectAttrs>;
  }
};

const loadProject = async (id: string) => {
  const project = await projectRepository.findById(id);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }
  return project;
};

export const projectService = {
  async create(actor: AuthenticatedUser, input: CreateProjectInput) {
    const existing = await projectRepository.findByCode(input.code);

    if (existing) {
      throw new ConflictError("A project with this code already exists.");
    }

    const hrIds = (input.hrIds as unknown as Types.ObjectId[]) || [];
    const employeeIds =
      (input.employeeIds as unknown as Types.ObjectId[]) ||
      (input.memberIds as unknown as Types.ObjectId[]) ||
      [];

    const project = await projectRepository.create({
      name: input.name,
      code: input.code,
      description: input.description,
      status: input.status,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      createdBy: actor._id as unknown as Types.ObjectId,
      hrIds,
      employeeIds,
      memberIds: employeeIds,
      isActive: true,
    });

    // Link project to users
    const allAssigned = [...hrIds, ...employeeIds];
    await Promise.all(
      allAssigned.map((uId) => userRepository.addProject(uId, project._id)),
    );

    return projectRepository.findPopulatedById(project._id);
  },

  async list(actor: AuthenticatedUser, query: ListProjectsQuery) {
    const scope = buildProjectScopeFilter(actor);
    const filter: Filter<ProjectAttrs> = { ...scope };

    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.search) {
      const search = [
        { name: { $regex: query.search, $options: "i" } },
        { code: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: search }];
        delete filter.$or;
      } else {
        filter.$or = search;
      }
    }

    const pagination = resolvePagination(query);

    const [projects, total] = await Promise.all([
      projectRepository.findMany(filter, pagination),
      projectRepository.count(filter),
    ]);

    return { projects, pagination: buildPaginationMeta(total, pagination) };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const project = await projectRepository.findPopulatedById(id);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    if (!projectService.canView(actor, project as unknown as ProjectAttrs)) {
      throw new ForbiddenError("You do not have access to this project.");
    }

    return project;
  },

  canView(actor: AuthenticatedUser, project: ProjectAttrs): boolean {
    if (actor.role === ROLE.ADMIN) return true;

    return (
      containsId(project.hrIds, actor._id) ||
      containsId(project.employeeIds, actor._id) ||
      containsId(project.memberIds, actor._id)
    );
  },

  async update(id: string, input: UpdateProjectInput) {
    const project = await loadProject(id);

    if (input.code !== undefined && input.code !== project.code) {
      const taken = await projectRepository.codeTakenByOther(input.code, id);
      if (taken) {
        throw new ConflictError("Another project already uses this code.");
      }
      project.code = input.code;
    }

    if (input.name !== undefined) project.name = input.name;
    if (input.description !== undefined) project.description = input.description;
    if (input.status !== undefined) project.status = input.status;
    if (input.startDate !== undefined) project.startDate = input.startDate;
    if (input.endDate !== undefined) project.endDate = input.endDate;
    if (input.isActive !== undefined) project.isActive = input.isActive;

    if (input.hrIds !== undefined) {
      project.hrIds = input.hrIds as unknown as Types.ObjectId[];
    }

    if (input.employeeIds !== undefined || input.memberIds !== undefined) {
      const empIds =
        (input.employeeIds as unknown as Types.ObjectId[]) ||
        (input.memberIds as unknown as Types.ObjectId[]) ||
        [];
      project.employeeIds = empIds;
      project.memberIds = empIds;
    }

    await project.save();

    return projectRepository.findPopulatedById(project._id);
  },

  async remove(id: string): Promise<void> {
    const project = await projectRepository.deleteById(id);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    await Promise.all([
      userRepository.removeProjectFromAll(project._id),
      taskRepository.deleteByProject(project._id),
    ]);
  },
};
