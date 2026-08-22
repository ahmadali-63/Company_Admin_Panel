import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { app, authHeader, makeProject, makeUser } from "./helpers.js";

describe("POST /api/projects", () => {
  it("allows only admins to create projects", async () => {
    const hr = await makeUser({ role: ROLE.HR });

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", authHeader(hr))
      .send({ name: "Rogue", code: "ROGUE" });

    expect(res.status).toBe(403);
  });

  it("creates a project for an admin", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", authHeader(admin))
      .send({ name: "Core", code: "CORE" });

    expect(res.status).toBe(201);
    expect(res.body.project.code).toBe("CORE");
  });
});

describe("GET /api/projects", () => {
  it("shows an employee only their assigned projects", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const emp = await makeUser({ role: ROLE.EMPLOYEE });

    await makeProject(admin, { employeeIds: [emp._id] });
    await makeProject(admin);

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", authHeader(emp));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });
});
