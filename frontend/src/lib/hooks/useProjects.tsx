import { useToast } from '@/lib/hooks/useToast';
import { projectsAPI } from '../api/index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DesignProject } from '@shared/types';

export function useProjectQuery(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const data = await projectsAPI.getAll();
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching projects:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Single project query (auto when projectId provided)
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project id');
      return projectsAPI.getById(projectId);
    },
    enabled: !!projectId,
    initialData: () => {
      if (!projectId) return undefined;
      const list = queryClient.getQueryData<DesignProject[]>(['projects']);
      return list?.find(p => p.id === projectId);
    },
    staleTime: 60_000,
  });

  // Error toast for single project
  useEffect(() => {
    if (projectQuery.error) {
      toast({
        title: 'Error',
        description: 'Failed to load project.',
        variant: 'destructive'
      });
    }
  }, [projectQuery.error, toast]);

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (projectsQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive"
      });
    }
  }, [projectsQuery.error, toast]);

  // Mutation for creating a new project
  const createProjectMutation = useMutation({
    mutationFn: (newProject: Partial<DesignProject>) => projectsAPI.create(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });
      toast({
        title: "Success",
        description: "Project created successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating a project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<DesignProject> }) => projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });
      toast({
        title: "Success",
        description: "Project updated successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      // Invalidate both standard project queries and infinite project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });

      toast({
        title: "Success",
        description: "Project deleted successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  });


  // Batch delete for multiple projects
  const deleteMultipleProjectsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Using allSettled to allow some deletions to fail without failing the whole batch
      const results = await Promise.allSettled(ids.map(id => projectsAPI.delete(id)));

      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // If all failed, throw an error
      if (successful === 0 && failed > 0) {
        throw new Error('Failed to delete any projects');
      }

      // Return summary
      return { successful, failed, total: ids.length };
    },
    onSuccess: (result) => {
      // Invalidate both standard project queries and infinite project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });

      // Show appropriate message based on partial or complete success
      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} projects deleted. ${result.failed} operations failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: `${result.successful} ${result.successful === 1 ? 'project' : 'projects'} deleted successfully!`,
          variant: "default"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete projects. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Single project fetch helper (cache-aware)
  const getProjectById = async (id: string): Promise<DesignProject | undefined> => {
    // Try existing cached list first
    const list = queryClient.getQueryData<DesignProject[]>(['projects']);
    const inList = list?.find(p => p.id === id);
    if (inList) return inList;
    // Use / populate individual cache entry
    try {
      return await queryClient.fetchQuery({
        queryKey: ['project', id],
        queryFn: () => projectsAPI.getById(id),
        staleTime: 60_000, // 1 min
      });
    } catch (e) {
      console.error('Error fetching project by id', e);
      toast({ title: 'Error', description: 'Unable to load project.', variant: 'destructive' });
      return undefined;
    }
  };

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    project: projectQuery.data,
    isProjectLoading: projectQuery.isLoading,
    isProjectError: projectQuery.isError,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    deleteMultipleProjects: deleteMultipleProjectsMutation.mutateAsync,
    getProjectById,
  };
}
