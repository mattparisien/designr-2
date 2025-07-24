import { forwardRef } from "react";
import { motion, HTMLMotionProps, Easing } from "framer-motion";
import { cn } from "@/lib/utils";

interface ElevatedSurfaceProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
    transition?: {
        initialY?: number;
        duration?: number;
        ease?: Easing;
        enabled?: boolean;
    };
}


const ElevatedSurface = forwardRef<HTMLDivElement, ElevatedSurfaceProps>((props, ref) => {

    const { className, style, onMouseEnter, onMouseLeave, onClick, children, transition, ...restProps } = props;

    const {
        initialY = 20,
        duration = 0.23,
        ease = "easeOut" as const,
        enabled = true
    } = transition || {};

    return (
        <motion.div
            ref={ref}
            className={cn("z-40 flex items-center bg-white/95 gap-1", className)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            initial={enabled ? { y: initialY } : undefined}
            animate={enabled ? { y: 0 } : undefined}
            exit={enabled ? { y: initialY } : undefined}
            transition={enabled ? {
                duration,
                ease
            } : undefined}
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
            {...restProps}
        >
            {children}
        </motion.div>
    );
});

ElevatedSurface.displayName = 'ElevatedSurface';

export default ElevatedSurface;