"use client"

import InteractiveCard from "@/components/InteractiveCard/InteractiveCard"
import { SelectionActionBar } from "@/components/SelectionActionBar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/useToast"
import { apiClient } from "../lib/api"
import { SelectionProvider } from "@/lib/context/selection"
import { useEffect, useState } from "react"

// Mock project type for demonstration
interface Project {
  id: string
  title: string
  thumbnail: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast();

  useEffect(() => {
    // Mock fetch projects
    const mockProjects = [
      {
        id: "1",
        title: "Marketing Campaign",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-10T14:48:00.000Z",
      },
      {
        id: "2",
        title: "Brand Guidelines",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-09T10:30:00.000Z",
      },
      {
        id: "3",
        title: "Social Media Pack",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-08T09:15:00.000Z",
      },
      {
        id: "4",
        title: "Product Launch",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-07T16:22:00.000Z",
      },
    ]

    setProjects(mockProjects)
    setIsLoading(false)
  }, [])

  const handleSelectProject = (id: string, isSelected: boolean) => {
    console.log(`Project ${id} is ${isSelected ? "selected" : "unselected"}`)
  }

  const handleOpenProject = (id: string) => {
    console.log(`Opening project ${id}`)
    // Navigate to project
  }

  const handleDeleteSelected = async () => {
    // In a real implementation, you'd call your API to delete the projects
    console.log("Delete selected projects")
    return Promise.resolve();
  }

  const handleDuplicateSelected = async () => {
    console.log("Duplicate selected projects")
    return Promise.resolve();
  }

  const handleMoveSelected = async () => {
    console.log("Move selected projects")
    return Promise.resolve();
  }

  // Handle project title update
  const handleTitleChange = async (id: string, newTitle: string) => {
    try {
      // Call API to update project title
    //   await apiClient.updateTemplate(id, { title: newTitle });

      // Update the project title in the local state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === id
            ? { ...project, title: newTitle }
            : project
        )
      );

      // Show success toast
      toast({
        title: "Success",
        description: "Project title updated successfully",
      });
    } catch (error) {
      console.error("Failed to update project title:", error);
      toast({
        title: "Error",
        description: "Failed to update project title. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>
  }

  return (
    <SelectionProvider>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <Button>Create New Project</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <InteractiveCard
              key={project.id}
              id={project.id}
              image={{
                src: project.thumbnail,
                alt: project.title,
              }}
              title={project.title}
              subtitleLeft="Project"
              subtitleRight={formatUpdatedAt(project.updatedAt)}
              onClick={() => handleOpenProject(project.id)}
              onSelect={handleSelectProject}
              onTitleChange={handleTitleChange}
            />
          ))}
        </div>

        <SelectionActionBar
          onDelete={handleDeleteSelected}
          onDuplicate={handleDuplicateSelected}
          onMove={handleMoveSelected}
        />
      </div>
    </SelectionProvider>
  )
}