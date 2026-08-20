import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { taskController } from "./task.controller.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "./task.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLE.ADMIN, ROLE.TEAM_MEMBER, ROLE.TEAM_LEAD),
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.create),
);

router.post(
  "/createTask",
  authorize(ROLE.ADMIN, ROLE.TEAM_MEMBER, ROLE.TEAM_LEAD),
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.create),
);

router.post(
  "/updateTask/:id",
  authorize(ROLE.ADMIN, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(taskController.update),
);

router.get(
  "/",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ query: listTasksQuerySchema }),
  asyncHandler(taskController.list),
);

router.get(
  "/listTasks",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ query: listTasksQuerySchema }),
  asyncHandler(taskController.list),
);

router.get(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ params: idParamSchema }),
  asyncHandler(taskController.getById),
);

router.put(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(taskController.update),
);

router.delete(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(taskController.remove),
);

export const taskRoutes = router;
