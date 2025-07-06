"use client"


import { Sidebar } from "@/components/ui"
import Editor from "./components/Editor"

export default function EditorPage() {
  return (
    <>
      <Sidebar
      className="z-[var(--z-editor-sidebar)]"
        sections={[
          {
            title: "Brand",
            items: [
              {
                id: "brand",
                title: "Brand Settings",
                href: "/editor/brand",
              },
              {
                id: "apply-brand",
                title: "Apply Brand",
                href: "/editor/apply-brand",
              },
            ],
          },
          {
            title: "Templates",
            items: [
              {
                id: "templates",
                title: "Templates",
                href: "/editor/templates",
              },
            ],
          },
          {
            title: "AI Tools",
            items: [
              {
                id: "ai-tools",
                title: "AI Content Generation",
                href: "/editor/ai-tools",
              },
            ],
          },
        ]}

      />
      <main className="absolute top-0 left-0 pl-[var(--sidebar-width)] z-[var(--z-editor-main)] w-full h-full overflow-hidden">
        <Editor />
      </main>
    </>
  )
}
