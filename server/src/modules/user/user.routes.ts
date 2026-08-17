import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { userController } from "./user.controller.js";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLE.ADMIN),
  validate({ body: createUserSchema }),
  asyncHandler(userController.create),
);

router.get(
  "/",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ query: listUsersQuerySchema }),
  asyncHandler(userController.list),
);

router.get(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ params: idParamSchema }),
  asyncHandler(userController.getById),
);

router.put(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(userController.update),
);

router.patch(
  "/:id/status",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: updateUserStatusSchema }),
  asyncHandler(userController.updateStatus),
);

router.delete(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(userController.remove),
);

export const userRoutes = router;
