"use client";

import { brandsAPI } from "@/lib/api/index";
import { Brand } from "@shared/types/core/brand";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface BrandsPageData {
  brands: Brand[],
  totalBrands: number;
  totalPages: number;
  currentPage: number;
}

export interface UseInfiniteBrandsOptions {
  limit?: number;
  filters?: {
    starred?: boolean;
    shared?: boolean;
    type?: string;
    category?: string;
    search?: string;
  };
}

/**
 * Custom hook for infinite loading of brands with pagination
 */
export function useInfiniteBrands(options: UseInfiniteBrandsOptions = {}) {
  const { limit = 12, filters = {} } = options;

  // Use the InfiniteQuery hook to handle pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['InfiniteBrands', limit, filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Call the API with the current page and filters
      const result = await brandsAPI.getPaginated(pageParam, limit, filters);
      return result;
    },
    getNextPageParam: (lastPage: BrandsPageData) => {
      // If we're on the last page, return undefined to indicate there's no more data
      if (lastPage.currentPage >= lastPage.totalPages) {
        return undefined;
      }
      // Otherwise, return the next page number
      return lastPage.currentPage + 1;
    },
    initialPageParam: 1,
  });

  // Flatten the projects from all pages into a single array for easier consumption
  const brands = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.brands);
  }, [data]);

  // Calculate total count from the most recent page
  const totalBrands = data?.pages[0]?.totalBrands || 0;

  return {
    brands,
    totalBrands,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
}