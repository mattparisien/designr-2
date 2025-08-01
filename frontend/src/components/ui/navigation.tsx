"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, Plus } from "lucide-react"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { type Navigation, type NavigationItem } from "@/lib/types/navigation"
import * as LucideIcons from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationComponentProps {
    navigation: Navigation
    onItemClick?: (item: NavigationItem) => void
    onItemMouseEnter?: (item: NavigationItem) => void
    activeItem?: string
    isCollapsed?: boolean
}

interface NavButtonProps {
    onClick: () => void
    isActive: boolean | undefined
    level: number
    label: string
    icon?: React.ReactNode
    href?: string
    widthMode?: "full" | "wrap"
}

interface NavIconProps {
    icon: LucideIcon
    isFill?: boolean
    width?: string
    height?: string
}

interface NavigationItemProps {
    item: NavigationItem
    onItemClick?: (item: NavigationItem) => void
    onItemMouseEnter?: (item: NavigationItem) => void
    isActive?: boolean
    level: number
    isCollapsed: boolean
    activeItem?: string
}

const NavIcon = (props: NavIconProps) => {
    const { icon: Icon, width, height, isFill = false } = props

    return (
        <Icon
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
    const { onClick, isActive, level, icon, label, href } = props

    const buttonClass = cn(
        "flex items-center justify-start w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer gap-1.5",
        isActive
            ? "bg-[var(--interactive-bg-secondary-selected)] text-black"
            : "text-black",
        level > 0 && "ml-4"
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
                <span>{label}</span>
            </Button>
        )
    }

    return (
        <Button variant="ghost" onClick={onClick} className={buttonClass}>
            <span>{icon}</span>
            <span>{label}</span>
        </Button>
    )
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    item,
    onItemClick,
    onItemMouseEnter,
    isCollapsed,
    isActive,
    level,
    activeItem,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const hasChildren = item.children && item.children.length > 0

    const handleClick = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded)
        }
        onItemClick?.(item)
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

        return Plus
    }, [item.icon])

    return (
        <li onMouseEnter={() => onItemMouseEnter?.(item)}>
            <NavButton
                onClick={handleClick}
                level={level}
                label={item.label}
                href={item.href}
                icon={<NavIcon icon={icon} width="1.2rem" height="1.2rem" />}
                isActive={isActive}
            />
            {/* Render children if expanded */}
            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {item.children!.map((child) => (
                        <NavigationItem
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
        </li>
    )
}

const NavigationComponent: React.FC<NavigationComponentProps> = ({
    navigation,
    onItemClick,
    onItemMouseEnter,
    activeItem,
    isCollapsed = false,
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
                    item.label.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleItemMouseEnter = useCallback(
        (item: NavigationItem) => {
            onItemMouseEnter?.(item)
        },
        [onItemMouseEnter]
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
                                    isCollapsed={isCollapsed}
                                    key={item.id}
                                    item={item}
                                    onItemClick={handleItemClick}
                                    onItemMouseEnter={handleItemMouseEnter}
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

export { NavigationItem, NavigationComponent as Navigation }
export type { NavigationComponentProps, NavigationItemProps }
