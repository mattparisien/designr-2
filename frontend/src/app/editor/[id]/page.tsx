"use client"

import { useParams } from 'next/navigation'
import Editor from "./components/Editor"
import EditorSidebar from "./components/Sidebar/EditorSidebar"
import useEditorStore from "./lib/stores/useEditorStore"

export default function EditorPage() {
  const params = useParams()
  const templateId = params.id as string

  const sidebar = useEditorStore(state => state.sidebar)

  const handleClickOutsideSidebar = () => {
    if (sidebar.isOpen) {
      useEditorStore.getState().closeSidebar()
    }
  }

  return (
    <>
      <EditorSidebar />

      <main className="absolute top-0 left-0 z-[var(--z-editor-main)] w-full h-full overflow-hidden"
        style={{
          paddingLeft: sidebar.width + "px"
        }}
        onClick={handleClickOutsideSidebar}
      >
        <Editor templateId={templateId} />
      </main>
    </>
  )
}
