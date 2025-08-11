// useAI.ts
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { aiAPI } from "../api/index";

type SummarizeInput = {
  text: string;
};

type SummarizeOutput = {
  summary: string;
  tokensUsed?: number;
  // add any metadata you return
};

async function summarizeRequest(input: SummarizeInput): Promise<SummarizeOutput> {
  const summary = await aiAPI.summarize(input.text);

  if (!summary) {
    throw new Error(`Summarize failed: No summary returned`);
  }

  return { summary };

}

/**
 * useAI — a small wrapper around AI actions.
 * Returns a `summarize` function plus mutation state.
 */
export function useAI() {
  // Using a Mutation since summarize is an on-demand action (not cache-first).
  const summarizeMutation: UseMutationResult<SummarizeOutput, Error, SummarizeInput> =
    useMutation({
      mutationKey: ["ai", "summarize"],
      mutationFn: (vars) => summarizeRequest(vars),
      retry: 1, // tweak as needed
    });

  /**
   * summarize — call it like: await summarize({ text, length, tone })
   * You get back { summary, ... } or it throws (which react-query catches for you).
   */
  const summarize = (input: SummarizeInput) => summarizeMutation.mutateAsync(input);

  return {
    summarize,
    // state you can use in UI:
    isSummarizing: summarizeMutation.isPending,
    summarizeError: summarizeMutation.error,
    summarizeData: summarizeMutation.data,
    // full mutation in case you want extra control:
    summarizeMutation,
  };
}
