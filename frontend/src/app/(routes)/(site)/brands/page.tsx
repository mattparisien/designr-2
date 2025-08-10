"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateAction } from "@/components/CreateAction";
import Heading from "@/components/Heading/Heading";
import { InteractiveGrid } from "@/components/InteractiveGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { DESIGN_FORMATS } from "@/lib/constants";
import { SelectionProvider } from "@/lib/context/selection-context";
import { createTemplate as createTemplateFactory } from "@/lib/factories";
import { useBrandQuery } from "@/lib/hooks/useBrands";
import { useInfiniteBrands } from "@/lib/hooks/useInfiniteBrands";
import { mapDesignFormatToSelectionConfig } from "@/lib/mappers";
import type { SelectionConfig } from "@/lib/types/config";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import CreateModalContent from "./components/ModalContent";

// Define the social media format type
interface SocialMediaFormat {
  width: number;
  height: number;
  name: string;
  category: string;
}

export default function BrandsPage() {

  const {
    brands,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteBrands({
    limit: 20
  });

  const {
    createBrand,
    updateBrand,
    deleteMultipleBrands
  } = useBrandQuery();

  const router = useRouter()

  const gridItems = useMemo(() => {
    return brands?.map(brand => ({
      id: brand.id,
      title: brand.name,
      image: { src: brand.logoUrl || "", alt: brand.name },
      updatedAt: brand.updatedAt,
      type: brand ? "brand" : "project",
    })) ?? [];
  }, [brands])



  // Transform DESIGN_FORMATS into a SelectionConfig for the grid
  const selectionConfig = useMemo<SelectionConfig>(() => {
    return mapDesignFormatToSelectionConfig(DESIGN_FORMATS as Record<string, SocialMediaFormat>);
  }, []);


  const handleCreate = useCallback(async (item: { key?: string; label?: string; data?: { files?: FileList } }) => {
    try {
      if (!item.key) {
        throw new Error("No format key provided");
      }

      const brandData = createTemplateFactory(item.key, item.label);
      const brand = await createBrand(brandData);

      // Optionally refetch to ensure UI is updated immediately
      router.push(`/editor/${brand.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }, [refetch, router,]);

  const handleFetchNextPage = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  // CRUD handlers for InteractiveGrid
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    await deleteMultipleBrands(ids);
    refetch();
  }, [deleteMultipleBrands, refetch]);

  const handleUpdateItem = useCallback(async (id: string, updates: { title?: string; name?: string }) => {
    const updateData: { title?: string } = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.name) updateData.title = updates.name; // Map name to title

    await updateBrand({ id, data: updateData });
  }, [updateBrand]);

  return (
    <SelectionProvider>
      <Section>
        <div className="pt-10 flex items-center justify-between pb-10">
          <div>
            <Heading
              as={1}
              styleLevel={3}
            >
              My Brands
            </Heading>
          </div>
          <CreateAction
            mode="modal"
            rightIcon={PlusIcon}
            content={<CreateModalContent />}
          />
        </div>
        <InteractiveGrid
          items={gridItems}
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


