"use client"


import Editor from "./components/Editor"
import EditorSidebar from "./components/Sidebar/EditorSidebar"
import useEditorStore from "./lib/stores/useEditorStore"

export default function EditorPage() {

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
        <Editor />
      </main>
    </>
  )
}
