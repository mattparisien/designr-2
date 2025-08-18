"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateButton } from "@/components/CreateButton";
import Heading from "@/components/Heading/Heading";
import { InteractiveGrid } from "@/components/InteractiveGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { createProject as createProjectFactory } from "@/lib/factories";
import { useInfiniteProjects } from "@/lib/hooks/useInfiniteProjects";
import { useProjectQuery } from "@/lib/hooks/useProjects";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import { Project } from "@/lib/types/api";
import type { SelectionConfig } from "@/lib/types/config";
import { DesignProject } from "@shared/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}

export default function ProjectsPage() {

  const { projects, refetch } = useInfiniteProjects({
    limit: 20
  });

  const {
    createProject,
    updateProject,
    deleteMultipleProjects
  } = useProjectQuery();

  const router = useRouter()


  const gridItems = useMemo(() => {
    return projects?.map(project => ({
      id: project._id,
      title: project.title,
      image: { src: "", alt: project.title },
      updatedAt: project.updatedAt,
      type: "project",
    })) ?? [];
  }, [projects])


  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const selectionConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);


  const handleCreate = useCallback(async (item: { key?: string; label?: string; data?: { files?: FileList } }) => {
    try {
      if (!item.key) {
        throw new Error("No format key provided");
      }

      const projectData = createProjectFactory(item.key, item.label);
      const project: DesignProject = await createProject(projectData);
      router.push(`/editor/${project.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }, [createProject, refetch, router]);

  // CRUD handlers for InteractiveGrid
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    await deleteMultipleProjects(ids);
    refetch();
  }, [deleteMultipleProjects, refetch]);

  const handleUpdateItem = useCallback(async (id: string, updates: { title?: string; name?: string }) => {
    const updateData: { title?: string } = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.name) updateData.title = updates.name; // Map name to title

    await updateProject({ id, data: updateData });
  }, [updateProject]);

  return (
    <SelectionProvider>
      <Section>
        <div className="pt-10 flex items-center justify-between pb-10">
          <div>
            <Heading
              as={1}
              styleLevel={3}
            >
              My Projects
            </Heading>
          </div>
          <CreateButton
            config={selectionConfig}
            onCreate={handleCreate}
          />
        </div>
        <InteractiveGrid
          items={gridItems}
          onDeleteItems={handleDeleteItems}
          onUpdateItem={handleUpdateItem}
        />
      </Section>
    </SelectionProvider>
  );
}
