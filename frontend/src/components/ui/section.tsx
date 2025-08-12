"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

interface SectionProps {
  className?: string
  contentClassName?: string
  children?: React.ReactNode
}

export function Section({
  className,
  contentClassName,
  children
}: SectionProps) {
  return (
    <section className={cn("mb-10 mx-auto", className)}>
      <div className={cn("transition-all", contentClassName)}>
        {children}
      </div>
    </section>
  )
}