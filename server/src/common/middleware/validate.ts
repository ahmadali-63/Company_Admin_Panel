import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, type ZodType } from "zod";

import { ValidationError } from "../errors/AppError.js";

export interface RequestSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

const formatIssues = (error: z.ZodError): string[] =>
  error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

/**
 * Parses and REPLACES `req.body` / `req.params` with the parsed result, so
 * controllers receive coerced, trimmed, typed values.
 *
 * `req.query` is a getter in Express 5, so the parsed query is exposed as
 * `res.locals.query` instead of being reassigned.
 */
export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (result.success) {
        Object.assign(req.params, result.data as Record<string, string>);
      } else {
        errors.push(...formatIssues(result.error));
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) {
        res.locals.query = result.data;
      } else {
        errors.push(...formatIssues(result.error));
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
      } else {
        errors.push(...formatIssues(result.error));
      }
    }

    if (errors.length > 0) {
      next(new ValidationError("Validation error.", errors));
      return;
    }

    next();
  };

/** Type-safe accessor for the query parsed by `validate`. */
export const validatedQuery = <T>(res: Response): T => res.locals.query as T;
