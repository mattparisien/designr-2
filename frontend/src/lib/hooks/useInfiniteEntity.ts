// lib/hooks/useInfiniteEntity.ts
import { useInfiniteCollection, UseInfiniteCollectionOptions } from "./useInfiniteCollection";
import { QueryKey } from "@tanstack/react-query";
import { EntityConfig } from "../types/grid";

export function useInfiniteEntity<T, F>(
  cfg: EntityConfig<T, F>,
  opts: UseInfiniteCollectionOptions<F>
) {
  return useInfiniteCollection<T, F>(
    [cfg.infiniteKey] as QueryKey,
    (p, l, f) => cfg.api.getPaginated(p, l, f),
    opts
  );
}
