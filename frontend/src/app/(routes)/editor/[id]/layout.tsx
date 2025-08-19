"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import EditorSidebar from "./components/Sidebar/EditorSidebar"

const queryClient = new QueryClient()

export default function EditorLayout({ children }: { children: React.ReactNode }) {

   return (
      <>
         <QueryClientProvider client={queryClient}>
            <EditorSidebar />

            <main className="absolute top-0 left-0 z-[var(--z-editor-main)] w-full h-screen overflow-hidden"
               style={{
                  paddingLeft: "var(--editor-sidebar-width)",
               }}
            >
               {children}
            </main>
         </QueryClientProvider>
      </>
   )
}
