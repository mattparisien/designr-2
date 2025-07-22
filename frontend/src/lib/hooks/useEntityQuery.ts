// src/lib/hooks/useEntityQuery.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/hooks/useToast";

type EntityAPI<T> = {
  getAll: () => Promise<T[]>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  // optional bulk delete; if missing we'll fall back to Promise.allSettled
  deleteMultiple?: (ids: string[]) => Promise<void>;
};

interface UseEntityQueryArgs<T> {
  key: string;              // 'templates' | 'projects' | 'compositions'
  infiniteKey?: string;     // 'infiniteTemplates' etc. (for invalidation)
  api: EntityAPI<T>;
}

export function useEntityQuery<T>({ key, infiniteKey, api }: UseEntityQueryArgs<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // -------- Query --------
  const listQuery = useQuery({
    queryKey: [key],
    queryFn: async () => {
      try {
        return (await api.getAll()) ?? [];
      } catch (err) {
        console.error(`Error fetching ${key}:`, err);
        return [];
      }
    },
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast({
        title: "Error",
        description: `Failed to load ${key}. Please try again later.`,
        variant: "destructive",
      });
    }
  }, [listQuery.error, toast, key]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [key] });
    if (infiniteKey) queryClient.invalidateQueries({ queryKey: [infiniteKey] });
  };

  // -------- Mutations --------
  const createMut = useMutation({
    mutationFn: (payload: Partial<T>) => api.create(payload),
    onSuccess: () => {
      invalidate();
      toast({ title: "Success", description: "Created successfully!" });
    },
    onError: () =>
      toast({ title: "Error", description: "Create failed.", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => api.update(id, data),
    onSuccess: () => {
      invalidate();
      toast({ title: "Success", description: "Updated successfully!" });
    },
    onError: () =>
      toast({ title: "Error", description: "Update failed.", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      invalidate();
      toast({ title: "Success", description: "Deleted successfully!" });
    },
    onError: () =>
      toast({ title: "Error", description: "Delete failed.", variant: "destructive" }),
  });

  const deleteManyMut = useMutation({
    mutationFn: async (ids: string[]) => {
      if (api.deleteMultiple) {
        await api.deleteMultiple(ids);
        return { successful: ids.length, failed: 0 };
      }
      const results = await Promise.allSettled(ids.map(api.delete));
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - successful;
      if (!successful && failed) throw new Error("All deletions failed");
      return { successful, failed };
    },
    onSuccess: ({ successful, failed }) => {
      invalidate();
      toast({
        title: failed ? "Partial Success" : "Success",
        description: failed
          ? `${successful} deleted, ${failed} failed.`
          : `${successful} deleted successfully!`,
      });
    },
    onError: () =>
      toast({ title: "Error", description: "Batch delete failed.", variant: "destructive" }),
  });

  return {
    data: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    create: createMut.mutateAsync,
    update: updateMut.mutateAsync,
    remove: deleteMut.mutateAsync,
    removeMany: deleteManyMut.mutateAsync,
  };
}
