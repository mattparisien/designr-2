"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateButton } from "@/components/CreateButton";
import Heading from "@/components/Heading/Heading";
import { InteractiveGrid } from "@/components/InteractiveGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { createTemplate as createTemplateFactory } from "@/lib/factories";
import { useInfiniteTemplates } from "@/lib/hooks/useInfiniteTemplates";
import { useTemplateQuery } from "@/lib/hooks/useTemplates";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import type { SelectionConfig } from "@/lib/types/config";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}

export default function TemplatesPage() {

  const {
    templates,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteTemplates({
    limit: 20
  });

  const {
    createTemplate,
    updateTemplate,
    deleteMultipleTemplates
  } = useTemplateQuery();

  const router = useRouter()

  const gridItems = useMemo(() => {
    return templates?.map(template => ({
      id: template.id,
      title: template.title,
      image: { src: template.thumbnailUrl, alt: template.title },
      updatedAt: template.updatedAt,
      type: template ? "template" : "project",
    })) ?? [];
  }, [templates])



  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const selectionConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);


  const handleCreate = useCallback(async (item: { key?: string; label?: string; data?: { files?: FileList } }) => {
    try {
      if (!item.key) {
        throw new Error("No format key provided");
      }

      const templateData = createTemplateFactory(item.key, item.label);
      const template = await createTemplate(templateData);



      // Optionally refetch to ensure UI is updated immediately
      router.push(`/editor/${template.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }, [createTemplate, refetch, router,]);

  const handleFetchNextPage = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  // CRUD handlers for InteractiveGrid
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    await deleteMultipleTemplates(ids);
    refetch();
  }, [deleteMultipleTemplates, refetch]);

  const handleUpdateItem = useCallback(async (id: string, updates: { title?: string; name?: string }) => {
    const updateData: { title?: string } = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.name) updateData.title = updates.name; // Map name to title

    await updateTemplate({ id, data: updateData });
  }, [updateTemplate]);

  return (
    <SelectionProvider>
      <Section>
        <div className="pt-10 flex items-center justify-between pb-10">
          <div>
            <Heading
              as={1}
              styleLevel={3}
            >
              My Templates
            </Heading>
          </div>
          <CreateButton
            config={selectionConfig}
            onCreate={handleCreate}
          />
        </div>
        <InteractiveGrid
          items={gridItems}
          collectionSlug="templates"
          onDeleteItems={handleDeleteItems}
          onUpdateItem={handleUpdateItem}
          isLoading={isFetchingNextPage}
          isInitialLoading={isLoading}
          hasMore={hasNextPage}
          onFetchNextPage={handleFetchNextPage}
        />
      </Section>
    </SelectionProvider>
  );
}


