"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  focusNone?: boolean;
  borderNone?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, focusNone, borderNone, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
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
Input.displayName = "Input"

export { Input }
