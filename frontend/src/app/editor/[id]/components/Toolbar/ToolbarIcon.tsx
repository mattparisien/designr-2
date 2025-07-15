import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolbarIconProps {
    icon: LucideIcon,
    className?: string
}

const ToolbarIcon = (props: ToolbarIconProps) => {

    const { icon: Icon, className } = props;

    return <Icon className={cn("h-[18px] w-[18px]", className && className)} strokeWidth="2.5px" />
}

export default ToolbarIcon;