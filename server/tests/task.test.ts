import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { TaskModel } from "../src/modules/task/task.model.js";
import { app, authHeader, makeProject, makeUser } from "./helpers.js";

describe("POST /api/tasks", () => {
  it("refuses to assign someone who is not on the project", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const outsider = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin);

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(admin))
      .send({
        title: "Build",
        projectId: project._id.toString(),
        assignedTo: outsider._id.toString(),
      });

    expect(res.status).toBe(400);
  });

  it("refuses a team lead creating a task in a project they are not on", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });
    const lead = await makeUser({ role: ROLE.TEAM_LEAD, hrId: hr._id });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(lead))
      .send({
        title: "Sneaky",
        projectId: project._id.toString(),
        assignedTo: member._id.toString(),
      });

    expect(res.status).toBe(403);
  });

  it("creates a task for a project member", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(admin))
      .send({
        title: "  Build the thing  ",
        projectId: project._id.toString(),
        assignedTo: member._id.toString(),
        priority: "high",
      });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Build the thing");
    expect(res.body.task.status).toBe("pending");
  });

  it("rejects an unknown priority", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(admin))
      .send({
        title: "Bad priority",
        projectId: project._id.toString(),
        assignedTo: member._id.toString(),
        priority: "catastrophic",
      });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/tasks/:id", () => {
  it("blocks a team member reading someone else's task", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const owner = await makeUser({ role: ROLE.TEAM_MEMBER });
    const snooper = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, {
      memberIds: [owner._id, snooper._id],
    });

    const task = await TaskModel.create({
      title: "Private",
      projectId: project._id,
      assignedTo: owner._id,
      createdBy: admin._id,
    });

    const res = await request(app)
      .get(`/api/tasks/${task._id.toString()}`)
      .set("Authorization", authHeader(snooper));

    expect(res.status).toBe(403);
  });
});

describe("GET /api/tasks", () => {
  it("only ever shows a team member their own tasks", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const owner = await makeUser({ role: ROLE.TEAM_MEMBER });
    const other = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, {
      memberIds: [owner._id, other._id],
    });

    await TaskModel.create([
      {
        title: "Mine",
        projectId: project._id,
        assignedTo: owner._id,
        createdBy: admin._id,
      },
      {
        title: "Theirs",
        projectId: project._id,
        assignedTo: other._id,
        createdBy: admin._id,
      },
    ]);

    // Even asking for the other user's tasks explicitly returns only its own.
    const res = await request(app)
      .get(`/api/tasks?assignedTo=${other._id.toString()}`)
      .set("Authorization", authHeader(owner));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.tasks[0].title).toBe("Mine");
  });
});

describe("PUT /api/tasks/:id", () => {
  it("stamps completedAt on completion and clears it on reopen", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    const task = await TaskModel.create({
      title: "Track me",
      projectId: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
    });

    const done = await request(app)
      .put(`/api/tasks/${task._id.toString()}`)
      .set("Authorization", authHeader(admin))
      .send({ status: "completed" });

    expect(done.body.task.completedAt).not.toBeNull();

    const reopened = await request(app)
      .put(`/api/tasks/${task._id.toString()}`)
      .set("Authorization", authHeader(admin))
      .send({ status: "in_progress" });

    expect(reopened.body.task.completedAt).toBeNull();
  });
});
