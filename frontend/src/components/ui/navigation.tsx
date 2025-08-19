"use client"

import { Button } from "@/components/ui/button"
import { type Navigation, type NavigationItem } from "@/lib/types/navigation"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { LucideIcon, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"

interface NavigationComponentProps {
    navigation: Navigation
    itemLayout?: "vertical" | "horizontal"
    onItemClick?: (item: NavigationItem) => void
    activeItem?: string
    isCollapsed?: boolean
}

interface NavButtonProps {
    onClick: () => void
    onDelete?: (item: NavigationItem) => void
    layout: "vertical" | "horizontal",
    isActive: boolean | undefined
    level: number
    label?: string
    icon?: React.ReactNode
    href?: string
    widthMode?: "full" | "wrap"
    className?: string
    hasTrailingAction?: boolean,
}

interface NavIconProps {
    icon?: LucideIcon
    isFill?: boolean
    width?: string
    height?: string
}

interface NavigationItemProps {
    item: NavigationItem
    layout: "vertical" | "horizontal"
    onItemClick?: (item: NavigationItem) => void
    onItemDelete?: (item: NavigationItem) => void
    isActive?: boolean
    level: number
    isCollapsed: boolean
    activeItem?: string
}

const NavIcon = (props: NavIconProps) => {
    const { icon: Icon, width, height, isFill = false } = props

    return (
        Icon && <Icon
            style={{
                width: width || "0.98rem",
                height: height || "0.98rem",
                fill: isFill ? "var(--text-primary)" : "none",
                strokeWidth: "1.4px",
            }}
        />
    )
}

const NavButton = (props: NavButtonProps) => {
    const { onClick, isActive, level, icon, label, href, hasTrailingAction, className, layout } = props

    const buttonClass = cn(
        "flex items-center justify-start w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors truncate",
        "hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer gap-1.5",
        isActive
            ? "bg-[var(--interactive-bg-secondary-selected)] text-black"
            : "text-black",
        level > 0 && "ml-4",
        hasTrailingAction && "pr-10", // reserve space for trailing trash button
        className && className,
        layout === "vertical" && "flex-col"

    )

    if (href) {
        return (
            <Button
                as="NextLink"
                variant="ghost"
                onClick={onClick}
                className={buttonClass}
                {...{ href }} // Pass href as a spread prop to avoid type issues
            >
                <span>{icon}</span>
                <span className="truncate">{label}</span>
            </Button>
        )
    }

    return (
        <Button variant="ghost" onClick={onClick} className={buttonClass}>
            <span>{icon}</span>
            <span className="truncate text-xs">{label}</span>
        </Button>
    )
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    item,
    onItemClick,
    isCollapsed,
    isActive,
    level,
    activeItem,
    layout = "horizontal"
}) => {


    const [isExpanded, setIsExpanded] = React.useState(false)
    const hasChildren = item.children && item.children.length > 0

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded)
        }
        onItemClick?.(item)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (item.onDelete) {
            item.onDelete(item)
        }
    }

    const icon = useMemo(() => {
        if (typeof item.icon === "string") {
            // Parse the icon name from "lucide:name-of-icon" format
            const iconName = item.icon.replace("lucide:", "")

            // Convert kebab-case to PascalCase (e.g., "arrow-left" => "ArrowLeft")
            const pascalCaseName = iconName
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("")

            // Dynamically access the icon component
            const DynamicIcon = (LucideIcons as Record<string, unknown>)[
                pascalCaseName
            ] as LucideIcon

            return DynamicIcon || Plus
        }

        // If item.icon is already a LucideIcon component, return it directly
        if (item.icon && typeof item.icon === "function") {
            return item.icon as LucideIcon
        }

    }, [item.icon])

    return (
        <li>
            <div className="flex relative group">
                <NavButton
                    onClick={handleClick}
                    level={level}
                    label={item.label}
                    href={item.href}
                    layout={layout}
                    icon={<NavIcon icon={icon} width={layout === "horizontal" ? "1.2rem" : "1.7rem"} height={layout === "horizontal" ? "1.2rem" : "1.7rem"} />}
                    isActive={isActive}
                    hasTrailingAction={Boolean(item.onDelete)}
                />
                {/* Delete button - show on parent hover when onDelete exists */}
                {item.onDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                        <LucideIcons.Trash className="h-4 w-4 text-neutral-500" />
                    </Button>
                )}
            </div>
            {/* Render children if expanded */}
            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {item.children!.map((child) => (
                        <NavigationItem
                            key={child.id}
                            layout={layout}
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
        </li>
    )
}

const NavigationComponent: React.FC<NavigationComponentProps> = ({
    navigation,
    onItemClick,
    activeItem,
    isCollapsed = false,
    itemLayout = "horizontal"
}) => {
    const pathname = usePathname()
    const [searchQuery] = useState<string>("")

    // Determine active item based on activeItem prop or current pathname
    const activeItemId = useMemo(() => {
        if (activeItem) return activeItem

        // If no activeItem prop, try to match based on href in navigation items
        const allItems = navigation.sections.flatMap((section) => section.items)
        const matchedItem = allItems.find((item) => {
            if (!item.href) return false

            // Exact match for root paths or when pathname exactly matches href
            if (item.href === pathname) return true

            // For non-root paths, check if pathname starts with the href
            if (item.href !== "/" && pathname.startsWith(item.href)) return true

            return false
        })
        return matchedItem?.id || null
    }, [activeItem, pathname, navigation])

    const filteredSections = useMemo(() => {
        if (!searchQuery) return navigation.sections

        return navigation.sections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label?.toLowerCase().includes(searchQuery.toLowerCase())
                ),
            }))
            .filter((section) => section.items.length > 0)
    }, [navigation, searchQuery])

    const handleItemClick = useCallback(
        (item: NavigationItem) => {
            onItemClick?.(item)
        },
        [onItemClick]
    )

    return (
        <div className="p-1 flex flex-col space-y-10">
            {filteredSections.map((section) => (
                <div key={section.id}>
                    {section.label && (
                        <div className="px-3 pb-2 text-sm text-neutral-400">
                            {section.label}
                        </div>
                    )}
                    <nav>
                        {/* Section Items */}
                        <ul className="space-y-1">
                            {section.items.map((item) => (
                                <NavigationItem
                                    layout={itemLayout}
                                    isCollapsed={isCollapsed}
                                    key={item.id}
                                    item={item}
                                    onItemClick={handleItemClick}
                                    isActive={activeItemId === item.id}
                                    level={0}
                                    activeItem={activeItem}
                                />
                            ))}
                        </ul>
                    </nav>
                </div>
            ))}
        </div>
    )
}

export { NavigationComponent as Navigation, NavigationItem }
export type { NavigationComponentProps, NavigationItemProps }

