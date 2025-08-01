"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  focusNone?: boolean;
  borderNone?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, focusNone, borderNone, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md bg-transparent px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          !focusNone && "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          focusNone && "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          borderNone && "border-0",
          !borderNone && "border border-input shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }