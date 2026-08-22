import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { TaskModel } from "../src/modules/task/task.model.js";
import { app, authHeader, makeProject, makeUser } from "./helpers.js";

describe("POST /api/tasks", () => {
  it("rejects employees creating tasks", async () => {
    const emp = await makeUser({ role: ROLE.EMPLOYEE });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(emp))
      .send({
        title: "Employee Task",
        assignedTo: emp._id.toString(),
        deadline: new Date(),
      });

    expect(res.status).toBe(403);
  });

  it("allows HR to create task for an employee", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    const emp = await makeUser({ role: ROLE.EMPLOYEE, hrId: hr._id });
    const admin = await makeUser({ role: ROLE.ADMIN });
    const project = await makeProject(admin, { hrIds: [hr._id], employeeIds: [emp._id] });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", authHeader(hr))
      .send({
        title: "Build Feature",
        projectId: project._id.toString(),
        assignedTo: emp._id.toString(),
        deadline: new Date(Date.now() + 86400000),
        priority: "high",
      });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Build Feature");
  });
});

describe("PATCH /api/tasks/:id/status", () => {
  it("allows assigned employee to update status", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    const emp = await makeUser({ role: ROLE.EMPLOYEE, hrId: hr._id });

    const task = await TaskModel.create({
      title: "Fix bug",
      assignedTo: emp._id,
      assignedBy: hr._id,
      createdBy: hr._id,
      deadline: new Date(Date.now() + 86400000),
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/tasks/${task._id.toString()}/status`)
      .set("Authorization", authHeader(emp))
      .send({
        status: "in_progress",
        comment: "Started working on the bug",
      });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("in_progress");
  });
});
