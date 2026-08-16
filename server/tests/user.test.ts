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
        name: "New",
        email: "new@example.com",
        password: "Password123!",
        role: ROLE.TEAM_MEMBER,
      });

    expect(res.status).toBe(403);
  });

  it("requires a team lead to hang off an HR", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(admin))
      .send({
        name: "Lead",
        email: "lead@example.com",
        password: "Password123!",
        role: ROLE.TEAM_LEAD,
      });

    expect(res.status).toBe(400);
  });

  it("gives a team member the HR of its team lead", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const hr = await makeUser({ role: ROLE.HR });
    const lead = await makeUser({ role: ROLE.TEAM_LEAD, hrId: hr._id });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(admin))
      .send({
        name: "Member",
        email: "member@example.com",
        password: "Password123!",
        role: ROLE.TEAM_MEMBER,
        teamLeadId: lead._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(String(res.body.user.hrId._id ?? res.body.user.hrId)).toBe(
      hr._id.toString(),
    );
  });
});

describe("GET /api/users", () => {
  it("scopes an HR to itself and its reports", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    await makeUser({ role: ROLE.TEAM_LEAD, hrId: hr._id });
    await makeUser({ role: ROLE.TEAM_MEMBER });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(hr));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it("keeps the search filter inside the caller's scope", async () => {
    const hr = await makeUser({ role: ROLE.HR, name: "Ada" });
    await makeUser({ role: ROLE.TEAM_LEAD, hrId: hr._id, name: "Ada Junior" });
    await makeUser({ role: ROLE.TEAM_MEMBER, name: "Ada Outsider" });

    const res = await request(app)
      .get("/api/users?search=Ada")
      .set("Authorization", authHeader(hr));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it("returns every user unpaginated by default", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    await Promise.all(Array.from({ length: 25 }, () => makeUser()));

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(admin));

    expect(res.body.users).toHaveLength(26);
  });

  it("paginates when asked", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    await Promise.all(Array.from({ length: 25 }, () => makeUser()));

    const res = await request(app)
      .get("/api/users?page=2&limit=10")
      .set("Authorization", authHeader(admin));

    expect(res.body.users).toHaveLength(10);
    expect(res.body.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 26,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});

describe("GET /api/users/:id", () => {
  it("refuses an HR reading a user outside its scope", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    const stranger = await makeUser({ role: ROLE.TEAM_MEMBER });

    const res = await request(app)
      .get(`/api/users/${stranger._id.toString()}`)
      .set("Authorization", authHeader(hr));

    expect(res.status).toBe(403);
  });

  it("rejects a malformed id with 400", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .get("/api/users/not-an-id")
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/users/:id", () => {
  it("refuses self-deletion", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .delete(`/api/users/${admin._id.toString()}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/users/:id", () => {
  it("hashes a new password exactly once", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    const target = await makeUser({ email: "pw@example.com" });

    const res = await request(app)
      .put(`/api/users/${target._id.toString()}`)
      .set("Authorization", authHeader(admin))
      .send({ password: "BrandNew123!" });

    expect(res.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "pw@example.com", password: "BrandNew123!" });

    expect(login.status).toBe(200);
  });
});
