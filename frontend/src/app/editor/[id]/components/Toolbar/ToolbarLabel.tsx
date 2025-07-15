

import { cn } from "@/lib/utils";

interface ToolbarLabelProps {
    label: string;
    className?: string;
    isActive?: boolean;
}

const ToolbarLabel = (props: ToolbarLabelProps) => {
    const { label } = props;

    return (
        <span
            className={cn("text-black text-sm", props.className)}
        >
            {label}
        </span>
    );
}

export default ToolbarLabel;