"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateButton } from "@/components/CreateButton";
import { InteractiveGrid } from "@/components/EntityGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { useInfiniteProjects } from "@/lib/hooks/useInfiniteProjects";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import type { SelectionConfig } from "@/lib/types/config";
import { useProjectQuery } from "@/lib/hooks/useProjects";
import { useCallback, useMemo } from "react";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}


export default function ProjectsPage() {

  const {
    projects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteProjects({
    limit: 20
  });

  const {
    createProject
  } = useProjectQuery();

  const gridItems = useMemo(() => {
    return projects?.map(project => ({
      _id: project._id,
      title: project.title,
      image: { src: "", alt: project.title },
      updatedAt: project.updatedAt,
      type: project.templateId ? "template" : "project",
    })) ?? [];
  }, [projects])


  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const socialMediaConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);

  const handleCreate = useCallback((item: { key?: string; label?: string; data?: { files?: FileList } }) => {
    createProject(item);
  }, [createProject]);

  return (
    <SelectionProvider>
      <Section>
        <div className="flex items-center justify-between pb-10">
          <div>
            <h3 className="text-xl font-medium">
              My Projects
            </h3>
          </div>
          <CreateButton
            config={socialMediaConfig}
            onCreate={handleCreate}
          />
        </div>
        <InteractiveGrid
          items={gridItems}
        />
      </Section>
    </SelectionProvider>
  );
}
