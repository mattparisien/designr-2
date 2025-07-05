"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarItem {
  id: string
  title: string
  href?: string
  children?: SidebarItem[]
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  className?: string
  searchPlaceholder?: string
  onItemClick?: (item: SidebarItem) => void
  activeItem?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ 
    sections, 
    className, 
    searchPlaceholder = "Search", 
    onItemClick, 
    activeItem 
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState("")
    
    const filteredSections = React.useMemo(() => {
      if (!searchQuery) return sections
      
      return sections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    }, [sections, searchQuery])

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-screen w-64 flex-col bg-elevated-secondary border-r border-default bg-elevated-secondary",
          className
        )}
        style={{
            backgroundColor: "var(--bg-elevated-secondary)",
            borderColor: "var(--border-light)"
        }}
       
      >
   

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredSections.map((section) => (
              <aside key={section.title} className="mb-6">
                
                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      onItemClick={onItemClick}
                      isActive={activeItem === item.id}
                      level={0}
                      activeItem={activeItem}
                    />
                  ))}
                </div>
              </aside>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }
)

interface SidebarItemProps {
  item: SidebarItem
  onItemClick?: (item: SidebarItem) => void
  isActive?: boolean
  level: number
  activeItem?: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  item, 
  onItemClick, 
  isActive, 
  level,
  activeItem 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  
  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onItemClick?.(item)
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-interactive-secondary-hover",
          isActive && "bg-interactive-accent text-primary",
          !isActive && "text-secondary hover:text-primary",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {item.title}
      </Button>
      
      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              onItemClick={onItemClick}
              isActive={activeItem === child.id}
              level={level + 1}
              activeItem={activeItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

Sidebar.displayName = "Sidebar"

export { Sidebar, type SidebarProps, type SidebarSection, type SidebarItem }
