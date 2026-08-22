import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { app, authHeader, makeUser } from "./helpers.js";

describe("GET /api/stats/dashboard", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.status).toBe(401);
  });

  it("returns admin dashboard data with statistics", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });
    await makeUser({ role: ROLE.HR });
    await makeUser({ role: ROLE.EMPLOYEE });

    const res = await request(app)
      .get("/api/stats/dashboard")
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalEmployees).toBeDefined();
    expect(res.body.stats.totalHRs).toBeDefined();
  });

  it("returns employee dashboard data", async () => {
    const emp = await makeUser({ role: ROLE.EMPLOYEE });

    const res = await request(app)
      .get("/api/stats/dashboard")
      .set("Authorization", authHeader(emp));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.todayAttendance).toBeDefined();
  });
});
