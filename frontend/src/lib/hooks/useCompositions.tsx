import { useToast } from "@/lib/hooks/useToast";
import { compositionAPI } from "@/lib/api/index";          // your CompositionAPI instance
import { type Composition } from "@/lib/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCompositionQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ----- Query -----
  const compositionsQuery = useQuery({
    queryKey: ["compositions"],
    queryFn: async () => {
      try {
        const data = await compositionAPI.getAll();
        return data ?? [];
      } catch (err) {
        console.error("Error fetching compositions:", err);
        return [];
      }
    },
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (compositionsQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load compositions. Please try again later.",
        variant: "destructive",
      });
    }
  }, [compositionsQuery.error, toast]);

  // ----- Mutations -----
  const createCompositionMutation = useMutation({
    mutationFn: (payload: Partial<Composition>) => compositionAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compositions"] });
      toast({ title: "Success", description: "Composition created successfully!" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to create composition. Please try again.",
        variant: "destructive",
      }),
  });

  const updateCompositionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Composition> }) =>
      compositionAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compositions"] });
      toast({ title: "Success", description: "Composition updated successfully!" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to update composition. Please try again.",
        variant: "destructive",
      }),
  });

  const deleteCompositionMutation = useMutation({
    mutationFn: (id: string) => compositionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compositions"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteCompositions"] });
      toast({ title: "Success", description: "Composition deleted successfully!" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to delete composition. Please try again.",
        variant: "destructive",
      }),
  });

  const deleteMultipleCompositionsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => compositionAPI.delete(id)));
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - successful;
      if (successful === 0 && failed > 0) throw new Error("Failed to delete any compositions");
      return { successful, failed, total: ids.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["compositions"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteCompositions"] });

      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} compositions deleted. ${result.failed} failed.`,
        });
      } else {
        toast({
          title: "Success",
          description: `${result.successful} ${
            result.successful === 1 ? "composition" : "compositions"
          } deleted successfully!`,
        });
      }
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to delete compositions. Please try again.",
        variant: "destructive",
      }),
  });

  return {
    compositions: compositionsQuery.data ?? [],
    isLoading: compositionsQuery.isLoading,
    isError: compositionsQuery.isError,
    createComposition: createCompositionMutation.mutateAsync,
    updateComposition: updateCompositionMutation.mutateAsync,
    deleteComposition: deleteCompositionMutation.mutateAsync,
    deleteMultipleCompositions: deleteMultipleCompositionsMutation.mutateAsync,
  };
}
