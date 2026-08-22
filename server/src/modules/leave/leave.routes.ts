import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { leaveController } from "./leave.controller.js";
import {
  createLeaveSchema,
  listLeavesQuerySchema,
  respondLeaveSchema,
} from "./leave.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate({ body: createLeaveSchema }),
  asyncHandler(leaveController.apply),
);

router.get(
  "/",
  validate({ query: listLeavesQuerySchema }),
  asyncHandler(leaveController.list),
);

router.get(
  "/my",
  validate({ query: listLeavesQuerySchema }),
  asyncHandler(leaveController.getMyLeaves),
);

router.patch(
  "/:id/approve",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema, body: respondLeaveSchema }),
  asyncHandler(leaveController.approve),
);

router.patch(
  "/:id/reject",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema, body: respondLeaveSchema }),
  asyncHandler(leaveController.reject),
);

export const leaveRoutes = router;
