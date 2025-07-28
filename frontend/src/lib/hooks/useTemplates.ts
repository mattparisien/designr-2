import { useToast } from '@/lib/hooks/useToast';
import { templatesAPI } from '../api/index';
import { type Template } from '@/lib/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useTemplateQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all templates
  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const data = await templatesAPI.getAll();
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching templates:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (templatesQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again later.",
        variant: "destructive"
      });
    }
  }, [templatesQuery.error, toast]);

  // Mutation for creating a new template
  const createTemplateMutation = useMutation({
    mutationFn: (newTemplate: Partial<Template>) => templatesAPI.create(newTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteTemplates'] });
      toast({
        title: "Success",
        description: "Template created successfully!",
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
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Template> }) =>
      templatesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteTemplates'] });
      toast({
        title: "Success",
        description: "Template updated successfully!",
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

  // Mutation for deleting a template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesAPI.delete(id),
    onSuccess: () => {
      // Invalidate both standard template queries and infinite template queries
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteTemplates'] });

      toast({
        title: "Success",
        description: "Template deleted successfully!",
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

  // Batch delete for multiple templates
  const deleteMultipleTemplatesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Using allSettled to allow some deletions to fail without failing the whole batch
      const results = await Promise.allSettled(ids.map(id => templatesAPI.delete(id)));

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
      // Invalidate both standard template queries and infinite template queries
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteTemplates'] });

      // Show appropriate message based on partial or complete success
      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} templates deleted. ${result.failed} operations failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: `${result.successful} ${result.successful === 1 ? 'template' : 'templates'} deleted successfully!`,
          variant: "default"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete templates. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    projects: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    deleteMultipleTemplates: deleteMultipleTemplatesMutation.mutateAsync,
  };
}

