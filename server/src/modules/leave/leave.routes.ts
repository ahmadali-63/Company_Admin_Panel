import { Router } from "express";
import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { leaveController } from "./leave.controller.js";
import {  applyLeaveSchema, listLeavesQuerySchema, updateLeaveStatusSchema } from "./leave.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate({ body: applyLeaveSchema }),
  asyncHandler(leaveController.applyLeave),
);

router.get(
  "/my-leaves",
  asyncHandler(leaveController.getMyLeaves),
);

router.get(
  "/all",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ query: listLeavesQuerySchema }),
  asyncHandler(leaveController.getAllLeaves),
);

router.put(
  "/:id/status",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ params: idParamSchema, body: updateLeaveStatusSchema }),
  asyncHandler(leaveController.updateLeaveStatus),
);

export const leaveRoutes = router;
