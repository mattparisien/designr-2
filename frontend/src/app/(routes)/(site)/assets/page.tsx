"use client";

// app/templates/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { assetsAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection";
import { type Asset } from "@/lib/types/api";
import type { EntityConfig } from "@/lib/types/grid";
import type { SelectionConfig, SelectionItem } from "@/lib/types/config";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

// Asset types available for upload, organized by categories
export const ASSET_TYPES = {
    // Images
    "image-photo": { type: "image", name: "Photo", category: "Images", description: "JPG, PNG, WebP up to 15MB" },
    "image-illustration": { type: "image", name: "Illustration", category: "Images", description: "SVG, PNG, AI files" },
    "image-icon": { type: "image", name: "Icon", category: "Images", description: "SVG, PNG icons" },

    // Videos
    "video-mp4": { type: "video", name: "MP4 Video", category: "Videos", description: "H.264 encoded up to 100MB" },
    "video-gif": { type: "video", name: "GIF", category: "Videos", description: "Animated GIFs up to 15MB" },
    "video-webm": { type: "video", name: "WebM Video", category: "Videos", description: "VP9 encoded up to 50MB" },

    // Documents
    "document-pdf": { type: "document", name: "PDF Document", category: "Documents", description: "PDF files up to 25MB" },
    "document-presentation": { type: "document", name: "Presentation", category: "Documents", description: "PPT, Keynote files" },
    "document-spreadsheet": { type: "document", name: "Spreadsheet", category: "Documents", description: "Excel, CSV files" },

    // Audio
    "audio-mp3": { type: "audio", name: "MP3 Audio", category: "Audio", description: "MP3 files up to 10MB" },
    "audio-wav": { type: "audio", name: "WAV Audio", category: "Audio", description: "Uncompressed audio" },
};

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
    createFactory: (item) => {
        console.log(item)
        return {
            role: "asset",
            title: item.name || "Untitled Asset",
            type: item.type || "custom",
            category: item.category || "custom",
        }
    },
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

    // Transform ASSET_TYPES into a SelectionConfig for the grid
    const assetTypesConfig = useMemo<SelectionConfig>(() => {
        // Extract unique categories
        const categories = [...new Set(Object.values(ASSET_TYPES).map(asset => asset.category))];

        // Transform asset types into selection items
        const items: SelectionItem[] = Object.entries(ASSET_TYPES).map(([key, asset]) => ({
            key,
            label: asset.name,
            description: asset.description,
            category: asset.category,
            data: {
                type: asset.type
            }
        }));

        return {
            categories,
            items
        };
    }, []);

    return (
        <SelectionProvider>
            <EntityGrid<Asset, AssetFilters>
                cfg={assetCfg}
                filters={filters}
                cta={{
                    label: "Upload Files",
                    icon: Upload,
                    el: "input[type='file']"
                }}

                isClickable={false}
                selectionConfig={assetTypesConfig}
            />
        </SelectionProvider>
    )
}
