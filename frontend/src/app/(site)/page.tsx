"use client";

// app/templates/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { templatesAPI } from "@/lib/api/index";
import { SelectionProvider } from "@/lib/context/selection";
import { ByRole } from "@/lib/types/api"; // helper: export type ByRole<R extends Role> = Extract<Composition, { role: R }>
import type { EntityConfig } from "@/lib/types/grid";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
const templateCfg: EntityConfig<Template, TemplateFilters> = {
  key: "templates",
  infiniteKey: "infiniteTemplates",
  api: {
    getPaginated: templatesAPI.getPaginated.bind(templatesAPI),
    getAll: templatesAPI.getAll.bind(templatesAPI),
    create: templatesAPI.create.bind(templatesAPI),
    update: templatesAPI.update.bind(templatesAPI),
    delete: templatesAPI.delete.bind(templatesAPI),
    deleteMultiple: templatesAPI.deleteMultiple?.bind(templatesAPI),
  },
  nounSingular: "template",
  createFactory: () => ({
    role: "template",
    title: "Untitled Template",
    type: "custom",
    category: "custom",
    author: "current-user",
    featured: false,
    popular: false,
    canvasSize: { width: 800, height: 600 },
    pages: [],
    data: {},
  }),
};

export default function TemplatesPage() {
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

  return <SelectionProvider><EntityGrid<Template, TemplateFilters> cfg={templateCfg} filters={filters} /></SelectionProvider>;
}
