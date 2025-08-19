"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as React from "react"
import { forwardRef } from "react"

interface SidebarProps {
    children: React.ReactNode
    className?: string
    width?: string
    naked?: boolean
    searchPlaceholder?: string
}

interface SidebarShellProps {
    children: React.ReactNode
    className?: string
    width?: string
    ref?: React.Ref<HTMLDivElement>
    naked?: boolean
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
    ({
        className,
        children,
        naked,
        width = "var(--sidebar-width)",
    }, ref) => {


        return (
            <SidebarShell ref={ref} className={className} width={width} naked={naked}>
                <ScrollArea className="flex-1">
                    {children}
                </ScrollArea>
            </SidebarShell>
        )
    }
)

const SidebarShell = React.forwardRef<HTMLDivElement, SidebarShellProps>(
    (props: SidebarShellProps, ref) => {

        const { children, className, width, naked } = props;

        return <aside
            ref={ref}
            className={cn(
                "pt-10 relative inline-flex h-screen flex-col",
                className,
                !naked && " bg-neutral-100 border-r border-t border-b border-neutral-200"
            )}
            style={{ width: width || "var(--sidebar-width)" }}
        >{children}</aside>
    });

Sidebar.displayName = "Sidebar"
SidebarShell.displayName = "SidebarShell"

export { Sidebar, SidebarShell, type SidebarProps }

