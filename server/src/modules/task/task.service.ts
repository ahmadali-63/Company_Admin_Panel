import type { Types } from "mongoose";

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
import { UserModel } from "../user/user.model.js";
import { NotificationModel } from "../notification/notification.model.js";
import { TaskModel, type TaskAttrs } from "./task.model.js";
import { taskRepository } from "./task.repository.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  AddTaskCommentInput,
} from "./task.schema.js";

const syncTaskOverdue = async (task: any) => {
  if (task.status !== "completed" && task.deadline && new Date() > new Date(task.deadline)) {
    if (task.status !== "overdue") {
      task.status = "overdue";
      await TaskModel.updateOne({ _id: task._id }, { $set: { status: "overdue" } });
    }
  }
};

const buildTaskScopeFilter = async (
  actor: AuthenticatedUser,
): Promise<Filter<TaskAttrs>> => {
  if (actor.role === ROLE.ADMIN) return {};

  if (actor.role === ROLE.EMPLOYEE) {
    return { assignedTo: actor._id as unknown as Types.ObjectId };
  }

  if (actor.role === ROLE.HR) {
    const managedEmployees = await UserModel.find({ hrId: actor._id }).select("_id").lean();
    const managedIds = managedEmployees.map((e) => e._id);
    const projectIds = await projectRepository.findIds(
      buildProjectScopeFilter(actor),
    );

    return {
      $or: [
        { assignedBy: actor._id as unknown as Types.ObjectId },
        { assignedTo: { $in: [...managedIds, actor._id] } as unknown as Types.ObjectId },
        { projectId: { $in: projectIds } as unknown as Types.ObjectId },
      ],
    };
  }

  return { assignedTo: actor._id as unknown as Types.ObjectId };
};

export const taskService = {
  async create(actor: AuthenticatedUser, input: CreateTaskInput) {
    if (actor.role === ROLE.EMPLOYEE) {
      throw new ForbiddenError("Employees cannot create or assign tasks.");
    }

    const assignedUser = await userRepository.findById(input.assignedTo);
    if (!assignedUser) {
      throw new NotFoundError("Assigned employee not found.");
    }

    let projectId: Types.ObjectId | null = null;
    if (input.projectId) {
      const project = await projectRepository.findById(input.projectId);
      if (!project) {
        throw new NotFoundError("Project not found.");
      }
      if (
        actor.role !== ROLE.ADMIN &&
        !containsId(project.hrIds, actor._id)
      ) {
        throw new ForbiddenError("You are not assigned to manage this project.");
      }
      projectId = project._id;
    }

    const deadline = input.deadline || input.dueDate;
    if (!deadline) {
      throw new BadRequestError("Deadline is required.");
    }

    const isOverdue = input.status !== "completed" && new Date() > new Date(deadline);

    const task = await taskRepository.create({
      title: input.title,
      description: input.description,
      projectId,
      assignedTo: assignedUser._id,
      assignedBy: actor._id as unknown as Types.ObjectId,
      createdBy: actor._id as unknown as Types.ObjectId,
      priority: input.priority,
      status: isOverdue ? "overdue" : input.status,
      deadline,
      dueDate: deadline,
      comments: [],
      completedAt: input.status === "completed" ? new Date() : null,
    });

    // Send notification to assigned user
    await NotificationModel.create({
      userId: assignedUser._id,
      title: "New Task Assigned",
      message: `You have been assigned task: "${input.title}" by ${actor.name}. Priority: ${input.priority.toUpperCase()}`,
      type: "task",
      isRead: false,
    });

    return taskRepository.findPopulatedById(task._id);
  },

  async list(actor: AuthenticatedUser, query: ListTasksQuery) {
    const scope = await buildTaskScopeFilter(actor);
    const filter: Filter<TaskAttrs> = { ...scope };

    if (query.projectId) filter.projectId = query.projectId as unknown as Types.ObjectId;
    if (query.assignedTo) filter.assignedTo = query.assignedTo as unknown as Types.ObjectId;
    if (query.assignedBy) filter.assignedBy = query.assignedBy as unknown as Types.ObjectId;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    const pagination = resolvePagination(query);

    const [tasks, total] = await Promise.all([
      taskRepository.findMany(filter, pagination),
      taskRepository.count(filter),
    ]);

    // Check and update overdue flags on fetched tasks
    tasks.forEach(syncTaskOverdue);

    return { tasks, pagination: buildPaginationMeta(total, pagination) };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);
    await syncTaskOverdue(task);

    return taskRepository.findPopulatedById(id);
  },

  async assertCanAccess(
    actor: AuthenticatedUser,
    task: Pick<TaskAttrs, "projectId" | "assignedTo" | "assignedBy" | "createdBy">,
  ): Promise<void> {
    if (actor.role === ROLE.ADMIN) return;

    if (
      sameId(task.assignedTo, actor._id) ||
      sameId(task.assignedBy, actor._id) ||
      sameId(task.createdBy, actor._id)
    ) {
      return;
    }

    if (actor.role === ROLE.EMPLOYEE) {
      throw new ForbiddenError("You do not have access to this task.");
    }

    if (actor.role === ROLE.HR) {
      const assignedEmployee = await UserModel.findById(task.assignedTo).lean();
      if (assignedEmployee?.hrId && sameId(assignedEmployee.hrId, actor._id)) {
        return;
      }
      if (task.projectId) {
        const project = await projectRepository.findById(task.projectId);
        if (project && containsId(project.hrIds, actor._id)) {
          return;
        }
      }
    }

    throw new ForbiddenError("You do not have access to this task.");
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateTaskInput) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    if (actor.role === ROLE.EMPLOYEE) {
      throw new ForbiddenError("Employees can only update task status or add comments.");
    }

    await taskService.assertCanAccess(actor, task);

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.deadline !== undefined || input.dueDate !== undefined) {
      const deadline = input.deadline || input.dueDate;
      task.deadline = deadline!;
      task.dueDate = deadline!;
    }

    if (input.projectId !== undefined) {
      task.projectId = (input.projectId as unknown as Types.ObjectId) || null;
    }

    if (input.assignedTo !== undefined) {
      const assignedUser = await userRepository.findById(input.assignedTo);
      if (!assignedUser) {
        throw new NotFoundError("Assigned user not found.");
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

  async updateStatus(actor: AuthenticatedUser, id: string, input: UpdateTaskStatusInput) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);

    task.status = input.status;
    if (input.status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    if (input.comment) {
      task.comments.push({
        text: input.comment,
        author: actor._id as unknown as Types.ObjectId,
        createdAt: new Date(),
      });
    }

    await task.save();

    // If employee completes or updates task, notify the assigner
    if (!sameId(task.assignedBy, actor._id)) {
      await NotificationModel.create({
        userId: task.assignedBy,
        title: "Task Status Updated",
        message: `${actor.name} updated task "${task.title}" to ${input.status.toUpperCase()}`,
        type: "task",
        isRead: false,
      });
    }

    return taskRepository.findPopulatedById(task._id);
  },

  async addComment(actor: AuthenticatedUser, id: string, input: AddTaskCommentInput) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);

    task.comments.push({
      text: input.text,
      author: actor._id as unknown as Types.ObjectId,
      createdAt: new Date(),
    });

    await task.save();

    return taskRepository.findPopulatedById(task._id);
  },

  async remove(actor: AuthenticatedUser, id: string): Promise<void> {
    if (actor.role === ROLE.EMPLOYEE) {
      throw new ForbiddenError("Employees cannot delete tasks.");
    }

    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found.");
    }

    await taskService.assertCanAccess(actor, task);

    await taskRepository.deleteById(id);
  },
};
