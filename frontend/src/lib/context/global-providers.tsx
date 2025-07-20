"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

// Create a new QueryClient instance
const queryClient = new QueryClient()

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}