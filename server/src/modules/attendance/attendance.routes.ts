import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { attendanceController } from "./attendance.controller.js";
import {
  checkInSchema,
  checkOutSchema,
  listAttendanceQuerySchema,
} from "./attendance.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/check-in",
  validate({ body: checkInSchema }),
  asyncHandler(attendanceController.checkIn),
);

router.post(
  "/check-out",
  validate({ body: checkOutSchema }),
  asyncHandler(attendanceController.checkOut),
);

router.get("/me", asyncHandler(attendanceController.getMyTodayStatus));

router.get(
  "/",
  validate({ query: listAttendanceQuerySchema }),
  asyncHandler(attendanceController.list),
);

router.get(
  "/:userId",
  validate({ query: listAttendanceQuerySchema }),
  asyncHandler(attendanceController.getByUserId),
);

export const attendanceRoutes = router;
