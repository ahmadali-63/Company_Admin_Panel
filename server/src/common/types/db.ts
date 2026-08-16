import type { QueryFilter } from "mongoose";

/**
 * Mongoose 9 renamed `FilterQuery` to `QueryFilter`. Aliasing it once here
 * keeps the rename contained if it moves again.
 */
export type Filter<T> = QueryFilter<T>;

/**
 * Minimal structural view of a mongoose Query for chaining `populate`.
 * `populate` returns `this`, so mutating the chain and returning the original
 * query keeps the caller's precise type intact.
 */
export interface Populatable {
  populate: (path: string, select: string) => Populatable;
}

export const populateAll = <T extends object>(
  query: T,
  relations: readonly (readonly [path: string, select: string])[],
): T => {
  let chain = query as unknown as Populatable;

  for (const [path, select] of relations) {
    chain = chain.populate(path, select);
  }

  return query;
};
