"use client";

// app/templates/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { projectsAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection";
import { ByRole } from "@/lib/types/api"; // helper: export type ByRole<R extends Role> = Extract<Composition, { role: R }>
import type { EntityConfig } from "@/lib/types/grid";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// --- Narrow the union to just templates ---
export type Project = ByRole<"project">;

// --- Filters the backend accepts for templates ---
export type ProjectFilters = {
  starred?: boolean;
  shared?: boolean;
  search?: string;
  type?: "presentation" | "social" | "print" | "custom";
  category?: string;
  featured?: boolean;
  popular?: boolean;
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

  return <SelectionProvider><EntityGrid<Project, ProjectFilters> cfg={projectCfg} filters={filters} /></SelectionProvider>;
}
