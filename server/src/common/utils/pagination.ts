import type { PaginationMeta } from "../types/http.js";

export const MAX_PAGE_SIZE = 200;

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface ResolvedPagination {
  /** `undefined` means "no pagination requested" — return the full set. */
  skip: number | undefined;
  limit: number | undefined;
  page: number;
}

/**
 * Pagination is opt-in: a request with no `page`/`limit` gets the whole
 * collection, which keeps the existing client working unchanged. Supplying
 * either param switches the endpoint into paged mode.
 */
export const resolvePagination = ({
  page,
  limit,
}: PaginationInput): ResolvedPagination => {
  if (page === undefined && limit === undefined) {
    return { skip: undefined, limit: undefined, page: 1 };
  }

  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? 20));

  return {
    skip: (safePage - 1) * safeLimit,
    limit: safeLimit,
    page: safePage,
  };
};

export const buildPaginationMeta = (
  total: number,
  { page, limit }: ResolvedPagination,
): PaginationMeta => {
  const effectiveLimit = limit ?? Math.max(total, 1);
  const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));

  return {
    page,
    limit: effectiveLimit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
