import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react"

interface ToolbarIconProps {
    icon: LucideIcon
}

const ToolbarIcon = (props: ToolbarIconProps) => {

    const { icon: Icon } = props;

    return <Icon className={cn("h-[18px] w-[18px]")} strokeWidth="2.5px" />
}

export default ToolbarIcon;