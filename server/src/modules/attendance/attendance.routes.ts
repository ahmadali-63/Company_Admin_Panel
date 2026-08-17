import { Router } from "express";
import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { attendanceController } from "./attendance.controller.js";
import { createAttendanceSchema, listAttendanceQuerySchema } from "./attendance.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  validate({ body: createAttendanceSchema }),
  asyncHandler(attendanceController.checkIn),
);

router.post(
  "/check-out",
  asyncHandler(attendanceController.checkOut),
);

router.get(
  "/today",
  asyncHandler(attendanceController.getTodayStatus),
);

router.get(
  "/my-attendance",
  asyncHandler(attendanceController.getMyAttendance),
);

router.get(
  "/all",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ query: listAttendanceQuerySchema }),
  asyncHandler(attendanceController.getAllAttendance),
);

export const attendanceRoutes = router;
