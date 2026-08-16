import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { statsController } from "./stats.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(statsController.dashboard));

export const statsRoutes = router;
