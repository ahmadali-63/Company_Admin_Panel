import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { app, authHeader, makeUser } from "./helpers.js";

describe("Attendance System", () => {
  it("rejects Admin attempting to check in", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .post("/api/attendance/check-in")
      .set("Authorization", authHeader(admin))
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Admin does not require attendance");
  });

  it("allows Employee to check in and prevents duplicate check in on same day", async () => {
    const emp = await makeUser({ role: ROLE.EMPLOYEE });

    const checkInRes = await request(app)
      .post("/api/attendance/check-in")
      .set("Authorization", authHeader(emp))
      .send({ notes: "Morning" });

    expect(checkInRes.status).toBe(201);
    expect(checkInRes.body.success).toBe(true);
    expect(checkInRes.body.data.checkIn).toBeDefined();

    // Second check in on same day should be rejected
    const dupeRes = await request(app)
      .post("/api/attendance/check-in")
      .set("Authorization", authHeader(emp))
      .send({});

    expect(dupeRes.status).toBe(400);
    expect(dupeRes.body.message).toContain("already checked in today");
  });

  it("allows Employee to check out after check in", async () => {
    const emp = await makeUser({ role: ROLE.EMPLOYEE });

    await request(app)
      .post("/api/attendance/check-in")
      .set("Authorization", authHeader(emp))
      .send({});

    const checkOutRes = await request(app)
      .post("/api/attendance/check-out")
      .set("Authorization", authHeader(emp))
      .send({ notes: "Leaving" });

    expect(checkOutRes.status).toBe(200);
    expect(checkOutRes.body.success).toBe(true);
    expect(checkOutRes.body.data.checkOut).toBeDefined();
    expect(checkOutRes.body.data.workingHours).toBeDefined();
  });
});
