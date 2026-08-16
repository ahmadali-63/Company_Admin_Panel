
import { ROLE } from "../../common/constants/roles.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import { containsId, sameId } from "../../common/utils/objectId.js";
import {
  buildPaginationMeta,
  resolvePagination,
} from "../../common/utils/pagination.js";
import { projectRepository } from "../project/project.repository.js";
import { buildProjectScopeFilter } from "../project/project.service.js";
import { userRepository } from "../user/user.repository.js";
import type { TaskAttrs } from "./task.model.js";
import { taskRepository } from "./task.repository.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "./task.schema.js";

/**
 * A task is visible when it belongs to a project the actor can see, or when
 * the actor created it / it is assigned to them.
 */
const buildTaskScopeFilter = async (
  actor: AuthenticatedUser,
): Promise<Filter<TaskAttrs>> => {
  if (actor.role === ROLE.ADMIN) return {};

  if (actor.role === ROLE.TEAM_MEMBER) {
    return { assignedTo: actor._id };
  }

  const projectIds = await projectRepository.findIds(
    buildProjectScopeFilter(actor),
  );

  return {
    $or: [
      { projectId: { $in: projectIds } },
      { assignedTo: actor._id },
      { createdBy: actor._id },
    ],
  };
};

export const taskService = {
  async create(actor: AuthenticatedUser, input: CreateTaskInput) {
    const project = await projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    // A non-admin may only create tasks inside a project they belong to.
    if (
      actor.role !== ROLE.ADMIN &&
      !containsId(project.hrIds, actor._id) &&
      !containsId(project.teamLeadIds, actor._id)
    ) {
      throw new ForbiddenError("You do not have access to this project.");
    }

    const assignedUser = await userRepository.findById(input.assignedTo);

    if (!assignedUser) {
      throw new NotFoundError("Assigned user not found.");
    }

    const isOnProject =
      containsId(project.memberIds, input.assignedTo) ||
      containsId(project.teamLeadIds, input.assignedTo) ||
      containsId(project.hrIds, input.assignedTo);

    if (!isOnProject) {
      throw new BadRequestError("User is not assigned to this project.");
    }

    const task = await taskRepository.create({
      title: input.title,
      description: input.description,
      projectId: project._id,
      assignedTo: assignedUser._id,
      createdBy: actor._id,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ?? null,
      completedAt: input.status === "completed" ? new Date() : null,
    });

    return taskRepository.findPopulatedById(task._id);
  },

  async list(actor: AuthenticatedUser, query: ListTasksQuery) {
    const scope = await buildTaskScopeFilter(actor);
    const filter: Filter<TaskAttrs> = { ...scope };

    if (query.projectId) filter.projectId = query.projectId;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    // A team member's own filter always wins over an `assignedTo` query param.
    if (actor.role === ROLE.TEAM_MEMBER) {
      filter.assignedTo = actor._id;
    }

    const pagination = resolvePagination(query);

    const [tasks, total] = await Promise.all([
      taskRepository.findMany(filter, pagination),
      taskRepository.count(filter),
    ]);

    return { tasks, pagination: buildPaginationMeta(total, pagination) };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);

    return taskRepository.findPopulatedById(id);
  },

  /** Throws unless the actor may read/modify this task. */
  async assertCanAccess(
    actor: AuthenticatedUser,
    task: Pick<TaskAttrs, "projectId" | "assignedTo" | "createdBy">,
  ): Promise<void> {
    if (actor.role === ROLE.ADMIN) return;

    if (
      sameId(task.assignedTo, actor._id) ||
      sameId(task.createdBy, actor._id)
    ) {
      return;
    }

    if (actor.role === ROLE.TEAM_MEMBER) {
      throw new ForbiddenError("You do not have access to this task.");
    }

    const project = await projectRepository.findById(task.projectId);

    const onProject =
      project !== null &&
      (containsId(project.hrIds, actor._id) ||
        containsId(project.teamLeadIds, actor._id));

    if (!onProject) {
      throw new ForbiddenError("You do not have access to this task.");
    }
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateTaskInput) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate;

    if (input.assignedTo !== undefined) {
      const assignedUser = await userRepository.findById(input.assignedTo);

      if (!assignedUser) {
        throw new NotFoundError("Assigned user not found.");
      }

      const project = await projectRepository.findById(task.projectId);

      const isOnProject =
        project !== null &&
        (containsId(project.memberIds, assignedUser._id) ||
          containsId(project.teamLeadIds, assignedUser._id) ||
          containsId(project.hrIds, assignedUser._id));

      if (!isOnProject) {
        throw new BadRequestError("User is not assigned to this project.");
      }

      task.assignedTo = assignedUser._id;
    }

    if (input.status !== undefined) {
      task.status = input.status;
      task.completedAt = input.status === "completed" ? new Date() : null;
    }

    await task.save();

    return taskRepository.findPopulatedById(task._id);
  },

  async remove(id: string): Promise<void> {
    const task = await taskRepository.deleteById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }
  },
};
