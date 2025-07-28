"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { projectsAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection-context";
import { ByRole } from "@/lib/types/api"; // helper: export type ByRole<R extends Role> = Extract<Composition, { role: R }>
import type { EntityConfig } from "@/lib/types/grid";
import type { SelectionConfig, SelectionItem } from "@/lib/types/config";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SOCIAL_MEDIA_FORMATS } from "@/lib/constants";

// --- Narrow the union to just projects ---
export type Project = ByRole<"project">;

// --- Filters the backend accepts for projects ---
export type ProjectFilters = {
  starred?: boolean;
  shared?: boolean;
  search?: string;
  type?: "presentation" | "social" | "print" | "custom";
  category?: string;
  featured?: boolean;
  popular?: boolean;
};

// Project categories for selection
export const PROJECT_TYPES = {
  // Presentations
  "presentation-standard": { 
    name: "Standard Presentation", 
    category: "Presentations", 
    description: "16:9 ratio (1920×1080)",
    width: 1920, 
    height: 1080 
  },
  "presentation-widescreen": { 
    name: "Wide Presentation", 
    category: "Presentations", 
    description: "21:9 ratio (2560×1080)",
    width: 2560, 
    height: 1080 
  },
  
  // Print Designs
  "print-poster": { 
    name: "Poster", 
    category: "Print", 
    description: "24×36 inches (1728×2592 px)",
    width: 1728, 
    height: 2592 
  },
  "print-flyer": { 
    name: "Flyer", 
    category: "Print", 
    description: "8.5×11 inches (612×792 px)",
    width: 612, 
    height: 792 
  },
  "print-business-card": { 
    name: "Business Card", 
    category: "Print", 
    description: "3.5×2 inches (252×144 px)",
    width: 252, 
    height: 144 
  },
  
  // Custom
  "custom-blank": { 
    name: "Blank Canvas", 
    category: "Custom", 
    description: "Start from scratch",
    width: 1080, 
    height: 1080 
  }
};

// --- Config object passed to the generic grid ---
const projectCfg: EntityConfig<Project, ProjectFilters> = {
  key: "projects",
  infiniteKey: "infiniteProjects",
  api: {
    getPaginated: projectsAPI.getPaginated.bind(projectsAPI),
    getAll: projectsAPI.getAll.bind(projectsAPI),
    create: projectsAPI.create.bind(projectsAPI),
    update: projectsAPI.update.bind(projectsAPI),
    delete: projectsAPI.delete.bind(projectsAPI),
    deleteMultiple: projectsAPI.deleteMultiple?.bind(projectsAPI),
  },
  nounSingular: "project",
  createFactory: ({width = 1080, height = 1080}) => ({
    role: "project",
    title: "Untitled Project",
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

export default function ProjectsPage() {
  // If you prefer URL-driven filters, grab them here
  const params = useSearchParams();
  const [search] = useState(""); // local state if you have a search box somewhere

  const filters: ProjectFilters = useMemo(() => ({
    starred: params.get("starred") === "true" ? true : undefined,
    shared: params.get("shared") === "true" ? true : undefined,
    featured: params.get("featured") === "true" ? true : undefined,
    popular: params.get("popular") === "true" ? true : undefined,
    type: (params.get("type") as ProjectFilters["type"]) ?? undefined,
    category: params.get("category") ?? undefined,
    search: search || params.get("search") || undefined,
  }), [params, search]);

  
  // Transform SOCIAL_MEDIA_FORMATS into a SelectionConfig for the grid
  const socialMediaConfig = useMemo<SelectionConfig>(() => {
    // Extract unique categories
    const categories = [...new Set(Object.values(SOCIAL_MEDIA_FORMATS).map(format => format.category))];
    
    // Transform formats into selection items
    const items: SelectionItem[] = Object.entries(SOCIAL_MEDIA_FORMATS).map(([key, format]) => ({
      key,
      label: format.name,
      description: `${format.width} × ${format.height}`,
      category: format.category,
      data: {
        width: format.width,
        height: format.height
      }
    }));
    
    return {
      categories,
      items
    };
  }, []);

  return (
    <SelectionProvider>
      <EntityGrid<Project, ProjectFilters> 
        cfg={projectCfg} 
        filters={filters}
        selectionConfig={socialMediaConfig}
      />
    </SelectionProvider>
  );
}
