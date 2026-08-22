import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { notificationController } from "./notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(notificationController.list));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

export const notificationRoutes = router;
