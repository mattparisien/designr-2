"use client"


import { Sidebar } from "@/components/ui"
import Editor from "./components/Editor"
import { Palette, LayoutPanelTop, Shapes, Type } from "lucide-react"

export default function EditorPage() {
  return (
    <>
      <Sidebar
        isDefaultCollapsed
        className="z-[var(--z-editor-sidebar)]"
        sections={[
          {
            title: "General",
            items: [
              {
                id: "design",
                title: "Design",
                href: "/editor/brand",
                icon: LayoutPanelTop
              },
              {
                id: "brand",
                title: "Brands",
                href: "/editor/brand",
                icon: Palette
              },
              {
                id: "shape",
                title: "Shapes",
                href: "/editor/brand",
                icon: Shapes
              },
              {
                id: "text",
                title: "Text",
                href: "/editor/brand",
                icon: Type
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
