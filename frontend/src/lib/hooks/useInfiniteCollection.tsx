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
    getNextPageParam: (lastPage) => {
      console.log('lastPage', lastPage);
      
      // Handle edge cases where currentPage or totalPages might be undefined/null
      const currentPage = lastPage.currentPage ?? 0;
      const totalPages = lastPage.totalPages ?? 0;
      
      // If there are no items, no pages, or we're on the last page, stop pagination
      if (totalPages === 0 || currentPage >= totalPages) {
        return undefined;
      }
      
      // Only return next page if there are more pages available
      console.log('currentPage', currentPage, 'totalPages', totalPages);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
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
