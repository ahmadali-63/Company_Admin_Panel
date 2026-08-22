import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { app, authHeader, makeUser } from "./helpers.js";

describe("POST /api/users", () => {
  it("is admin-only", async () => {
    const hr = await makeUser({ role: ROLE.HR });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(hr))
      .send({
        name: "New Employee",
        email: "newemp@example.com",
        password: "Password123!",
        role: ROLE.EMPLOYEE,
      });

    expect(res.status).toBe(403);
  });

  it("prevents creating another Admin", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(admin))
      .send({
        name: "Second Admin",
        email: "secondadmin@example.com",
        password: "Password123!",
        role: ROLE.ADMIN,
      });

    expect(res.status).toBe(403);
  });

  it("creates employee assigned to an HR", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(admin))
      .send({
        name: "Member",
        email: "member@example.com",
        password: "Password123!",
        role: ROLE.EMPLOYEE,
        hrId: hr._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe(ROLE.EMPLOYEE);
  });
});

describe("GET /api/users", () => {
  it("scopes an HR to itself and its reports", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    await makeUser({ role: ROLE.EMPLOYEE, hrId: hr._id });
    await makeUser({ role: ROLE.EMPLOYEE });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(hr));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});

describe("GET /api/users/:id", () => {
  it("refuses an HR reading an employee outside its scope", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    const stranger = await makeUser({ role: ROLE.EMPLOYEE });

    const res = await request(app)
      .get(`/api/users/${stranger._id.toString()}`)
      .set("Authorization", authHeader(hr));

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/users/:id", () => {
  it("refuses admin deletion", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .delete(`/api/users/${admin._id.toString()}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(400);
  });
});
