import { Router } from "express";
import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { attendanceController } from "./attendance.controller.js";
import { createAttendanceSchema, listAttendanceQuerySchema } from "./attendance.schema.js";
import { ROUTES } from "../../common/constants/routes.js";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  validate({ body: createAttendanceSchema }),
  asyncHandler(attendanceController.checkIn),
);

router.post(
  ROUTES.ATTENDANCE.CHECK_OUT,
  asyncHandler(attendanceController.checkOut),
);

router.get(
  ROUTES.ATTENDANCE.TODAY_STATUS,
  asyncHandler(attendanceController.getTodayStatus),
);

router.get(
  ROUTES.ATTENDANCE.MY_ATTENDANCE,
  asyncHandler(attendanceController.getMyAttendance),
);

router.get(
  ROUTES.ATTENDANCE.ALL,
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ query: listAttendanceQuerySchema }),
  asyncHandler(attendanceController.getAllAttendance),
);
//TODO: Add pagination in upcoming days.

export const attendanceRoutes = router;
