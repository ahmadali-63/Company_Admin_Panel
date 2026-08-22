import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { taskController } from "./task.controller.js";
import {
  addTaskCommentSchema,
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./task.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.create),
);

router.get(
  "/",
  validate({ query: listTasksQuerySchema }),
  asyncHandler(taskController.list),
);

router.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(taskController.getById),
);

router.put(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(taskController.update),
);

router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateTaskStatusSchema }),
  asyncHandler(taskController.updateStatus),
);

router.post(
  "/:id/comments",
  validate({ params: idParamSchema, body: addTaskCommentSchema }),
  asyncHandler(taskController.addComment),
);

router.delete(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema }),
  asyncHandler(taskController.remove),
);

export const taskRoutes = router;
