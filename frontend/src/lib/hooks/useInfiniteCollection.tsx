"use client";

import { useInfiniteQuery, QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";

/** Shape your backend returns */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface UseInfiniteCollectionOptions<F = unknown> {
  limit?: number;
  filters?: F;
}

/**
 * Generic infinite loader.
 * @param queryKey   React Query key base (e.g. ["infiniteCompositions"])
 * @param fetchPage  (page, limit, filters) => Promise<PaginatedResponse<T>>
 * @param options    { limit, filters }
 */
export function useInfiniteCollection<T, F = unknown>(
  queryKey: QueryKey,
  fetchPage: (page: number, limit: number, filters: F) => Promise<PaginatedResponse<T>>,
  { limit = 12, filters = {} as F }: UseInfiniteCollectionOptions<F> = {}
) {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, limit, filters],
    queryFn: async ({ pageParam = 1 }) => fetchPage(pageParam, limit, filters),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage >= lastPage.totalPages ? undefined : lastPage.currentPage + 1,
    initialPageParam: 1,
  });

  const flatItems = useMemo(() => {
    if (!query.data) return [];
    return query.data.pages.flatMap((p) => p.items);
  }, [query.data]);

  const totalItems = query.data?.pages[0]?.totalItems ?? 0;

  return {
    items: flatItems,
    totalItems,
    ...query,
  };
}
