import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { ProjectModel } from "../src/modules/project/project.model.js";
import { TaskModel } from "../src/modules/task/task.model.js";
import { UserModel } from "../src/modules/user/user.model.js";
import { app, authHeader, makeProject, makeUser } from "./helpers.js";

describe("POST /api/projects", () => {
  it("uppercases the code and rejects a duplicate", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const first = await request(app)
      .post("/api/projects")
      .set("Authorization", authHeader(admin))
      .send({ name: "Apollo", code: "apollo" });

    expect(first.status).toBe(201);
    expect(first.body.project.code).toBe("APOLLO");

    const second = await request(app)
      .post("/api/projects")
      .set("Authorization", authHeader(admin))
      .send({ name: "Apollo II", code: "APOLLO" });

    expect(second.status).toBe(409);
  });
});

describe("GET /api/projects/:id", () => {
  it("blocks a member who is not on the project", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const outsider = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin);

    const res = await request(app)
      .get(`/api/projects/${project._id.toString()}`)
      .set("Authorization", authHeader(outsider));

    expect(res.status).toBe(403);
  });

  it("allows a member who is on the project", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    const res = await request(app)
      .get(`/api/projects/${project._id.toString()}`)
      .set("Authorization", authHeader(member));

    expect(res.status).toBe(200);
  });
});

describe("project assignment", () => {
  it("writes both sides of the relation and refuses a wrong role", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin);
    const projectId = project._id.toString();

    const wrongRole = await request(app)
      .post(`/api/projects/${projectId}/hr`)
      .set("Authorization", authHeader(admin))
      .send({ hrId: member._id.toString() });

    expect(wrongRole.status).toBe(409);

    const ok = await request(app)
      .post(`/api/projects/${projectId}/hr`)
      .set("Authorization", authHeader(admin))
      .send({ hrId: hr._id.toString() });

    expect(ok.status).toBe(200);

    const stored = await UserModel.findById(hr._id);
    expect(stored?.projectIds.map(String)).toContain(projectId);

    const duplicate = await request(app)
      .post(`/api/projects/${projectId}/hr`)
      .set("Authorization", authHeader(admin))
      .send({ hrId: hr._id.toString() });

    expect(duplicate.status).toBe(409);
  });

  it("removes both sides on unassign", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });
    const project = await makeProject(admin, { hrIds: [hr._id] });
    const projectId = project._id.toString();

    await UserModel.updateOne(
      { _id: hr._id },
      { $addToSet: { projectIds: project._id } },
    );

    const res = await request(app)
      .delete(`/api/projects/${projectId}/hr`)
      .set("Authorization", authHeader(admin))
      .send({ hrId: hr._id.toString() });

    expect(res.status).toBe(200);

    const storedUser = await UserModel.findById(hr._id);
    const storedProject = await ProjectModel.findById(project._id);

    expect(storedUser?.projectIds.map(String)).not.toContain(projectId);
    expect(storedProject?.hrIds.map(String)).not.toContain(hr._id.toString());
  });
});

describe("DELETE /api/projects/:id", () => {
  it("cascades to user references and tasks", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const member = await makeUser({ role: ROLE.TEAM_MEMBER });
    const project = await makeProject(admin, { memberIds: [member._id] });

    await UserModel.updateOne(
      { _id: member._id },
      { $addToSet: { projectIds: project._id } },
    );

    await TaskModel.create({
      title: "Doomed",
      projectId: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
    });

    const res = await request(app)
      .delete(`/api/projects/${project._id.toString()}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);

    const storedUser = await UserModel.findById(member._id);
    expect(storedUser?.projectIds).toHaveLength(0);
    expect(await TaskModel.countDocuments({ projectId: project._id })).toBe(0);
  });
});
