import { useToast } from '@/lib/hooks/useToast';
import { Brand } from '../types/brands';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { brandsAPI } from '../api/index';

export function useBrandQuery(brandId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all brands
  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        const data = await brandsAPI.getAll();
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching brands:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for fetching a single brand by id (enabled only if brandId provided)
  const brandByIdQuery = useQuery({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      if (!brandId) return null; // explicit null
      try {
        const brand = await brandsAPI.getById(brandId);
        console.log('the brand', brand); 
        return brand ?? null; // never undefined
      } catch (e) {
        console.error('Error fetching brand by id', brandId, e);
        return null; // fallback to null on error
      }
    },
    enabled: !!brandId,
    gcTime: 5 * 60 * 1000,
  });

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (brandsQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load brands. Please try again later.",
        variant: "destructive"
      });
    }
  }, [brandsQuery.error, toast]);

  // Mutation for creating a new brand
  const createBrandMutation = useMutation({
    mutationFn: (newBrand: Partial<Omit<Brand, '_id' | 'createdAt' | 'updatedAt' | 'userId'>>) => brandsAPI.create(newBrand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteBrands'] });
      if (brandId) queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      toast({
        title: "Success",
        description: "Brand created successfully!",
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
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Omit<Brand, '_id' | 'createdAt' | 'updatedAt' | 'userId'>> }) =>
      brandsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteBrands'] });
      if (brandId) queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      toast({
        title: "Success",
        description: "Brand updated successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brand. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a brand
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandsAPI.delete(id),
    onSuccess: () => {
      // Invalidate both standard brand queries and infinite brand queries
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteBrands'] });
      if (brandId) queryClient.invalidateQueries({ queryKey: ['brand', brandId] });

      toast({
        title: "Success",
        description: "Brand deleted successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete brand. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Batch delete for multiple templates
  const deleteMultipleBrandsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Using allSettled to allow some deletions to fail without failing the whole batch
      const results = await Promise.allSettled(ids.map(id => brandsAPI.delete(id)));

      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // If all failed, throw an error
      if (successful === 0 && failed > 0) {
        throw new Error('Failed to delete any brands');
      }

      // Return summary
      return { successful, failed, total: ids.length };
    },
    onSuccess: (result) => {
      // Invalidate both standard template queries and infinite template queries
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteBrands'] });
      if (brandId) queryClient.invalidateQueries({ queryKey: ['brand', brandId] });

      // Show appropriate message based on partial or complete success
      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} brands deleted. ${result.failed} operations failed.`,
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
        description: "Failed to delete brands. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    projects: brandsQuery.data || [], // backward compatibility
    brands: brandsQuery.data || [],
    brand: brandByIdQuery.data,
    isLoadingBrand: brandByIdQuery.isLoading,
    isLoading: brandsQuery.isLoading,
    isError: brandsQuery.isError,
    createBrand: createBrandMutation.mutateAsync,
    updateBrand: updateBrandMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
    deleteMultipleBrands: deleteMultipleBrandsMutation.mutateAsync,
  };
}

