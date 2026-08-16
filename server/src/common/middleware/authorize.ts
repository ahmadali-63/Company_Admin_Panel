import type { NextFunction, Request, RequestHandler, Response } from "express";

import { ERROR_MESSAGES } from "../constants/messages.js";
import type { Role } from "../constants/roles.js";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

/** Route guard: allow only the listed roles. Must run after `authenticate`. */
export const authorize =
  (...allowedRoles: Role[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError(ERROR_MESSAGES.AUTH_REQUIRED));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError(ERROR_MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };
