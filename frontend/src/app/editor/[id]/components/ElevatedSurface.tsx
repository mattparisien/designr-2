import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ElevatedSurfaceProps {
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    children?: React.ReactNode;
}


const ElevatedSurface = forwardRef<HTMLDivElement, ElevatedSurfaceProps>((props, ref) => {

    const { className, style, onMouseEnter, onMouseLeave, onClick, children } = props;

    return (
        <div
            ref={ref}
            className={cn(" z-40 flex items-center bg-white/95 backdrop-blur-sm px-2.5 py-1.5 gap-1", className)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            data-editor-interactive="true"
            style={{
                borderColor: "var(--border-elevated-editor)",
                borderWidth: "1px",
                backgroundColor: "var(--bg-elevated-editor)",
                boxShadow: "var(--shadow-toolbar-float)",
                borderRadius: "var(--radius-elevated-editor)",
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