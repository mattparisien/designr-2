"use client";

import { templatesAPI } from "@/lib/api/index";
import { Template } from "@/lib/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface TemplatesPageData {
  templates: Template[],
  totalTemplates: number;
  totalPages: number;
  currentPage: number;
}

export interface UseInfiniteTemplatesOptions {
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
 * Custom hook for infinite loading of projects with pagination
 */
export function useInfiniteTemplates(options: UseInfiniteTemplatesOptions = {}) {
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
    queryKey: ['InfiniteTemplates', limit, filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Call the API with the current page and filters
      const result = await templatesAPI.getPaginated(pageParam, limit, filters);
      return result;
    },
    getNextPageParam: (lastPage: TemplatesPageData) => {
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
  const templates = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.templates);
  }, [data]);

  // Calculate total count from the most recent page
  const totalTemplates = data?.pages[0]?.totalTemplates || 0;

  return {
    templates,
    totalTemplates,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
}