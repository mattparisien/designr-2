import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ElevatedSurfaceProps extends React.ComponentPropsWithoutRef<"div"> {
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}


const ElevatedSurface = forwardRef<HTMLDivElement, ElevatedSurfaceProps>((props, ref) => {

    const { className, style, onMouseEnter, onMouseLeave, onClick, children, ...restProps } = props;

    return (
        <div
            ref={ref}
            className={cn("z-40 flex items-center bg-white/95 px-2.5 gap-1", className)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            {...restProps}
            style={{
                borderColor: "var(--elevated-surface-border)",
                borderWidth: "1px",
                backgroundColor: "var(--elevated-surface-bg)",
                boxShadow: "var(--shadow-toolbar-float)",
                borderRadius: "var(--elevated-surface-radius)",
                color: "var(--text-secondary)",
                fill: "var(--text-secondary)",
                ...style,
            }}

        >
            {children}
        </div>
    );
});

ElevatedSurface.displayName = 'ElevatedSurface';

export default ElevatedSurface;