import type { PipelineStage, Types } from "mongoose";

import { ROLE } from "../../common/constants/roles.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import type { ProjectAttrs } from "../project/project.model.js";
import { projectRepository } from "../project/project.repository.js";
import { buildProjectScopeFilter } from "../project/project.service.js";
import type { TaskAttrs } from "../task/task.model.js";
import { taskRepository } from "../task/task.repository.js";
import type { UserAttrs } from "../user/user.model.js";
import { userRepository } from "../user/user.repository.js";
import { buildUserScopeFilter } from "../user/user.service.js";

interface Bucket {
  _id: string | null;
  count: number;
}

/** `$facet`: one round trip returns the total plus every per-value bucket. */
const countByFieldPipeline = (
  filter: Filter<unknown>,
  field: string,
): PipelineStage[] => [
  { $match: filter },
  {
    $facet: {
      total: [{ $count: "value" }],
      buckets: [{ $group: { _id: `$${field}`, count: { $sum: 1 } } }],
    },
  },
];

interface FacetResult {
  total: { value: number }[];
  buckets: Bucket[];
}

const readFacet = (result: FacetResult[] | undefined) => {
  const first = result?.[0];
  const total = first?.total?.[0]?.value ?? 0;
  const byKey = new Map<string, number>();

  for (const bucket of first?.buckets ?? []) {
    if (bucket._id !== null) byKey.set(String(bucket._id), bucket.count);
  }

  return {
    total,
    get: (key: string) => byKey.get(key) ?? 0,
  };
};

interface ActivityItem {
  id: string;
  type: "user" | "project" | "task";
  title: string;
  description: string;
  timestamp: Date;
}

interface Scopes {
  userFilter: Filter<UserAttrs>;
  projectFilter: Filter<ProjectAttrs>;
  taskFilter: Filter<TaskAttrs>;
}

const buildScopes = async (actor: AuthenticatedUser): Promise<Scopes> => {
  const userFilter = buildUserScopeFilter(actor);
  const projectFilter = buildProjectScopeFilter(actor);

  if (actor.role === ROLE.ADMIN) {
    return { userFilter: {}, projectFilter: {}, taskFilter: {} };
  }

  if (actor.role === ROLE.TEAM_MEMBER) {
    return { userFilter, projectFilter, taskFilter: { assignedTo: actor._id } };
  }

  const projectIds: Types.ObjectId[] =
    await projectRepository.findIds(projectFilter);

  const taskFilter: Filter<TaskAttrs> =
    actor.role === ROLE.HR
      ? { $or: [{ projectId: { $in: projectIds } }, { createdBy: actor._id }] }
      : {
          $or: [
            { projectId: { $in: projectIds } },
            { assignedTo: actor._id },
            { createdBy: actor._id },
          ],
        };

  return { userFilter, projectFilter, taskFilter };
};

export const statsService = {
  async dashboard(actor: AuthenticatedUser) {
    const { userFilter, projectFilter, taskFilter } = await buildScopes(actor);

    const [
      userFacet,
      projectFacet,
      taskFacet,
      recentUsers,
      recentProjects,
      recentTasks,
    ] = await Promise.all([
      userRepository.model
        .aggregate<FacetResult>(countByFieldPipeline(userFilter, "role"))
        .exec(),
      projectRepository.model
        .aggregate<FacetResult>(countByFieldPipeline(projectFilter, "status"))
        .exec(),
      taskRepository.model
        .aggregate<FacetResult>(countByFieldPipeline(taskFilter, "status"))
        .exec(),
      userRepository.model
        .find(userFilter)
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      projectRepository.model
        .find(projectFilter)
        .select("name code status createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
      taskRepository.model
        .find(taskFilter)
        .select("title status priority createdAt completedAt")
        .populate("assignedTo", "name")
        .populate("projectId", "name")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean()
        .exec(),
    ]);

    const users = readFacet(userFacet);
    const projects = readFacet(projectFacet);
    const tasks = readFacet(taskFacet);

    const totalHRs = users.get(ROLE.HR);
    const totalTeamLeads = users.get(ROLE.TEAM_LEAD);
    const totalTeamMembers = users.get(ROLE.TEAM_MEMBER);
    const totalAdmins = users.get(ROLE.ADMIN);

    const planningProjects = projects.get("planning");
    const activeProjects = projects.get("active");
    const onHoldProjects = projects.get("on_hold");
    const completedProjects = projects.get("completed");
    const cancelledProjects = projects.get("cancelled");

    const pendingTasks = tasks.get("pending");
    const inProgressTasks = tasks.get("in_progress");
    const completedTasks = tasks.get("completed");
    const cancelledTasks = tasks.get("cancelled");

    const activities: ActivityItem[] = [];

    for (const user of recentUsers) {
      activities.push({
        id: `user-${String(user._id)}`,
        type: "user",
        title: "New Employee Joined",
        description: `${user.name} (${user.role.replace("_", " ").toUpperCase()}) registered`,
        timestamp: user.createdAt,
      });
    }

    for (const project of recentProjects) {
      activities.push({
        id: `proj-${String(project._id)}`,
        type: "project",
        title: "Project Milestone",
        description: `Project ${project.name} [${project.code}] is ${project.status.replace("_", " ")}`,
        timestamp: project.createdAt,
      });
    }

    for (const task of recentTasks) {
      const assignee = task.assignedTo as unknown as { name?: string } | null;

      activities.push({
        id: `task-${String(task._id)}`,
        type: "task",
        title: task.status === "completed" ? "Task Completed" : "Task Updated",
        description: `Task "${task.title}" for ${assignee?.name ?? "Member"} is ${task.status}`,
        timestamp: task.completedAt ?? task.createdAt,
      });
    }

    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return {
      stats: {
        totalEmployees: users.total,
        totalHRs,
        totalTeamLeads,
        totalTeamMembers,
        totalAdmins,
        totalProjects: projects.total,
        activeProjects,
        completedProjects,
        planningProjects,
        onHoldProjects,
        cancelledProjects,
        totalTasks: tasks.total,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
      },
      charts: {
        employeesByRole: [
          { name: "HRs", value: totalHRs },
          { name: "Team Leads", value: totalTeamLeads },
          { name: "Team Members", value: totalTeamMembers },
          { name: "Admins", value: totalAdmins },
        ],
        projectsByStatus: [
          { name: "Planning", value: planningProjects },
          { name: "Active", value: activeProjects },
          { name: "On Hold", value: onHoldProjects },
          { name: "Completed", value: completedProjects },
          { name: "Cancelled", value: cancelledProjects },
        ],
        taskStatusDistribution: [
          { name: "Pending", value: pendingTasks },
          { name: "In Progress", value: inProgressTasks },
          { name: "Completed", value: completedTasks },
          { name: "Cancelled", value: cancelledTasks },
        ],
      },
      recentActivity: activities.slice(0, 10),
    };
  },
};
