

import { cn } from "@/lib/utils";

interface ToolbarLabelProps {
    label: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    className?: string;
    isActive?: boolean;
}

const ToolbarLabel = (props: ToolbarLabelProps) => {
    const { label, size = "sm" } = props;

    return (
        <span
            className={cn("text-black", {
                "text-xs": size === "xs",
                "text-sm": size === "sm",
                "text-md": size === "md",
                "text-lg": size === "lg",
                "text-xl": size === "xl",
                "text-2xl": size === "2xl",
                "text-3xl": size === "3xl",
            }, props.className)}
        >
            {label}
        </span>
    );
}

export default ToolbarLabel;