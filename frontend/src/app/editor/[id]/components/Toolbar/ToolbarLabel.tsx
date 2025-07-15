
import { cn } from "@/lib/utils";

interface ToolbarLabelProps {
    label: string;
    className?: string;
    isActive?: boolean;
}

const ToolbarLabel = (props: ToolbarLabelProps) => {
    const { label, className = "", isActive = false } = props;

    return (
        <span
            className={"text-black text-sm"}
        >
            {label}
        </span>
    );
}

export default ToolbarLabel;