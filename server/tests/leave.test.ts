import request from "supertest";
import { describe, expect, it } from "vitest";

import { ROLE } from "../src/common/constants/roles.js";
import { app, authHeader, makeUser } from "./helpers.js";

describe("Leave Management System", () => {
  it("rejects Admin applying for leave", async () => {
    const admin = await makeUser({ role: ROLE.ADMIN });

    const res = await request(app)
      .post("/api/leaves")
      .set("Authorization", authHeader(admin))
      .send({
        leaveType: "annual",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        reason: "Taking off",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Admin does not submit leave requests");
  });

  it("allows Employee to apply for leave and HR to approve it", async () => {
    const hr = await makeUser({ role: ROLE.HR });
    const emp = await makeUser({ role: ROLE.EMPLOYEE, hrId: hr._id });

    const applyRes = await request(app)
      .post("/api/leaves")
      .set("Authorization", authHeader(emp))
      .send({
        leaveType: "sick",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        reason: "Doctor appointment",
      });

    expect(applyRes.status).toBe(201);
    const leaveId = applyRes.body.data._id;

    const approveRes = await request(app)
      .patch(`/api/leaves/${leaveId}/approve`)
      .set("Authorization", authHeader(hr))
      .send({ responseComment: "Approved. Get well soon." });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("approved");
  });
});
