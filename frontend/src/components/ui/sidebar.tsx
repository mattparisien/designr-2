"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LucideIcon, Plus, Sidebar as SidebarIcon } from "lucide-react"
import * as React from "react"
import { useState } from "react"

interface SidebarItem {
    id: string
    title: string
    href?: string
    children?: SidebarItem[]
    icon?: LucideIcon
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

interface MenuButtonProps {
    onClick: () => void,
    isActive: boolean | undefined;
    level: number;
    label: string | React.ReactNode;
    widthMode?: "full" | "wrap"
}

interface MenuIconProps {
    icon: LucideIcon
}

const MenuIcon = (props: MenuIconProps) => {

    const { icon: Icon } = props;


    return <Icon style={{
        width: "0.98rem",
        height: '0.98rem'
    }} />;

}

const MenuButton = (props: MenuButtonProps) => {

    const { onClick, isActive, level, label, widthMode = "full" } = props;

    return <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
            "justify-start rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer",
            isActive
                ? "bg-[var(--interactive-bg-accent-default)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)]",
            level > 0 && "ml-4",
            widthMode == "full" && "w-full"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
    >
        {label}
    </Button>
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
    ({
        sections,
        className,
        onItemClick,
        activeItem
    }, ref) => {
        const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
        const [searchQuery, setSearchQuery] = useState<string>("")

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
                    "inline-flex h-screen flex-col bg-elevated-secondary border-r transition-width duration-300 ease-in",
                    !isCollapsed ? "w-[var(--sidebar-width)]" : "w-auto",
                    className
                )}
                style={{
                    backgroundColor: "var(--bg-elevated-secondary)",
                    borderRightColor: "var(--border-default)"
                }}
            >


                {/* Scrollable Content */}
                <ScrollArea className="flex-1">
                    <div className="p-1">
                        <aside className="mb-6">
                            <div className="flex justify-end">
                                <MenuButton
                                    isActive={false}
                                    onClick={() => setIsCollapsed(isCollapsed => !isCollapsed)}
                                    label={<MenuIcon icon={SidebarIcon} />}
                                    widthMode="wrap"
                                    level={0}
                                />


                            </div>
                        </aside>
                        {filteredSections.map((section) => (
                            <aside key={section.title} className="mb-6">
                                {/* Section Title */}
                                {/* <h3 className="mb-3 px-3 text-lg font-semibold text-[var(--text-primary)]">
                  {section.title}
                </h3> */}

                                {/* Section Items */}
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <SidebarItem
                                            isCollapsed={isCollapsed}
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
    level: number,
    isCollapsed: boolean,
    activeItem?: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    onItemClick,
    isCollapsed,
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

    const Icon = <MenuIcon icon={item.icon || Plus} />

    return (
        <div>
            <MenuButton
                onClick={handleClick}
                level={level}
                label={isCollapsed ? Icon : <div className="flex space-x-2 items-center "><span>{Icon}</span><span>{item.title}</span></div>}
                isActive={isActive}
            />
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
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

Sidebar.displayName = "Sidebar"

export { Sidebar, type SidebarItem, type SidebarProps, type SidebarSection }

