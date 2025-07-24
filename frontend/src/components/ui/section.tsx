"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

interface SectionProps {
  defaultOpen?: boolean
  isCollapsible?: boolean
  className?: string
  headingClassName?: string
  contentClassName?: string
  children?: React.ReactNode
}

export function Section({
  defaultOpen = true,
  isCollapsible = false,
  className,
  contentClassName,
  children
}: SectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggleSection = () => {
    if (isCollapsible) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <section className={cn("mb-10 mx-auto", className)}>
      {isOpen && (
        <div className={cn("transition-all", contentClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}