"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { compositionAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection";
import { ByRole, Composition } from "@/lib/types/api"; // helper: export type ByRole<R extends Role> = Extract<Composition, { role: R }>
import type { SelectionConfig } from "@/lib/types/config";
import type { EntityConfig } from "@/lib/types/grid";
// We're importing the factory dynamically in createFactory to avoid circular dependencies
import { DESIGN_FORMATS } from "@/lib/constants";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// Define the design format type
export interface DesignFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}

// --- Narrow the union to just templates ---
export type Template = ByRole<"template">;

// --- Filters the backend accepts for templates ---
export type TemplateFilters = {
  starred?: boolean;
  shared?: boolean;
  search?: string;
  type?: "presentation" | "social" | "print" | "custom";
  category?: string;
  featured?: boolean;
  popular?: boolean;
};



// --- Config object passed to the generic grid ---
const compositionCfg: EntityConfig<Composition, TemplateFilters> = {
  key: "compositions",
  infiniteKey: "infiniteCompositions",
  api: {
    getPaginated: compositionAPI.getPaginated.bind(compositionAPI),
    getAll: compositionAPI.getAll.bind(compositionAPI),
    create: compositionAPI.create.bind(compositionAPI),
    update: compositionAPI.update.bind(compositionAPI),
    delete: compositionAPI.delete.bind(compositionAPI),
    deleteMultiple: compositionAPI.deleteMultiple?.bind(compositionAPI),
  },
  nounSingular: "project",
  createFactory: ({ width = 1080, height = 1080 }) => {
    // Import the factory dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createComposition } = require("@/lib/utils/compositionFactory");
    return createComposition({
      width,
      height,
      isTemplate: false,
      role: "project"
    });
  },
};

export default function CompositionsPage() {
  // If you prefer URL-driven filters, grab them here
  const params = useSearchParams();
  const [search] = useState(""); // local state if you have a search box somewhere

  const filters: TemplateFilters = useMemo(() => ({
    starred: params.get("starred") === "true" ? true : undefined,
    shared: params.get("shared") === "true" ? true : undefined,
    featured: params.get("featured") === "true" ? true : undefined,
    popular: params.get("popular") === "true" ? true : undefined,
    type: (params.get("type") as TemplateFilters["type"]) ?? undefined,
    category: params.get("category") ?? undefined,
    search: search || params.get("search") || undefined,
  }), [params, search]);


  // Transform SOCIAL_MEDIA_FORMATS into a SelectionConfig for the grid
  const designConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS);
  }, []);

  return (
    <SelectionProvider>
      <EntityGrid<Composition, TemplateFilters>
        cfg={compositionCfg}
        filters={filters}
        selectionConfig={designConfig}
      />
    </SelectionProvider>
  );
}
