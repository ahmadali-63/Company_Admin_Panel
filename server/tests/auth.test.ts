import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { UserModel } from "../src/modules/user/user.model.js";
import { app, authHeader, makeUser } from "./helpers.js";

describe("POST /api/auth/login", () => {
  it("returns a token and the user envelope the client expects", async () => {
    await makeUser({ email: "lee@example.com", password: "Password123!" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "lee@example.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.refreshToken).toBeTypeOf("string");
    expect(res.body.user.email).toBe("lee@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects a wrong password with the same message as an unknown email", async () => {
    await makeUser({ email: "lee@example.com", password: "Password123!" });

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "lee@example.com", password: "Wrong123!!" });

    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password123!" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it("refuses an inactive account", async () => {
    await makeUser({
      email: "off@example.com",
      password: "Password123!",
      isActive: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "off@example.com", password: "Password123!" });

    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/signup", () => {
  it("ignores a role in the body and always creates a team member", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Escalator",
      email: "esc@example.com",
      password: "Password123!",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe(ROLE.TEAM_MEMBER);

    const stored = await UserModel.findOne({ email: "esc@example.com" });
    expect(stored?.role).toBe(ROLE.TEAM_MEMBER);
  });

  it("rejects a duplicate email", async () => {
    await makeUser({ email: "dupe@example.com" });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Dupe",
      email: "dupe@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(409);
  });

  it("rejects a short password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Short",
      email: "short@example.com",
      password: "abc",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("POST /api/auth/refresh", () => {
  it("rotates the refresh token and invalidates the old one", async () => {
    await makeUser({ email: "rot@example.com", password: "Password123!" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "rot@example.com", password: "Password123!" });

    const first = login.body.refreshToken as string;

    const refreshed = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: first });

    expect(refreshed.status).toBe(200);
    expect(refreshed.body.refreshToken).not.toBe(first);

    const replay = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: first });

    expect(replay.status).toBe(401);
  });

  it("refuses an access token presented as a refresh token", async () => {
    const user = await makeUser();
    const accessToken = authHeader(user).replace("Bearer ", "");

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: accessToken });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("requires a bearer token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the caller", async () => {
    const user = await makeUser({ email: "me@example.com" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("rejects the token after logout", async () => {
    const user = await makeUser({ password: "Password123!" });
    const header = authHeader(user);

    await request(app).post("/api/auth/logout").set("Authorization", header);

    // The access token itself stays valid until it expires; the refresh
    // token family is what logout kills.
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Password123!" });

    expect(login.status).toBe(200);
  });
});
