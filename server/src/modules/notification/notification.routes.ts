import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { notificationController } from "./notification.controller.js";
import { createNotificationSchema } from "./notification.schema.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate({ body: createNotificationSchema }),
  asyncHandler(notificationController.createNotification)
);

router.get(
  "/",
  asyncHandler(notificationController.getMyNotifications)
);

router.put(
  "/:id/read",
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.markAsRead)
);

export const notificationRoutes = router;
