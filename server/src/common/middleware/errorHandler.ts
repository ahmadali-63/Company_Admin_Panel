import type { ErrorRequestHandler, RequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import jwt from "jsonwebtoken";

// `jsonwebtoken` is CommonJS: Node's ESM loader cannot detect these classes as
// named exports, so pull them off the default export at runtime.
const { JsonWebTokenError, TokenExpiredError } = jwt;

import { isProduction } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError, NotFoundError, isAppError } from "../errors/AppError.js";

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const isDuplicateKeyError = (error: unknown): error is MongoDuplicateKeyError =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === 11000;

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found.`));
};

/**
 * Terminal error handler. Translates known failure shapes into the
 * `{ success, message }` envelope the client already expects.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message: string = ERROR_MESSAGES.INTERNAL;
  let details: unknown;

  if (isAppError(error)) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = "Validation error.";
    details = Object.values(error.errors).map((err) => err.message);
  } else if (error instanceof MongooseError.CastError) {
    statusCode = 400;
    message = "Invalid ID.";
  } else if (isDuplicateKeyError(error)) {
    statusCode = 409;
    const field = Object.keys(error.keyValue ?? {})[0];
    message = field
      ? `A record with this ${field} already exists.`
      : "A record with this value already exists.";
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = ERROR_MESSAGES.TOKEN_INVALID;
  }

  const isServerError = statusCode >= 500;

  const logPayload = {
    err: error,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?._id?.toString(),
  };

  if (isServerError) {
    logger.error(logPayload, "Unhandled request error");
  } else {
    logger.warn(logPayload, "Request failed");
  }

  // Never leak internals of an unexpected error in production.
  if (isServerError && isProduction) {
    message = ERROR_MESSAGES.INTERNAL;
    details = undefined;
  } else if (isServerError && !(error instanceof AppError)) {
    message = error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details === undefined ? {} : { errors: details }),
  });
};
