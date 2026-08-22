import type { NextFunction, Request, Response } from "express";

import { ERROR_MESSAGES } from "../constants/messages.js";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import { verifyAccessToken } from "../../modules/auth/token.service.js";
import { UserModel } from "../../modules/user/user.model.js";
import type { AuthenticatedUser } from "../types/auth.js";

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      throw new UnauthorizedError(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const token = extractBearerToken(header);

    if (!token) {
      throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING);
    }

    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.userId)
      .select("name email role isActive hrId teamLeadId projectIds")
      .lean<AuthenticatedUser>()
      .exec();

    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.isActive === false) {
      throw new ForbiddenError("You do not have permission to perform this action.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
