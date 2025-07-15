import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { forwardRef } from "react"
import ToolbarIcon from "./ToolbarIcon"

interface ToolbarButtonProps {
    onClick?: (e: React.MouseEvent) => void
    isActive?: boolean
    children: React.ReactNode
    className?: string
    direction?: 'row' | 'col'
    title?: string
    icon?: LucideIcon,
    rounded?: 'xl' | 'lg'
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ onClick, isActive, children, className = "", title, icon: Icon, direction = "row" }, ref) => {
        const BUTTON_BASE_CLASSES = "flex text-gray-500 transition cursor-pointer"
        const BUTTON_ICON_CLASSES = "p-1.5"
        const BUTTON_ACTIVE_CLASSES = "bg-gray-100 [&>*]:stroke-[var(--color-accent-90)]"

        const roundedClass = "rounded-[var(--elevated-surface-radius)]";

        return (
            <button
                ref={ref}
                className={cn(
                    BUTTON_BASE_CLASSES,
                    BUTTON_ICON_CLASSES,
                    roundedClass,
                    isActive && BUTTON_ACTIVE_CLASSES,
                    !isActive && "[&>*]:stroke-black hover:!bg-gray-100",
                    direction === "col" ? "flex-col items-center" : "flex-row items-center space-x-2",
                    className
                )}
                onClick={onClick}
                title={title}
                style={{
                    backgroundColor: isActive ? 'var(--color-accent-20)' : 'transparent'
                }}
            >
                {Icon && <ToolbarIcon icon={Icon} />}
                {children}
            </button>
        )
    }
)

ToolbarButton.displayName = "ToolbarButton"

export default ToolbarButton;