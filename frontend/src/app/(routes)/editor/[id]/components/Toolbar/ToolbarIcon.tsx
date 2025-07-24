import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolbarIconProps {
    icon: LucideIcon,
    strokeWidth?: number,
    size?: "sm" | "md" | "lg" | "xl",
    className?: string
}

const ToolbarIcon = (props: ToolbarIconProps) => {

    const { icon: Icon, className, strokeWidth, size = "md" } = props;

    const sizeClasses = {
        sm: "h-[16px] w-[16px]",
        md: "h-[18px] w-[18px]",
        lg: "h-[20px] w-[20px]",
        xl: "h-[24px] w-[24px]",
    };

    return <Icon className={cn(sizeClasses[size], className && className)} strokeWidth={`${strokeWidth || 2.5}px`} />
}

export default ToolbarIcon;