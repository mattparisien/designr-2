import { useToast } from '@/lib/hooks/useToast';
import { chatSessionAPI } from '../api/index';
import { type ChatSession } from '@/lib/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useChatSessionQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all chat sessions
  const chatSessionsQuery = useQuery({
    queryKey: ['chatSessions'],
    queryFn: async () => {
      try {
        const data = await chatSessionAPI.getAll();
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (chatSessionsQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load chat sessions. Please try again later.",
        variant: "destructive"
      });
    }
  }, [chatSessionsQuery.error, toast]);

  // Mutation for creating a new chat session
  const createChatSessionMutation = useMutation({
    mutationFn: (newChatSession: Partial<ChatSession>) => chatSessionAPI.create(newChatSession),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteChatSessions'] });
      toast({
        title: "Success",
        description: "Chat session created successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating a chat session
  const updateChatSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<ChatSession> }) =>
      chatSessionAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteChatSessions'] });
      toast({
        title: "Success",
        description: "Chat session updated successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a chat session
  const deleteChatSessionMutation = useMutation({
    mutationFn: (id: string) => chatSessionAPI.delete(id),
    onSuccess: () => {
      // Invalidate both standard chat session queries and infinite chat session queries
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteChatSessions'] });

      toast({
        title: "Success",
        description: "Chat session deleted successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  });


  // Batch delete for multiple chat sessions
  const deleteMultipleChatSessionsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Using allSettled to allow some deletions to fail without failing the whole batch
      const results = await Promise.allSettled(ids.map(id => chatSessionAPI.delete(id)));

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
      // Invalidate both standard chat session queries and infinite chat session queries
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteChatSessions'] });

      // Show appropriate message based on partial or complete success
      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} chat sessions deleted. ${result.failed} operations failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: `${result.successful} ${result.successful === 1 ? 'chat session' : 'chat sessions'} deleted successfully!`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete chat sessions. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    chatSessions: chatSessionsQuery.data || [],
    isLoading: chatSessionsQuery.isLoading,
    isError: chatSessionsQuery.isError,
    createChatSession: createChatSessionMutation.mutateAsync,
    updateChatSession: updateChatSessionMutation.mutateAsync,
    deleteChatSession: deleteChatSessionMutation.mutateAsync,
    deleteMultipleChatSessions: deleteMultipleChatSessionsMutation.mutateAsync,
  };
}
