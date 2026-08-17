import rateLimit from "express-rate-limit";

import { env, isTest } from "../../config/env.js";

const skip = () => isTest;

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/** Tighter bucket for credential endpoints — slows password spraying. */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});
