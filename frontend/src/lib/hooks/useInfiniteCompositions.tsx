import { compositionsAPI } from "@/lib/api";
import { type Composition } from "@/lib/types/api";
import { useInfiniteCollection, UseInfiniteCollectionOptions } from "./useInfiniteCollection";

type CompositionFilters = {
  starred?: boolean;
  shared?: boolean;
  type?: string;
  category?: string;
  search?: string;
};

export function useInfiniteCompositions(
  options: UseInfiniteCollectionOptions<CompositionFilters> = {}
) {
  return useInfiniteCollection<Composition, CompositionFilters>(
    ["infiniteCompositions"],
    async (page, limit, filters) => {
      const res = await compositionsAPI.getPaginated(page, limit, filters);
      // Map your API shape to the generic one if needed:
      const mapped = {
        items: res.templates ?? res.compositions ?? res.items, // adjust
        totalItems: res.totalTemplates ?? res.totalCompositions ?? res.totalItems,
        totalPages: res.totalPages,
        currentPage: res.currentPage,
      };
      return mapped;
    },
    options
  );
}
