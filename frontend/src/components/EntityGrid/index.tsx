// components/EntityGrid.tsx
"use client";
import { SOCIAL_FORMAT_CATEGORIES, SOCIAL_MEDIA_FORMATS, SocialFormat} from "@/app/(routes)/editor/[id]/lib/constants/socialFormats";
import InteractiveCard from "@/components/InteractiveCard/InteractiveCard";
import { LazyGrid } from "@/components/LazyGrid";
import { SelectionActionBar } from "@/components/SelectionActionBar";
import { ViewMode } from "@/components/StickyControlsBar";
import ListView from "@/components/ui/list-view";
import { Section } from "@/components/ui/section";
import { useSelection } from "@/lib/context/selection";
import { useEntityCrud } from "@/lib/hooks/useEntityCrud";
import { useInfiniteEntity } from "@/lib/hooks/useInfiniteEntity";
import { useToast } from "@/lib/hooks/useToast";
import { EntityConfig } from "@/lib/types/grid";
import { getRelativeTime } from "@/lib/utils";
import { upperFirst } from "lodash";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type BaseEntity = { _id: string; title?: string; starred?: boolean; thumbnailUrl?: string; type?: string; updatedAt?: string };

interface Props<T extends BaseEntity, F> {
  cfg: EntityConfig<T, F>;
  filters: F;
}

export function EntityGrid<T extends BaseEntity, F>({ cfg, filters }: Props<T, F>) {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedIds, clearSelection } = useSelection();

  const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useInfiniteEntity<T, F>(cfg, { limit: 12, filters });

  const {
    create: createEntity,
    update: updateEntity,
    remove: deleteEntity,
    removeMany: deleteManyEntities,
  } = useEntityCrud<T, F>(cfg);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreating, setIsCreating] = useState(false);

  const handleOpen = useCallback((id: string) => {
    router.push(`/editor/${id}`);
  }, [router]);

  const handleCreate = useCallback(async (format?: SocialFormat) => {


    if (!format) format = SOCIAL_MEDIA_FORMATS["custom"];

    try {
      setIsCreating(true);
      const payload = cfg.createFactory ? cfg.createFactory({ width: format?.width, height: format?.height }) : {};
      // Add format data to payload if provided
      if (format) {
        Object.assign(payload, { width: format.width, height: format.height, name: format.name });
      }
      const created = await createEntity(payload);
      router.push(`/editor/${created._id}`);
    } catch (e) {
      toast({
        title: "Error",
        description: `Failed to create ${cfg.nounSingular ?? "item"}.`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [cfg, createEntity, router, toast]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteEntity(id);
    refetch();
  }, [deleteEntity, refetch]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    try {
      toast({
        title: `Deleting ${selectedIds.length}…`,
        description: "Please wait.",
      });
      await (cfg.api.deleteMultiple
        ? cfg.api.deleteMultiple(selectedIds)
        : deleteManyEntities(selectedIds));

      clearSelection();
      setTimeout(() => refetch(), 300);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete some items.",
        variant: "destructive",
      });
      refetch();
    }
  }, [selectedIds, cfg.api, deleteManyEntities, clearSelection, refetch, toast]);

  const handleTitleChange = useCallback(async (id: string, newTitle: string) => {
    await updateEntity({ id, data: { title: newTitle } as Partial<T> });
    toast({ title: "Success", description: "Title updated" });
    refetch();
  }, [updateEntity, toast, refetch]);

  const renderGridItem = useCallback((item: T) => {
    return <InteractiveCard
      key={item._id}
      id={item._id}
      image={item.thumbnailUrl ? { src: item.thumbnailUrl, alt: item.title ?? "Thumbnail" } : undefined}
      title={item.title ?? "Untitled"}
      subtitleLeft={upperFirst(item.type ?? "")}
      subtitleRight={`Last updated ${getRelativeTime(item.updatedAt ?? "")}`}
      onClick={() => handleOpen(item._id)}
      onTitleChange={handleTitleChange}
    />
  }, [handleOpen, handleTitleChange]);

  const handleFetchNextPage = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  return (
    <>
      <Section>
        <div className="flex items-center justify-between pb-10">
          <div>
            <h3 className="text-xl font-medium">
              My {upperFirst(cfg.key)}
            </h3>
          </div>
          <div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center justify-center cursor-pointer hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg gap-1 "
                  disabled={isCreating}
                >
                  <span className="text-lg">{isCreating ? "Creating..." : "Create"}</span>
                  <ChevronDown className="text-neutral-400 w-5 h-5 mt-[3px]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-96 overflow-y-auto">
                  {SOCIAL_FORMAT_CATEGORIES.map((category) => (
                    <div key={category} className="p-3 border-b border-gray-100 last:border-b-0">
                      <h3 className="text-sm font-medium text-neutral-500 mb-2 px-3">{category}</h3>
                      <div className="space-y-1">
                        {Object.entries(SOCIAL_MEDIA_FORMATS)
                          .filter(([, format]) => format.category === category)
                          .map(([key, format]) => (
                            <button
                              key={key}
                              onClick={() => handleCreate(format)}
                              disabled={isCreating}
                              className="cursor-pointer w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="font-medium text-[0.97rem] text-black">{format.name}</div>
                              <div className="text-xs font-normal text-neutral-500">{format.width} × {format.height}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {!isLoading && isError && (
          <div>error</div>
          // <ErrorState onRetry={refetch} noun={cfg.nounSingular ?? "item"} />
        )}

        {!isError && (
          <>
            {viewMode === "grid" ? (
              <div className="space-y-6">
                <LazyGrid
                  items={items}
                  renderItem={renderGridItem}
                  loadMore={handleFetchNextPage}
                  hasMore={!!hasNextPage}
                  isLoading={isFetchingNextPage}
                  isInitialLoading={isLoading && items.length === 0}
                  loadingVariant="grid"
                  loadingText={`Loading your ${cfg.key}...`}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                />
              </div>
            ) : (
              <ListView
                getVisibleDesigns={() => items}
                handleOpenDesign={handleOpen}
                designs={items}
                handleDeleteDesign={handleDelete}
                // toggleStar etc—pass your own togglers if needed
                getDefaultThumbnail={(i: number) => `/placeholder${i % 2 === 0 ? ".jpg" : ".svg"}`}
                toggleDesignSelection={(id) => console.log("toggle", id)}
                isDesignSelected={(id) => selectedIds.includes(id)}
              />
            )}

            {items.length === 0 && !isLoading && (
              <div>hi</div>
              // <EmptyState
              //   noun={cfg.nounSingular ?? "item"}
              //   onCreate={() => handleCreate("custom")}
              //   isCreating={isCreating}
              // />
            )}
          </>
        )}
      </Section >

      <SelectionActionBar
        onDelete={handleDeleteSelected}
        onDuplicate={async () => Promise.resolve()}
        onMove={async () => Promise.resolve()}
        className="z-50 fixed bottom-10 left-1/2 transform -translate-x-1/2"
      />
    </>
  );
}

/* … add small ErrorState/EmptyState components or inline them … */
