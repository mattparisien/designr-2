"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import EditorSidebar from "./components/Sidebar/EditorSidebar"
import useEditorStore from "./lib/stores/useEditorStore"

const queryClient = new QueryClient()

export default function EditorLayout({ children }: { children: React.ReactNode }) {


   const sidebar = useEditorStore(state => state.sidebar)

   const handleClickOutsideSidebar = () => {
      if (sidebar.isOpen) {
         useEditorStore.getState().closeSidebar()
      }
   }

   return (
      <>
         <QueryClientProvider client={queryClient}>
            <EditorSidebar />

            <main className="absolute top-0 left-0 z-[var(--z-editor-main)] w-full h-screen overflow-hidden"
               style={{
                  paddingLeft: sidebar.width + "px"
               }}
               onClick={handleClickOutsideSidebar}
            >
               {children}
            </main>
         </QueryClientProvider>
      </>
   )
}
