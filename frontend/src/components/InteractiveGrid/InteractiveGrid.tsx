// components/EntityGrid.tsx
"use client";
import InteractiveCard from "@/components/InteractiveCard/InteractiveCard";
import { LazyGrid } from "@/components/LazyGrid";
import { SelectionActionBar } from "@/components/SelectionActionBar";
import { useSelection } from "@/lib/context/selection-context";
import { useToast } from "@/lib/hooks/useToast";
import { getRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// Simple utility function to replace lodash upperFirst
export const upperFirst = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

interface InteractiveGridItem {
  id: string;
  image?: { src: string; alt: string };
  title?: string;
  name?: string;
  type?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  subtitleLeft?: string;
  subtitleRight?: string;
  disableClick?: boolean;
  onClick?: () => void;
  onTitleChange?: (newTitle: string) => void;
}

interface InteractiveGridProps {
  items: InteractiveGridItem[];
  onDeleteItems?: (ids: string[]) => Promise<void>;
  onDeleteItem?: (id: string) => Promise<void>;
  onUpdateItem?: (id: string, updates: Partial<InteractiveGridItem>) => Promise<void>;
  onDuplicateItems?: (ids: string[]) => Promise<void>;
  onMoveItems?: (ids: string[]) => Promise<void>;
  onFetchNextPage?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  isInitialLoading?: boolean;
}


export function InteractiveGrid({
  items,
  onDeleteItems,
  onUpdateItem,
  onDuplicateItems,
  onMoveItems,
  onFetchNextPage,
  hasMore = false,
  isLoading = false,
  isInitialLoading = false,
}: InteractiveGridProps) {
  console.log(items);
  const router = useRouter();
  const { toast } = useToast();
  const { selectedIds, clearSelection } = useSelection();

  const handleOpen = useCallback((id: string) => {
    router.push(`/editor/${id}`);
  }, [router]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length || !onDeleteItems) return;
    try {
      toast({
        title: `Deleting ${selectedIds.length} items`,
        description: "Please wait.",
      });

      await onDeleteItems(selectedIds);
      clearSelection();

      toast({
        title: "Success",
        description: `Deleted ${selectedIds.length} items successfully.`,
      });
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Error",
        description: "Failed to delete some items.",
        variant: "destructive",
      });
    }
  }, [selectedIds, onDeleteItems, clearSelection, toast]);

  const handleTitleChange = useCallback(async (id: string, newTitle: string) => {
    if (!onUpdateItem) return;
    try {
      await onUpdateItem(id, { title: newTitle, name: newTitle });
      toast({
        title: "Success",
        description: "Title updated successfully.",
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Error",
        description: "Failed to update title.",
        variant: "destructive",
      });
    }
  }, [onUpdateItem, toast]);

  const renderGridItem = useCallback((item: InteractiveGridItem) => {
    return <InteractiveCard
      key={item.id}
      id={item.id}
      image={item.thumbnailUrl ? { src: item.thumbnailUrl, alt: item.title ?? item.name ?? "Thumbnail" } : undefined}
      title={item.name ?? item.title ?? "Untitled"}
      disableClick={false}
      subtitleLeft={upperFirst(item.type ?? "")}
      subtitleRight={`Last updated ${getRelativeTime(item.updatedAt ?? "")}`}
      onClick={() => handleOpen(item.id)}
      onTitleChange={(newTitle) => handleTitleChange(item.id, newTitle)}
    />
  }, [handleOpen, handleTitleChange]);

  const handleFetchNextPage = useCallback(async () => {
    if (onFetchNextPage) {
      await onFetchNextPage();
    }
  }, [onFetchNextPage]);

  return (
    <>
      <div className="space-y-6">
        <LazyGrid
          items={items}
          renderItem={renderGridItem}
          loadMore={handleFetchNextPage}
          hasMore={hasMore}
          isLoading={isLoading}
          isInitialLoading={isInitialLoading}
          loadingVariant="grid"
          loadingText="Loading your items..."
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
        />
      </div>
      
      <SelectionActionBar
        onDelete={handleDeleteSelected}
        onDuplicate={onDuplicateItems ? async () => {
          if (selectedIds.length && onDuplicateItems) {
            await onDuplicateItems(selectedIds);
          }
        } : undefined}
        onMove={onMoveItems ? async () => {
          if (selectedIds.length && onMoveItems) {
            await onMoveItems(selectedIds);
          }
        } : undefined}
        className="z-50 fixed bottom-10 left-1/2 transform -translate-x-1/2"
      />
    </>
  );
}
