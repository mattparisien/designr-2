"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LucideIcon, Plus } from "lucide-react"
import * as React from "react"
import { forwardRef, useCallback, useMemo, useState } from "react"

export interface SidebarItem {
    id: string
    title: string
    href?: string
    children?: SidebarItem[]
    icon?: LucideIcon
}

export interface SidebarSection {
    title: string
    items: SidebarItem[]
}

interface SidebarProps {
    sections: SidebarSection[]
    isDefaultCollapsed?: boolean
    className?: string
    searchPlaceholder?: string
    onItemClick?: (item: SidebarItem) => void
    activeItem?: string
}

interface MenuButtonProps {
    onClick: () => void,
    isActive: boolean | undefined;
    level: number;
    label: string;
    icon?: React.ReactNode;
    widthMode?: "full" | "wrap"
}

interface MenuIconProps {
    icon: LucideIcon,
    isFill?: boolean;
    width?: string;
    height?: string;
}

interface SidebarItemProps {
    item: SidebarItem
    onItemClick?: (item: SidebarItem) => void
    isActive?: boolean
    level: number,
    isCollapsed: boolean,
    activeItem?: string
}

interface SidebarShellProps {
    children: React.ReactNode;
    className?: string;
    isCollapsed?: boolean;
    ref?: React.Ref<HTMLDivElement>;
}

const MenuIcon = (props: MenuIconProps) => {

    const { icon: Icon, width, height, isFill = false } = props;


    return <Icon style={{
        width: width || "0.98rem",
        height: height || '0.98rem',
        fill: isFill ? "var(--text-primary)" : "none",
    }} />;

}

const MenuButton = (props: MenuButtonProps) => {

    const { onClick, isActive, level, icon, label } = props;

    return <div className="flex flex-col items-center justify-center">
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                "rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                "hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer",
                isActive
                    ? "bg-[var(--interactive-bg-secondary-selected)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                level > 0 && "ml-4")}
            style={{ paddingLeft: `${12 + level * 16}px` }}
        >
            {icon}
        </Button>
        <div className="text-xs text-[var(--text-secondary)] mt-1">
            {label}
        </div>
    </div>
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
    ({
        sections,
        className,
        onItemClick,
        activeItem,
        isDefaultCollapsed = false,
    }, ref) => {

        const [activeItemId, setActiveItemId] = useState<string | null>(activeItem || null);
        const [isCollapsed, setIsCollapsed] = useState<boolean>(isDefaultCollapsed);
        const [searchQuery, setSearchQuery] = useState<string>("")

        const filteredSections = useMemo(() => {
            if (!searchQuery) return sections

            return sections.map(section => ({
                ...section,
                items: section.items.filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            })).filter(section => section.items.length > 0)
        }, [sections, searchQuery])

        const handleItemClick = useCallback((item: SidebarItem) => {
            setActiveItemId(item.id);
            onItemClick?.(item);
        }, [onItemClick]);

        return (
            <SidebarShell ref={ref} isCollapsed={isCollapsed} className={className}>
                <ScrollArea className="flex-1">
                    <div className="p-1">
                        {/* <aside className="mb-6">
                            <div className="flex justify-end">
                                <MenuButton
                                    isActive={false}
                                    icon={<MenuIcon icon={SidebarIcon} />}
                                    widthMode="wrap"
                                    level={0}
                                    // label="Toggle Sidebar"
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                />


                            </div>
                        </aside> */}
                        {filteredSections.map((section) => (
                            <aside key={section.title} className="mb-6">

                                {/* Section Items */}
                                <div className="space-y-5">
                                    {section.items.map((item) => (
                                        <SidebarItem
                                            isCollapsed={isCollapsed}
                                            key={item.id}
                                            item={item}
                                            onItemClick={handleItemClick}
                                            isActive={activeItemId === item.id}
                                            level={0}
                                            activeItem={activeItem}
                                        />
                                    ))}
                                </div>
                            </aside>
                        ))}
                    </div>
                </ScrollArea>
            </SidebarShell>
        )
    }
)

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

    return (
        <div>
            <MenuButton
                onClick={handleClick}
                level={level}
                label={item.title}
                icon={<MenuIcon icon={item.icon || Plus} width="1.2rem" height="1.2rem" isFill={isActive} />}
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

const SidebarShell = React.forwardRef<HTMLDivElement, SidebarShellProps>(
    (props: SidebarShellProps, ref) => {

        const { children, className, isCollapsed } = props;

        return <aside
            ref={ref}
            className={cn(
                "relative inline-flex h-screen flex-col bg-elevated-secondary border-r transition-width duration-300 ease-in",
                !isCollapsed ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-collapsed)]",
                className
            )}
            style={{
                backgroundColor: "var(--bg-elevated-secondary)",
                borderRightColor: "var(--border-default)"
            }}
        >{children}</aside>
    });

Sidebar.displayName = "Sidebar"
SidebarShell.displayName = "SidebarShell"

export { Sidebar, SidebarShell, type SidebarItem, type SidebarProps, type SidebarSection }

