"use client"

import { Toolbar, ToolbarButton, ToolbarIcon, ToolbarLabel, ToolbarSection } from "@/app/(routes)/editor/[id]/components/Toolbar/index";
import { useSelection } from "@/lib/context/selection-context"
import { cn } from "@/lib/utils"
import { Folder, Loader2, Trash2, X } from "lucide-react"
import { useState } from "react"

interface SelectionActionBarProps {
  onDelete?: () => Promise<void>
  onDuplicate?: () => Promise<void>
  onMove?: () => Promise<void>
  className?: string
}

export function SelectionActionBar({
  onDelete,
  onMove,
  className = "",
}: SelectionActionBarProps) {
  const { selectedIds, clearSelection } = useSelection()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  if (selectedIds.length === 0) return null

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return

    try {
      setIsDeleting(true)
      await onDelete()
    } catch (error) {
      console.error("Error during delete operation:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMove = async () => {
    if (!onMove || isMoving) return

    try {
      setIsMoving(true)
      await onMove()
    } catch (error) {
      console.error("Error during move operation:", error)
    } finally {
      setIsMoving(false)
    }
  }

  const iconStrokeWidth = 1.7
  const iconSize = "lg";

  return (
    <Toolbar className={cn("px-4 py-5", className)} transition positionStatic>
      <ToolbarSection space={40}>
        <ToolbarLabel label={`${selectedIds.length} selected`} className="whitespace-nowrap" size="md"/>
        <ToolbarSection space={10}>
          <ToolbarButton onClick={handleMove}>
            <ToolbarIcon size={iconSize} icon={isMoving ? Loader2 : Folder} strokeWidth={iconStrokeWidth} />
          </ToolbarButton>
          <ToolbarButton onClick={handleDelete}>
            <ToolbarIcon size={iconSize} icon={isDeleting ? Loader2 : Trash2} className="text-red-500" strokeWidth={iconStrokeWidth} />
          </ToolbarButton>
        </ToolbarSection>
        <ToolbarButton onClick={clearSelection}>
          <ToolbarIcon size={iconSize} icon={X} strokeWidth={iconStrokeWidth} />
        </ToolbarButton>
      </ToolbarSection>
    </Toolbar>
  )
}