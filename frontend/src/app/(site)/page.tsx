"use client"

import InteractiveCard from "@/components/InteractiveCard/InteractiveCard"
import { SelectionActionBar } from "@/components/SelectionActionBar"
import { ViewMode } from "@/components/StickyControlsBar"
import { Button } from "@/components/ui/button"
import { SelectionProvider } from "@/lib/context/selection"
import { useToast } from "@/lib/hooks/useToast"
import { useState, useCallback } from "react"
import { useInfiniteTemplates } from "@/lib/hooks/useInfiniteTemplates"
import { useTemplateQuery } from "@/lib/hooks/useTemplates"
import { useRouter } from "next/navigation"
import { useSelection } from "@/lib/context/selection"
import Image from "next/image"
import { Section } from "@/components/ui/section"
import { getRelativeTime } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { type Template } from "@/lib/types/api"
import { StickyControlsBar } from "@/components/StickyControlsBar"
import { upperFirst } from "lodash"
import { Filter, SlidersHorizontal, Plus } from "lucide-react"
import { LazyGrid } from "@/components/LazyGrid"
import ListView from "@/components/ui/list-view"
import { 
  createDefaultTemplate, 
  createSocialMediaTemplate, 
  createPresentationTemplate, 
  createPrintTemplate 
} from "@/app/editor/[id]/lib/factories/elementFactory"


// export default function TemplatesPage() {
//   const [projects, setProjects] = useState<Project[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const { toast } = useToast();

//   useEffect(() => {
//     // Mock fetch projects
//     const mockProjects = [
//       {
//         id: "1",
//         title: "Marketing Campaign",
//         thumbnail: "/placeholder.jpg",
//         updatedAt: "2023-05-10T14:48:00.000Z",
//       },
//       {
//         id: "2",
//         title: "Brand Guidelines",
//         thumbnail: "/placeholder.jpg",
//         updatedAt: "2023-05-09T10:30:00.000Z",
//       },
//       {
//         id: "3",
//         title: "Social Media Pack",
//         thumbnail: "/placeholder.jpg",
//         updatedAt: "2023-05-08T09:15:00.000Z",
//       },
//       {
//         id: "4",
//         title: "Product Launch",
//         thumbnail: "/placeholder.jpg",
//         updatedAt: "2023-05-07T16:22:00.000Z",
//       },
//     ]

//     setProjects(mockProjects)
//     setIsLoading(false)
//   }, [])

//   const handleSelectProject = (id: string, isSelected: boolean) => {
//     console.log(`Project ${id} is ${isSelected ? "selected" : "unselected"}`)
//   }

//   const handleOpenProject = (id: string) => {
//     console.log(`Opening project ${id}`)
//     // Navigate to project
//   }

//   const handleDeleteSelected = async () => {
//     // In a real implementation, you'd call your API to delete the projects
//     console.log("Delete selected projects")
//     return Promise.resolve();
//   }

//   const handleDuplicateSelected = async () => {
//     console.log("Duplicate selected projects")
//     return Promise.resolve();
//   }

//   const handleMoveSelected = async () => {
//     console.log("Move selected projects")
//     return Promise.resolve();
//   }

//   // Handle project title update
//   const handleTitleChange = async (id: string, newTitle: string) => {
//     try {
//       // Call API to update project title
//       //   await apiClient.updateTemplate(id, { title: newTitle });

//       // Update the project title in the local state
//       setProjects(prevProjects =>
//         prevProjects.map(project =>
//           project.id === id
//             ? { ...project, title: newTitle }
//             : project
//         )
//       );

//       // Show success toast
//       toast({
//         title: "Success",
//         description: "Project title updated successfully",
//       });
//     } catch (error) {
//       console.error("Failed to update project title:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update project title. Please try again.",
//         variant: "destructive"
//       });
//     }
//   };

//   const formatUpdatedAt = (dateString: string) => {
//     const date = new Date(dateString)
//     return new Intl.DateTimeFormat("en-US", {
//       month: "short",
//       day: "numeric",
//     }).format(date)
//   }

//   if (isLoading) {
//     return <div className="p-8">Loading projects...</div>
//   }

//   return (
//     <SelectionProvider>
//       <div className="p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">My Templates</h1>
//           <Button>Create New Project</Button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {projects.map((project) => (
//             <InteractiveCard
//               key={project.id}
//               id={project.id}
//               image={{
//                 src: project.thumbnail,
//                 alt: project.title,
//               }}
//               title={project.title}
//               subtitleLeft="Project"
//               subtitleRight={formatUpdatedAt(project.updatedAt)}
//               onClick={() => handleOpenProject(project.id)}
//               onSelect={handleSelectProject}
//               onTitleChange={handleTitleChange}
//             />
//           ))}
//         </div>

//         <SelectionActionBar
//           onDelete={handleDeleteSelected}
//           onDuplicate={handleDuplicateSelected}
//           onMove={handleMoveSelected}
//         />
//       </div>
//     </SelectionProvider>
//   )
// }

// Main Dashboard component that wraps everything with SelectionProvider
export default function TemplatesPage() {
  return (
    <SelectionProvider>
      <Grid />
    </SelectionProvider>
  )
}

// Inner content component that can safely use the useSelection hook
function Grid() {
  const router = useRouter()
  const { toast } = useToast()
  const { selectedIds, clearSelection } = useSelection();
  const {
    createTemplate,
    deleteTemplate,
    deleteMultipleTemplates,
    updateTemplate
  } = useTemplateQuery()

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [activeTab] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery] = useState<string>("")

  // Build filters for infinite query based on active tab and search query
  const filters = {
    ...(activeTab === "starred" ? { starred: true } : {}),
    ...(activeTab === "shared" ? { shared: true } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  }

  // Use our new infinite templates hook
  const {
    templates,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteTemplates({
    limit: 12,
    filters
  })

  // Create a wrapper function for fetchNextPage to match the expected loadMore type signature
  const handleFetchNextPage = useCallback(async () => {
    await fetchNextPage();
    // Return void to match the expected type
    return;
  }, [fetchNextPage]);


  // Open existing template
  const handleOpenTemplate = useCallback((id: string) => {
    router.push(`/editor/${id}`)
  }, [router])

  // Create new template
  const handleCreateTemplate = useCallback(async (templateType: "custom" | "social" | "presentation" | "print" = "custom") => {
    try {
      setIsCreating(true)
      
      // Use the appropriate factory function based on template type
      let newTemplate;
      switch (templateType) {
        case "social":
          newTemplate = createSocialMediaTemplate("instagram");
          break;
        case "presentation":
          newTemplate = createPresentationTemplate();
          break;
        case "print":
          newTemplate = createPrintTemplate("letter");
          break;
        default:
          newTemplate = createDefaultTemplate({
            title: "Untitled Template",
            description: "",
            type: "custom",
            category: "custom",
            author: "current-user",
            canvasWidth: 800,
            canvasHeight: 600
          });
      }
      
      const template = await createTemplate(newTemplate)
      router.push(`/editor/${template._id}`)
    } catch (error) {
      console.error("Failed to create template:", error)
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }, [createTemplate, router, toast, setIsCreating])

  // Handle create template button click
  const handleCreateTemplateClick = useCallback(() => {
    handleCreateTemplate("custom");
  }, [handleCreateTemplate])  // Handle template deletion
  const handleDeleteTemplate = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    await deleteTemplate(id)
    // Refresh the data after deletion
    refetch()
  }, [deleteTemplate, refetch])

  // Handle star toggling
  const handleToggleStar = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    const template = templates.find(p => p._id === id)
    if (!template) return
    
    // Update the template with the new starred status
    await updateTemplate({ id, data: { starred: !template.starred } })
    // Refresh the data after starring
    refetch()
  }, [templates, updateTemplate, refetch])

  // Handle deleting multiple templates with better error handling and UI updates
  const handleDeleteSelectedTemplates = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      // Show a loading toast
      toast({
        title: "Deleting templates...",
        description: `Deleting ${selectedIds.length} selected templates.`
      });

      // Delete the templates
      await deleteMultipleTemplates(selectedIds);

      // Clear the selection after successful deletion
      clearSelection();

      // Force refresh the data - using an immediate refetch after deletion
      // This ensures the UI is updated even if cache invalidation is delayed
      setTimeout(() => {
        refetch();
      }, 300); // Small delay to ensure the backend has processed the deletion

    } catch (error) {
      console.error("Error deleting projects:", error);

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete one or more projects.",
        variant: "destructive"
      });

      // Still try to refresh the data to get the current state
      refetch();
    }
  }, [deleteMultipleTemplates, refetch, selectedIds, toast, clearSelection]);

  // Handle template title change
  const handleTitleChange = useCallback(async (id: string, newTitle: string) => {

    try {
      const templateToUpdate = templates.find(p => p._id === id);
      if (!templateToUpdate) return;

      await updateTemplate({ id, data: { title: newTitle } });

      // Show success toast
      toast({
        title: "Success",
        description: "Project title updated successfully",
      });

      // Refresh the project list
      refetch();
    } catch (error) {
      console.error("Failed to update project title:", error);
      toast({
        title: "Error",
        description: "Failed to update project title. Please try again.",
        variant: "destructive"
      });
    }
  }, [templates, updateTemplate, refetch, toast]);

  // Render a grid item for LazyGrid
  const renderGridItem = useCallback((template: Template) => {
    return (
      <InteractiveCard
        key={template._id}
        id={template._id}
        image={template.thumbnail ? {
          src: template.thumbnail,
          alt: template.title || "Template thumbnail"
        } : undefined}
        title={template.title || "Untitled Template"}
        subtitleLeft={upperFirst(template.type)}
        subtitleRight={`Last updated ${getRelativeTime(template.updatedAt)}`}
        onClick={() => handleOpenTemplate(template._id)}
        onSelect={(id, isSelected) => {
          console.log(`Template ${id} selection state: ${isSelected}`);
        }}
        onTitleChange={handleTitleChange}
      />
    );
  }, [handleOpenTemplate, handleTitleChange]);

  return (
    <>
      {/* All Designs */}
      <Section heading="My Designs">

        {/* Sticky Controls Bar */}
        <StickyControlsBar
          showCondition={templates.length > 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          customActions={[
            {
              icon: Filter,
              label: "Filter",
              onClick: () => {
                // TODO: Implement filter functionality
                console.log("Filter clicked");
              },
            },
            {
              icon: SlidersHorizontal,
              label: "Sort",
              onClick: () => {
                // TODO: Implement sort functionality
                console.log("Sort clicked");
              },
            }
          ]}
        />

        {/* Loading state */}
        {/* Removed - now handled inside LazyGrid */}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-red-100 p-6 mb-4">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Failed to Load Projects</h3>
            <p className="text-gray-500 mb-6 max-w-sm">There was an error loading your projects. Please try again.</p>
            <Button
              onClick={() => refetch()}
              className="rounded-2xl"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Content - LazyGrid now handles its own loading states */}
        {!isError ? (
          <>
            {viewMode === "grid" ? (
              <div className="space-y-6">
                <LazyGrid
                  items={templates}
                  renderItem={renderGridItem}
                  loadMore={handleFetchNextPage}
                  hasMore={!!hasNextPage}
                  isLoading={isFetchingNextPage}
                  isInitialLoading={isLoading && templates.length === 0}
                  loadingVariant="grid"
                  loadingText="Loading your templates..."
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                />
              </div>
            ) : (
              <ListView
                getVisibleDesigns={() => templates}
                handleOpenDesign={handleOpenTemplate}
                designs={templates}
                handleDeleteDesign={handleDeleteTemplate}
                toggleStar={handleToggleStar}
                getDefaultThumbnail={(index: number) => `/placeholder${index % 2 === 0 ? '.jpg' : '.svg'}`}
                toggleDesignSelection={(id) => {
                  // Handle selection toggle here
                  console.log(`Toggling selection for ${id}`);
                }}
                isDesignSelected={(id) => {
                  // Check if the design is selected
                  return selectedIds.includes(id);
                }}
              />
            )}

            {/* Empty state */}
            {templates.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-blue">
                    <path
                      d="M13 7L11.8845 4.76893C11.5634 4.1261 11.4029 3.80468 11.1634 3.57411C10.9516 3.37225 10.6963 3.21936 10.4161 3.12542C10.0992 3.02 9.74021 3.02 9.02229 3.02H5.2C4.0799 3.02 3.51984 3.02 3.09202 3.24327C2.71569 3.43861 2.41859 3.73571 2.22325 4.11204C2 4.53986 2 5.09992 2 6.22V17.78C2 18.9001 2 19.4602 2.22325 19.888C2.41859 20.2643 2.71569 20.5614 3.09202 20.7568C3.51984 20.98 4.0799 20.98 5.2 20.98H18.8C19.9201 20.98 20.4802 20.98 20.908 20.7568C21.2843 20.5614 21.5814 20.2643 21.7768 19.888C22 19.4602 22 18.9001 22 17.78V10.02C22 8.89992 22 8.33986 21.7768 7.91204C21.5814 7.53571 21.2843 7.23861 20.908 7.04327C20.4802 6.82 19.9201 6.82 18.8 6.82H13ZM13 7H8.61687C8.09853 7 7.83936 7 7.61522 6.9023C7.41806 6.81492 7.25028 6.67546 7.13348 6.49934C7 6.29918 7 6.03137 7 5.49574C7 4.96012 7 4.6923 7.13348 4.49214C7.25028 4.31603 7.41806 4.17657 7.61522 4.08919C7.83936 3.99149 8.09853 3.99149 8.61687 3.99149H9.02229C9.74021 3.99149 10.0992 3.99149 10.4161 4.09692C10.6963 4.19085 10.9516 4.34374 11.1634 4.54561C11.4029 4.77618 11.5634 5.0976 11.8845 5.74043L13 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">No projects found</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  {activeTab === "all"
                    ? "You haven't created any projects yet. Create your first one now!"
                    : activeTab === "starred"
                      ? "You haven't starred any projects yet."
                      : activeTab === "shared"
                        ? "You don't have any shared projects."
                        : "No recent projects found."}
                </p>
                <Button
                  onClick={handleCreateTemplateClick}
                  disabled={isCreating}
                  className="rounded-2xl font-medium py-3 h-auto"
                >
                  {isCreating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Create Project
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : null}
      </Section>

      {/* Recently Used Templates */}
      {<Section heading="Recently Used Templates">
        {/* Recently used templates section */}
        {activeTab === "all" &&  (
          <div className="mt-16">
            <h1 className="text-3xl font-bold tracking-tight mb-4 text-black">Recently Used Templates</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="cursor-pointer overflow-hidden group h-40 transition-all rounded-2xl border-gray-100">
                  <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <Image
                      src={`/placeholder${item % 2 === 0 ? '.jpg' : '.svg'}`}
                      alt={`Template ${item}`}
                      width={200}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/70 to-brand-teal/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button size="sm" variant="secondary" className="bg-white hover:bg-white/90 text-sm rounded-xl">
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Section>}


      {/* Selection Actions */}
      <SelectionActionBar
        onDelete={handleDeleteSelectedTemplates}
        onDuplicate={async () => {
          console.log("Duplicate selected templates");
          return Promise.resolve();
        }}
        onMove={async () => {
          console.log("Move selected templates");
          return Promise.resolve();
        }}
        className="z-50"
      />
    </>
  );
}