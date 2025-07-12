import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ToolbarButtonProps {
    onClick?: (e: React.MouseEvent) => void
    isActive?: boolean
    children: React.ReactNode
    className?: string
    title?: string
    rounded?: 'xl' | 'lg'
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ onClick, isActive, children, className = "", title, rounded = 'xl' }, ref) => {
        const BUTTON_BASE_CLASSES = "text-gray-500 hover:bg-gray-50 transition cursor-pointer"
        const BUTTON_ICON_CLASSES = "p-1.5"
        const BUTTON_ACTIVE_CLASSES = ""
        const BUTTON_ROUNDED_XL = "rounded-xl"
        const BUTTON_ROUNDED_LG = "rounded-lg"

        const roundedClass = rounded === 'xl' ? BUTTON_ROUNDED_XL : BUTTON_ROUNDED_LG

        return (
            <button
                ref={ref}
                className={cn(
                    BUTTON_BASE_CLASSES,
                    BUTTON_ICON_CLASSES,
                    roundedClass,
                    isActive && BUTTON_ACTIVE_CLASSES,
                    className
                )}
                onClick={onClick}
                title={title}
            >
                {children}
            </button>
        )
    }
)

ToolbarButton.displayName = "ToolbarButton"

export default ToolbarButton;