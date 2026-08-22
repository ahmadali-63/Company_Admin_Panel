import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { notificationController } from "./notification.controller.js";
import { listNotificationsQuerySchema } from "./notification.schema.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate({ query: listNotificationsQuerySchema }),
  asyncHandler(notificationController.list),
);

router.patch("/read-all", asyncHandler(notificationController.markAllAsRead));

router.patch(
  "/:id/read",
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.markAsRead),
);

export const notificationRoutes = router;
