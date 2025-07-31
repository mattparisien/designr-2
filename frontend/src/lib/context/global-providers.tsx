"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { DropZoneProvider } from "./dropzone-context"
import { ChatProvider } from "./chat-context"
import { NavigationProvider } from "./navigation-context"

// Create a new QueryClient instance
const queryClient = new QueryClient()

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <DropZoneProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </DropZoneProvider>
      </NavigationProvider>
    </QueryClientProvider>
  )
}