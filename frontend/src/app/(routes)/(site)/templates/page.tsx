"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateButton } from "@/components/CreateButton";
import { InteractiveGrid } from "@/components/EntityGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { createTemplate as createTemplateFactory } from "@/lib/factories";
import { useInfiniteTemplates } from "@/lib/hooks/useInfiniteTemplates";
import { useTemplateQuery } from "@/lib/hooks/useTemplates";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import type { SelectionConfig } from "@/lib/types/config";
import { useCallback, useMemo } from "react";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}


export default function Templatesage() {

  const { templates, refetch } = useInfiniteTemplates({
    limit: 20
  });

  const {
    createTemplate,
    updateTemplate,
    deleteMultipleTemplates
  } = useTemplateQuery();

  const gridItems = useMemo(() => {
    return templates?.map(template => ({
      _id: template._id,
      title: template.title,
      image: { src: "", alt: template.title },
      updatedAt: template.updatedAt,
      type: template ? "template" : "project",
    })) ?? [];
  }, [templates])


  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const socialMediaConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);



  const handleCreate = useCallback(async (item: { key?: string; label?: string; data?: { files?: FileList } }) => {
    try {
      if (!item.key) {
        throw new Error("No format key provided");
      }

      const templateData = createTemplateFactory(item.key, item.label);
      await createTemplate(templateData);
  

      // Optionally refetch to ensure UI is updated immediately
      refetch();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }, [createTemplate, createTemplateFactory, refetch]);

  // CRUD handlers for InteractiveGrid
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    await deleteMultipleTemplates(ids);
  }, [deleteMultipleTemplates]);

  const handleUpdateItem = useCallback(async (id: string, updates: { title?: string; name?: string }) => {
    const updateData: { title?: string } = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.name) updateData.title = updates.name; // Map name to title

    await updateTemplate({ id, data: updateData });
  }, [updateTemplate]);

  return (
    <SelectionProvider>
      <Section>
        <div className="flex items-center justify-between pb-10">
          <div>
            <h3 className="text-xl font-medium">
              My Templates
            </h3>
          </div>
          <CreateButton
            config={socialMediaConfig}
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
