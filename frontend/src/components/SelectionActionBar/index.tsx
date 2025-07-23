"use client"

import { Toolbar, ToolbarButton, ToolbarIcon, ToolbarLabel, ToolbarSection } from "@/app/editor/[id]/components/Toolbar"
import { useSelection } from "@/lib/context/selection"
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

  return (
    <Toolbar className={cn("px-4 py-5", className)}>
      <ToolbarSection space={40}>
        <ToolbarLabel label={`${selectedIds.length} selected`} className="whitespace-nowrap" />
        <ToolbarSection space={10}>
          <ToolbarButton onClick={handleMove}>
            <ToolbarIcon icon={isMoving ? Loader2 : Folder} strokeWidth={iconStrokeWidth} />
          </ToolbarButton>
          <ToolbarButton onClick={handleDelete}>
            <ToolbarIcon icon={isDeleting ? Loader2 : Trash2} className="text-red-500" strokeWidth={iconStrokeWidth} />
          </ToolbarButton>
        </ToolbarSection>
        <ToolbarButton onClick={clearSelection}>
          <ToolbarIcon icon={X} strokeWidth={iconStrokeWidth} />
        </ToolbarButton>
      </ToolbarSection>
    </Toolbar>
    // <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-3 flex items-center z-50 ${className}`}>
    //   <span className="text-sm font-medium text-gray-700 mr-6">
    //     {selectedIds.length} selected
    //   </span>

    //   {onMove && (
    //     <Button 
    //       size="icon" 
    //       variant="ghost" 
    //       onClick={handleMove} 
    //       disabled={isMoving || isDeleting}
    //       className="rounded-md"
    //     >
    //       {isMoving ? (
    //         <Loader2 className="h-5 w-5 animate-spin" />
    //       ) : (
    //         <Folder className="h-5 w-5" />
    //       )}
    //     </Button>
    //   )}

    //   {onDelete && (
    //     <Button 
    //       size="icon" 
    //       variant="ghost" 
    //       onClick={handleDelete} 
    //       disabled={isDeleting || isMoving}
    //       className="rounded-md"
    //     >
    //       {isDeleting ? (
    //         <Loader2 className="h-5 w-5 animate-spin" />
    //       ) : (
    //         <Trash2 className="h-5 w-5" />
    //       )}
    //     </Button>
    //   )}

    //   <div className="h-5 w-px bg-gray-200 mx-2" />

    //   <Button 
    //     size="icon" 
    //     variant="ghost" 
    //     onClick={clearSelection} 
    //     disabled={isDeleting || isMoving}
    //     className="rounded-md"
    //   >
    //     <X className="h-5 w-5" />
    //   </Button>
    // </div>
  )
}