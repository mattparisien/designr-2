"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as React from "react"
import { forwardRef, useState } from "react"
import { type Navigation as NavigationType, type NavigationItem } from "@/lib/types/navigation"
import { Navigation } from "@/components/ui/navigation"

interface SidebarProps {
    children: React.ReactNode
    navigation?: NavigationType
    isDefaultCollapsed?: boolean
    className?: string
    searchPlaceholder?: string
    onItemClick?: (item: NavigationItem) => void
    onItemMouseEnter?: (item: NavigationItem) => void
    activeItem?: string
}

interface SidebarShellProps {
    children: React.ReactNode
    className?: string
    isCollapsed?: boolean
    ref?: React.Ref<HTMLDivElement>
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
    ({
        navigation,
        className,
        onItemClick,
        onItemMouseEnter,
        activeItem,
        children,
        isDefaultCollapsed = false,
    }, ref) => {

        const [isCollapsed] = useState<boolean>(isDefaultCollapsed);

        return (
            <SidebarShell ref={ref} isCollapsed={isCollapsed} className={className}>
                <ScrollArea className="flex-1">
                    {children}
                </ScrollArea>
            </SidebarShell>
        )
    }
)

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

export { Sidebar, SidebarShell, type SidebarProps }

