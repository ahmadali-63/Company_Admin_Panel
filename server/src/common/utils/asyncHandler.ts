import type { NextFunction, RequestHandler, Response } from "express";

/**
 * Bridges a precisely-typed controller (which may declare `req` as
 * `AuthedRequest`) to Express's looser `RequestHandler` signature, and funnels
 * rejections into `next` so the error middleware sees them.
 */
export const asyncHandler =
  <Req>(
    handler: (req: Req, res: Response, next: NextFunction) => unknown,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req as unknown as Req, res, next)).catch(next);
  };
