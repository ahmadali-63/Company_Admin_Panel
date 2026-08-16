import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate.js";
import { authRateLimiter } from "../../common/middleware/rateLimit.js";
import { validate } from "../../common/middleware/validate.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { authController } from "./auth.controller.js";
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  signupSchema,
} from "./auth.schema.js";

const router = Router();

// Public — rate limited to slow credential stuffing.
router.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

router.post(
  "/signup",
  authRateLimiter,
  validate({ body: signupSchema }),
  asyncHandler(authController.signup),
);

// Kept as an alias: the existing client posts to /register.
router.post(
  "/register",
  authRateLimiter,
  validate({ body: signupSchema }),
  asyncHandler(authController.signup),
);

router.post(
  "/refresh",
  authRateLimiter,
  validate({ body: refreshSchema }),
  asyncHandler(authController.refresh),
);

// Authenticated
router.get("/me", authenticate, asyncHandler(authController.me));

router.post("/logout", authenticate, asyncHandler(authController.logout));

router.post(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
);

export const authRoutes = router;
