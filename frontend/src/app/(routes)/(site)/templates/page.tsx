"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { EntityGrid } from "@/components/EntityGrid";
import { templatesAPI } from "@/lib/api/index";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import { Template } from "@/lib/types/api";
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
const compositionCfg: EntityConfig<Template> = {
  key: "templates",
  infiniteKey: "infiniteTemplates",
  api: {
    getPaginated: async (page?: number, limit?: number, filters?: Record<string, string | number | boolean>) => {
      const result = await templatesAPI.getPaginated(page, limit, filters);
      return {
        items: result.templates,
        totalItems: result.totalTemplates,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    },
    getAll: templatesAPI.getAll.bind(templatesAPI),
    create: templatesAPI.create.bind(templatesAPI),
    update: templatesAPI.update.bind(templatesAPI),
    delete: templatesAPI.delete.bind(templatesAPI),
    deleteMultiple: templatesAPI.deleteMultiple?.bind(templatesAPI),
  },
  nounSingular: "template",
  createFactory: ({ width = 1080, height = 1080 }) => {
    // Import the factory dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createComposition } = require("@/lib/utils/compositionFactory");
    return createComposition({
      width,
      height,
      isTemplate: true,
      role: "template"
    });
  },
};

export default function TemplatesPage() {




  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const socialMediaConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);

  return (
    <SelectionProvider>
      <EntityGrid<Template, unknown>
        cfg={compositionCfg}
        filters={{}}
        selectionConfig={socialMediaConfig}
      />
    </SelectionProvider>
  );
}
