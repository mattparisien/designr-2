"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { projectsAPI } from "@/lib/api/index";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import { type Project } from "@/lib/types/api";
import type { SelectionConfig } from "@/lib/types/config";
import type { EntityConfig } from "@/lib/types/grid";
import { useMemo } from "react";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}


// --- Config object passed to the generic grid ---
const compositionCfg: EntityConfig<Project> = {
  key: "projects",
  infiniteKey: "infiniteProjects",
  api: {
    getPaginated: async (page?: number, limit?: number, filters?: Record<string, unknown>) => {
      const result = await projectsAPI.getPaginated(page, limit, filters);
      return {
        items: result.projects,
        totalItems: result.totalProjects,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    },
    getAll: projectsAPI.getAll.bind(projectsAPI),
    create: projectsAPI.create.bind(projectsAPI),
    update: projectsAPI.update.bind(projectsAPI),
    delete: projectsAPI.delete.bind(projectsAPI),
    deleteMultiple: projectsAPI.deleteMultiple?.bind(projectsAPI),
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

export default function ProjectsPage() {




  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const socialMediaConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);

  return (
    <SelectionProvider>
      <EntityGrid<Project, unknown>
        cfg={compositionCfg}
        filters={{}}
        selectionConfig={socialMediaConfig}
      />
    </SelectionProvider>
  );
}
