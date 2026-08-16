import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { TaskModel } from "../src/modules/task/task.model.js";
import { app, authHeader, makeProject, makeUser } from "./helpers.js";

describe("GET /api/stats", () => {
  it("returns the stats/charts/recentActivity envelope", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, {
      status: "active",
      hrIds: [hr._id],
      memberIds: [member._id],
    });

    await TaskModel.create({
      title: "Counted",
      projectId: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
      status: "in_progress",
    });

    const res = await request(app)
      .get("/api/stats")
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.stats).toMatchObject({
      totalEmployees: 3,
      totalHRs: 1,
      totalTeamMembers: 1,
      totalAdmins: 1,
      totalProjects: 1,
      activeProjects: 1,
      totalTasks: 1,
      inProgressTasks: 1,
      pendingTasks: 0,
    });

    expect(res.body.charts.employeesByRole).toHaveLength(4);
    expect(res.body.charts.projectsByStatus).toHaveLength(5);
    expect(res.body.charts.taskStatusDistribution).toHaveLength(4);
    expect(Array.isArray(res.body.recentActivity)).toBe(true);
  });

  it("scopes a team member to their own numbers", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const other = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, {
      memberIds: [member._id, other._id],
    });

    await TaskModel.create([
      {
        title: "Mine",
        projectId: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
      },
      {
        title: "Theirs",
        projectId: project._id,
        assignedTo: other._id,
        createdBy: admin._id,
      },
    ]);

    const res = await request(app)
      .get("/api/stats")
      .set("Authorization", authHeader(member));

    expect(res.body.stats.totalTasks).toBe(1);
    expect(res.body.stats.totalEmployees).toBe(1);
  });
});

describe("GET /health", () => {
  it("reports the database connection", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.database).toBe("connected");
  });
});

describe("unknown routes", () => {
  it("returns a 404 envelope", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
