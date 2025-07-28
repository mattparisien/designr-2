"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LucideIcon, Plus } from "lucide-react"
import * as React from "react"
import { forwardRef, useCallback, useMemo, useState } from "react"
import { type Navigation, type NavigationItem } from "@/lib/types/navigation"
import * as LucideIcons from "lucide-react"
import { usePathname } from "next/navigation"


interface SidebarProps {
    navigation: Navigation,
    isDefaultCollapsed?: boolean
    className?: string
    searchPlaceholder?: string
    onItemClick?: (item: NavigationItem) => void
    onItemMouseEnter?: (item: NavigationItem) => void
    activeItem?: string
}

interface MenuButtonProps {
    onClick: () => void,
    isActive: boolean | undefined;
    level: number;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    widthMode?: "full" | "wrap"
}

interface MenuIconProps {
    icon: LucideIcon,
    isFill?: boolean;
    width?: string;
    height?: string;
}

interface SidebarItemProps {
    item: NavigationItem
    onItemClick?: (item: NavigationItem) => void
    onItemMouseEnter?: (item: NavigationItem) => void
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
        strokeWidth: "1.4px"
    }} />;

}

const MenuButton = (props: MenuButtonProps) => {

    const { onClick, isActive, level, icon, label, href } = props;

    const buttonClass = cn(
        "flex items-center justify-start w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer gap-1.5",
        isActive
            ? "bg-[var(--interactive-bg-secondary-selected)] text-black"
            : "text-black",
        level > 0 && "ml-4"
    );

    if (href) {
        return <Button
            as="NextLink"
            variant="ghost"
            onClick={onClick}
            className={buttonClass}
            {...{ href }} // Pass href as a spread prop to avoid type issues
        >
            <span>
                {icon}
            </span>
            <span>
                {label}
            </span>
        </Button>
    }

    return <Button
        variant="ghost"
        onClick={onClick}
        className={buttonClass}
    >
        <span>
            {icon}
        </span>
        <span>
            {label}
        </span>
    </Button>

}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
    ({
        navigation,
        className,
        onItemClick,
        onItemMouseEnter,
        activeItem,
        isDefaultCollapsed = false,
    }, ref) => {

        const pathname = usePathname();
        const [isCollapsed] = useState<boolean>(isDefaultCollapsed);
        const [searchQuery] = useState<string>("")

        // Determine active item based on activeItem prop or current pathname
        const activeItemId = useMemo(() => {
            if (activeItem) return activeItem;
            
            // If no activeItem prop, try to match based on href in navigation items
            const allItems = navigation.sections.flatMap(section => section.items);
            const matchedItem = allItems.find(item => item.href && pathname.includes(item.href));
            return matchedItem?.id || null;
        }, [activeItem, pathname, navigation]);

        const filteredSections = useMemo(() => {
            if (!searchQuery) return navigation.sections;

            return navigation.sections.map(section => ({
                ...section,
                items: section.items.filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            })).filter(section => section.items.length > 0)
        }, [navigation, searchQuery])

        const handleItemClick = useCallback((item: NavigationItem) => {
            onItemClick?.(item);
        }, [onItemClick]);

        const handleItemMouseEnter = useCallback((item: NavigationItem) => {
            onItemMouseEnter?.(item);
        }, [onItemMouseEnter]);

        return (
            <SidebarShell ref={ref} isCollapsed={isCollapsed} className={className}>
                <ScrollArea className="flex-1">
                    <div className="p-1">
                        {filteredSections.map((section) => (
                            <div key={section.id} className="mb-6">

                                {/* Section Items */}
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <SidebarItem
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
                                </div>
                            </div>
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
    onItemMouseEnter,
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

    const icon = useMemo(() => {
        if (typeof item.icon === "string") {
            // Parse the icon name from "lucide:name-of-icon" format
            const iconName = item.icon.replace("lucide:", "");

            // Convert kebab-case to PascalCase (e.g., "arrow-left" => "ArrowLeft")
            const pascalCaseName = iconName
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("");

            // Dynamically access the icon component
            const DynamicIcon = (LucideIcons as Record<string, unknown>)[pascalCaseName] as LucideIcon;

            if (DynamicIcon && typeof DynamicIcon === 'function') {
                return DynamicIcon;
            }

            console.warn(`Icon "${item.icon}" not found, using fallback`);
            return Plus;
        }

        // If item.icon is already a LucideIcon component, return it directly
        if (item.icon && typeof item.icon === 'function') {
            return item.icon as LucideIcon;
        }

        return Plus;
    }, [item.icon]);

    return (
        <div onMouseEnter={() => onItemMouseEnter?.(item)}>
            <MenuButton
                onClick={handleClick}
                level={level}
                label={item.title}
                href={item.href}
                icon={<MenuIcon icon={icon} width="1.2rem" height="1.2rem" />}
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
                "pt-10 relative inline-flex h-screen flex-col bg-neutral-100 border-r border-t border-b border-neutral-200 transition-width duration-300 ease-in",
                !isCollapsed ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-collapsed)]",
                className
            )}
        >{children}</aside>
    });

Sidebar.displayName = "Sidebar"
SidebarShell.displayName = "SidebarShell"

export { Sidebar, SidebarShell, type SidebarItem, type SidebarProps }

