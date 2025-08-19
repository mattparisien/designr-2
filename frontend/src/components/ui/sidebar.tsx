"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as React from "react"
import { forwardRef } from "react"

interface SidebarProps {
    children: React.ReactNode
    className?: string
    width?: string
    searchPlaceholder?: string
}

interface SidebarShellProps {
    children: React.ReactNode
    className?: string
    width?: string
    ref?: React.Ref<HTMLDivElement>
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
    ({
        className,
        children,
        width = "var(--sidebar-width)",
    }, ref) => {


        return (
            <SidebarShell ref={ref} className={className} width={width}>
                <ScrollArea className="flex-1">
                    {children}
                </ScrollArea>
            </SidebarShell>
        )
    }
)

const SidebarShell = React.forwardRef<HTMLDivElement, SidebarShellProps>(
    (props: SidebarShellProps, ref) => {

        const { children, className, width } = props;

        return <aside
            ref={ref}
            className={cn(
                "pt-10 relative inline-flex h-screen flex-col bg-neutral-100 border-r border-t border-b border-neutral-200 transition-width duration-300 ease-in",
                className
            )}
            style={{ width: width || "var(--sidebar-width)" }}
        >{children}</aside>
    });

Sidebar.displayName = "Sidebar"
SidebarShell.displayName = "SidebarShell"

export { Sidebar, SidebarShell, type SidebarProps }

