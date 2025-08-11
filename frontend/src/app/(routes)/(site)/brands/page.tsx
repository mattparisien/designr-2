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
    return brands?.map(brand => {
      const palette = Array.isArray(brand.palettes) && brand.palettes.length > 0 ? brand.palettes[0] : { primary: '#cccccc', secondary: '#eeeeee', accent: '#999999' };
      return {
        id: brand._id,
        title: brand.name,
        mediaComponent: (
          <div className="h-full w-full flex items-end absolute left-0 bottom-0">
            <div className="w-full h-3 flex">
              <div className="flex-1" style={{
                backgroundColor: palette.primary
              }}></div>
              <div className="flex-1" style={{
                backgroundColor: palette.secondary
              }}></div>
              <div className="flex-1" style={{
                backgroundColor: palette.accent
              }}></div>
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


