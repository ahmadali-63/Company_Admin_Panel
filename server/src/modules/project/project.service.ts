
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
import {
  projectRepository,
  type ProjectRole,
} from "./project.repository.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "./project.schema.js";

/** Which project list each role is allowed to see. */
export const buildProjectScopeFilter = (
  actor: AuthenticatedUser,
): Filter<ProjectAttrs> => {
  switch (actor.role) {
    case ROLE.ADMIN:
      return {};
    case ROLE.HR:
      return { hrIds: actor._id };
    case ROLE.TEAM_LEAD:
      return { teamLeadIds: actor._id };
    default:
      return { memberIds: actor._id };
  }
};

interface AssignmentSpec {
  field: ProjectRole;
  requiredRole: Role;
  label: string;
  assignedMessage: string;
  removedMessage: string;
}

const ASSIGNMENTS = {
  hr: {
    field: "hrIds",
    requiredRole: ROLE.HR,
    label: "HR",
    assignedMessage: SUCCESS_MESSAGES.HR_ASSIGNED,
    removedMessage: SUCCESS_MESSAGES.HR_REMOVED,
  },
  teamLead: {
    field: "teamLeadIds",
    requiredRole: ROLE.TEAM_LEAD,
    label: "Team Lead",
    assignedMessage: SUCCESS_MESSAGES.TEAM_LEAD_ASSIGNED,
    removedMessage: SUCCESS_MESSAGES.TEAM_LEAD_REMOVED,
  },
  member: {
    field: "memberIds",
    requiredRole: ROLE.TEAM_MEMBER,
    label: "Team Member",
    assignedMessage: SUCCESS_MESSAGES.MEMBER_ASSIGNED,
    removedMessage: SUCCESS_MESSAGES.MEMBER_REMOVED,
  },
} as const satisfies Record<string, AssignmentSpec>;

export type AssignmentKind = keyof typeof ASSIGNMENTS;

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

    const project = await projectRepository.create({
      name: input.name,
      code: input.code,
      description: input.description,
      status: input.status,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      createdBy: actor._id,
      hrIds: [],
      teamLeadIds: [],
      memberIds: [],
      isActive: true,
    });

    return projectRepository.findPopulatedById(project._id);
  },

  async list(actor: AuthenticatedUser, query: ListProjectsQuery) {
    const filter: Filter<ProjectAttrs> = buildProjectScopeFilter(actor);

    if (query.status) filter.status = query.status;

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { code: { $regex: query.search, $options: "i" } },
      ];
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

  /**
   * Membership check against the already-loaded document, so we don't pay for
   * a second query. Populated arrays hold objects with `_id`, which
   * `containsId` handles via `toString()`.
   */
  canView(actor: AuthenticatedUser, project: ProjectAttrs): boolean {
    if (actor.role === ROLE.ADMIN) return true;

    return (
      containsId(project.hrIds, actor._id) ||
      containsId(project.teamLeadIds, actor._id) ||
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

    await project.save();

    return projectRepository.findPopulatedById(project._id);
  },

  async assign(kind: AssignmentKind, projectId: string, userId: string) {
    const spec = ASSIGNMENTS[kind];
    const project = await loadProject(projectId);
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`${spec.label} not found.`);
    }

    if (user.role !== spec.requiredRole) {
      throw new ConflictError(
        `Selected user is not ${spec.label === "HR" ? "an" : "a"} ${spec.label}.`,
      );
    }

    if (!user.isActive) {
      throw new ConflictError("Cannot assign inactive user.");
    }

    if (containsId(project[spec.field], user._id)) {
      throw new ConflictError(
        `This ${spec.label} is already assigned to this project.`,
      );
    }

    // Keep both sides of the many-to-many in sync.
    await Promise.all([
      projectRepository.addAssignee(project._id, spec.field, user._id),
      userRepository.addProject(user._id, project._id),
    ]);

    return {
      message: spec.assignedMessage,
      project: await projectRepository.findPopulatedById(project._id),
    };
  },

  async unassign(kind: AssignmentKind, projectId: string, userId: string) {
    const spec = ASSIGNMENTS[kind];
    const project = await loadProject(projectId);
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`${spec.label} not found.`);
    }

    await Promise.all([
      projectRepository.removeAssignee(project._id, spec.field, user._id),
      userRepository.removeProject(user._id, project._id),
    ]);

    return {
      message: spec.removedMessage,
      project: await projectRepository.findPopulatedById(project._id),
    };
  },

  async remove(id: string): Promise<void> {
    const project = await projectRepository.deleteById(id);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    // Cascade: drop the project from every user, and delete its tasks so no
    // task is left pointing at a project that no longer exists.
    await Promise.all([
      userRepository.removeProjectFromAll(project._id),
      taskRepository.deleteByProject(project._id),
    ]);
  },
};
