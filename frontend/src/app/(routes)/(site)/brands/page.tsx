"use client";

// app/projects/page.tsx
// Full page using the generic EntityGrid + your Composition union split by role

import { CreateAction } from "@/components/CreateAction";
import Heading from "@/components/Heading/Heading";
import { InteractiveGrid } from "@/components/InteractiveGrid/InteractiveGrid";
import { Section } from "@/components/ui/section";
import { SelectionProvider } from "@/lib/context/selection-context";
import { useBrandQuery } from "@/lib/hooks/useBrands";
import { Brand } from "@/lib/types/brands";
import { useInfiniteBrands } from "@/lib/hooks/useInfiniteBrands";
import { PlusIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import CreateModalContent from "./components/ModalContent";

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
    updateBrand,
    deleteMultipleBrands
  } = useBrandQuery();

  const gridItems = useMemo(() => {
    return brands?.map(brand => {
      const first = Array.isArray(brand.palettes) && brand.palettes.length > 0 ? brand.palettes[0] : undefined;
      const c1 = first?.colors?.[0]?.hex || '#cccccc';
      const c2 = first?.colors?.[1]?.hex || '#eeeeee';
      const c3 = first?.colors?.[2]?.hex || '#999999';
      return {
        id: brand._id,
        title: brand.name,
        mediaComponent: (
          <div className="h-full w-full flex items-end absolute left-0 bottom-0">
            <div className="w-full h-3 flex">
              <div className="flex-1" style={{ backgroundColor: c1 }}></div>
              <div className="flex-1" style={{ backgroundColor: c2 }}></div>
              <div className="flex-1" style={{ backgroundColor: c3 }}></div>
            </div>
          </div>
        ),
        updatedAt: brand.updatedAt.toString(),
        type: brand ? "brand" : "project",
      }
    }) ?? [];
  }, [brands])

  const handleFetchNextPage = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  // CRUD handlers for InteractiveGrid
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    await deleteMultipleBrands(ids);
    refetch();
  }, [deleteMultipleBrands, refetch]);

  const handleUpdateItem = useCallback(async (id: string, updates: { title?: string; name?: string }) => {
    const updateData: Partial<Omit<Brand, '_id' | 'createdAt' | 'updatedAt' | 'userId'>> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.title) updateData.name = updates.title; // Map title to name

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
          collectionSlug="brands"
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


