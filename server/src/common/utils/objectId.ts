import { Types } from "mongoose";

import { BadRequestError } from "../errors/AppError.js";

/** Anything that can stand in for a document id in a comparison. */
export type IdLike =
  | Types.ObjectId
  | string
  | { _id: Types.ObjectId | string }
  | null
  | undefined;

export const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" && Types.ObjectId.isValid(value);

export const toObjectId = (value: string, label = "ID"): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestError(`Invalid ${label}.`);
  }
  return new Types.ObjectId(value);
};

/**
 * Normalises an id to its hex string. Handles populated references, which
 * arrive as full documents rather than raw ObjectIds — calling `toString()`
 * on those yields "[object Object]" and silently breaks every comparison.
 */
const idOf = (value: IdLike): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (value instanceof Types.ObjectId) return value.toString();

  if (typeof value === "object" && "_id" in value) {
    return String(value._id);
  }

  return String(value);
};

/** True when two id-ish values point at the same document. */
export const sameId = (a: IdLike, b: IdLike): boolean => {
  const left = idOf(a);
  const right = idOf(b);

  return left !== null && right !== null && left === right;
};

export const containsId = (
  list: readonly IdLike[] | undefined,
  id: IdLike,
): boolean => (list ?? []).some((entry) => sameId(entry, id));
