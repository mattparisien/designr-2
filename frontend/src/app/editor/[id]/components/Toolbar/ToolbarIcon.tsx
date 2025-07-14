import { LucideIcon } from "lucide-react"

interface ToolbarIconProps {
    icon: LucideIcon
}

const ToolbarIcon = (props: ToolbarIconProps) => {

    const { icon: Icon } = props;

    return <Icon className="h-[17px] w-[17px]" strokeWidth="3px" />
}

export default ToolbarIcon;