/**
 * Operational error: a failure we anticipated and can safely describe to the
 * client. Anything that is NOT an AppError is treated as a bug and reported
 * as a generic 500.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request.", details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.", details?: unknown) {
    super(401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "You do not have permission to perform this action.",
    details?: unknown,
  ) {
    super(403, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", details?: unknown) {
    super(404, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists.", details?: unknown) {
    super(409, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error.", details?: unknown) {
    super(400, message, details);
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
