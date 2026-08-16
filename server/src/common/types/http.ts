import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

import type { AuthenticatedUser } from "./auth.js";

/** A request that has already passed through `authenticate`. */
export interface AuthedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: AuthenticatedUser;
}

export type AsyncHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
