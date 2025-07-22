// src/lib/hooks/useEntityCrud.ts
import { useEntityQuery } from "./useEntityQuery"; // the file we wrote last
import { EntityConfig } from "@/lib/types/grid";   // or wherever you put this type

export function useEntityCrud<T, F>(cfg: EntityConfig<T, F>) {
  return useEntityQuery<T>({
    key: cfg.key,
    infiniteKey: cfg.infiniteKey,
    api: cfg.api,
  });
}
