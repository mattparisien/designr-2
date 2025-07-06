import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ToolbarItem {
    id: string;
    title: string;
    label?: React.ReactNode
    icon?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;

}

interface ToolbarSection {
    id: string;
    title: string;
    items: ToolbarItem[]
}

interface ToolbarProps {
    sections?: ToolbarSection[];
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
    const {
        onMouseEnter,
        onMouseLeave,
        onClick,
        style,
        children,
        sections
    } = props;

    return <div
        ref={ref}
        className={cn("absolute left-1/2 -translate-x-1/2 z-40 flex items-center bg-white/95 backdrop-blur-sm px-2.5 py-1.5 gap-1", {
            [props.className || '']: !!props.className
        })}
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
        
        {children && children}
        {sections && sections.length && sections.map(section => (
            <div key={section.id} className="flex flex-col items-center">
                {section.title && <span className="text-xs font-semibold text-gray-600 mb-1">{section.title}</span>}
                <div className="flex space-x-1">
                    {section.items.map(item => (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title={item.title}
                        >
                            {item.icon || item.label || item.title}
                        </button>
                    ))}
                </div>
            </div>
        ))}
    </div>
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;