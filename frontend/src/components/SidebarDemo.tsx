"use client"

import * as React from "react"
import { Sidebar, type SidebarSection, type SidebarItem } from "@/components/ui/sidebar"

const sidebarData: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "getting-started", title: "Getting started" },
      { id: "accessibility", title: "Accessibility" },
      { id: "releases", title: "Releases" },
    ]
  },
  {
    title: "Guides",
    items: [
      { id: "styling", title: "Styling" },
      { id: "animation", title: "Animation" },
      { id: "composition", title: "Composition" },
      { id: "server-side-rendering", title: "Server-side rendering" },
    ]
  },
  {
    title: "Components",
    items: [
      { id: "accordion", title: "Accordion" },
      { id: "alert-dialog", title: "Alert Dialog" },
      { id: "aspect-ratio", title: "Aspect Ratio" },
      { id: "avatar", title: "Avatar" },
      { id: "checkbox", title: "Checkbox" },
      { id: "collapsible", title: "Collapsible" },
      { id: "context-menu", title: "Context Menu" },
      { id: "dialog", title: "Dialog" },
      { id: "dropdown-menu", title: "Dropdown Menu" },
      { id: "hover-card", title: "Hover Card" },
      { id: "label", title: "Label" },
      { id: "menubar", title: "Menubar" },
      { id: "navigation-menu", title: "Navigation Menu" },
      { id: "popover", title: "Popover" },
      { id: "progress", title: "Progress" },
      { id: "radio-group", title: "Radio Group" },
      { id: "scroll-area", title: "Scroll Area" },
      { id: "select", title: "Select" },
      { id: "separator", title: "Separator" },
      { id: "slider", title: "Slider" },
      { id: "switch", title: "Switch" },
      { id: "tabs", title: "Tabs" },
      { id: "toast", title: "Toast" },
      { id: "toggle", title: "Toggle" },
      { id: "toggle-group", title: "Toggle Group" },
      { id: "toolbar", title: "Toolbar" },
      { id: "tooltip", title: "Tooltip" },
    ]
  }
]

export default function SidebarDemo() {
  const [activeItem, setActiveItem] = React.useState("getting-started")

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id)
    console.log("Clicked:", item.title)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        sections={sidebarData}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        searchPlaceholder="Search..."
        className="border-r"
      />
      
      {/* Main content area */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {sidebarData
              .flatMap(section => section.items)
              .find(item => item.id === activeItem)?.title || "Welcome"}
          </h1>
          <p className="text-text-secondary">
            This is the content area. Click on different sidebar items to see the active state change.
          </p>
        </div>
      </div>
    </div>
  )
}
