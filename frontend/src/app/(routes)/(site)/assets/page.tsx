"use client";

// app/templates/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { assetsAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection";
import { type Asset } from "@/lib/types/api";
import type { EntityConfig } from "@/lib/types/grid";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";


// --- Filters the backend accepts for templates ---
export type AssetFilters = {
    starred?: boolean;
    shared?: boolean;
    search?: string;
    category?: string;
    featured?: boolean;
    popular?: boolean;
    type?: "image" | "video" | "audio" | "document" | "custom";
};

// --- Config object passed to the generic grid ---
const assetCfg: EntityConfig<Asset, AssetFilters> = {
    key: "assets",
    infiniteKey: "infiniteAssets",
    api: {
        getPaginated: assetsAPI.getPaginated.bind(assetsAPI),
        getAll: assetsAPI.getAll.bind(assetsAPI),
        create: assetsAPI.create.bind(assetsAPI),
        update: assetsAPI.update.bind(assetsAPI),
        delete: assetsAPI.delete.bind(assetsAPI),
        deleteMultiple: assetsAPI.deleteMultiple?.bind(assetsAPI),
    },
    nounSingular: "asset",
    createFactory: ({ width = 1080, height = 1080 }) => ({
        role: "asset",
        title: "Untitled Asset",
        type: "custom",
        category: "custom",
        author: "current-user",
        featured: false,
        popular: false,
        name: "Untitled Project",
        vibe: "minimal" as const,
        width,
        height,
        projectData: {
            version: "1.0",
            elements: [],
            background: { type: "solid", color: "#ffffff" }
        },
        canvasSize: { width, height },
        pages: [],
        data: {},
    }),
};

export default function AssetsPage() {
    // If you prefer URL-driven filters, grab them here
    const params = useSearchParams();
    const [search] = useState(""); // local state if you have a search box somewhere

    const filters: AssetFilters = useMemo(() => ({
        starred: params.get("starred") === "true" ? true : undefined,
        shared: params.get("shared") === "true" ? true : undefined,
        featured: params.get("featured") === "true" ? true : undefined,
        popular: params.get("popular") === "true" ? true : undefined,
        type: (params.get("type") as AssetFilters["type"]) ?? undefined,
        category: params.get("category") ?? undefined,
        search: search || params.get("search") || undefined,
    }), [params, search]);

    return (
        <SelectionProvider>
            <EntityGrid<Asset, AssetFilters>
                cfg={assetCfg}
                filters={filters}
                ctaLabel="Upload"
                isClickable={false}
            />
        </SelectionProvider>
    )
}
