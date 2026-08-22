import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { projectController } from "./project.controller.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "./project.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLE.ADMIN),
  validate({ body: createProjectSchema }),
  asyncHandler(projectController.create),
);

router.get(
  "/",
  validate({ query: listProjectsQuerySchema }),
  asyncHandler(projectController.list),
);

router.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(projectController.getById),
);

router.put(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(projectController.update),
);

router.delete(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(projectController.remove),
);

export const projectRoutes = router;
