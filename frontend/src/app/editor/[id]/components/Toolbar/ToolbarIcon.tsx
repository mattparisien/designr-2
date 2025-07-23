import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolbarIconProps {
    icon: LucideIcon,
    strokeWidth?: number,
    className?: string
}

const ToolbarIcon = (props: ToolbarIconProps) => {

    const { icon: Icon, className, strokeWidth } = props;

    return <Icon className={cn("h-[18px] w-[18px]", className && className)} strokeWidth={`${strokeWidth || 2.5}px`} />
}

export default ToolbarIcon;