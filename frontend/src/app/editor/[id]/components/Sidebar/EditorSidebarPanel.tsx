import { SidebarShell } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import MasonryLayout from "./MasonryLayout";

export interface EditorSidebarPanelSection {
    id: string;
    title: string;
    items: {
        id: string;
        title: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ComponentType<React.HTMLAttributes<HTMLElement>>;
        onClick?: () => void;
        fill?: boolean;
    }[];
    // Add support for masonry layout for assets
    masonryItems?: {
        id: string;
        src: string;
        alt: string;
        width: number;
        height: number;
        onClick?: () => void;
    }[];
    layout?: 'grid' | 'masonry';
    loading?: boolean;
    emptyMessage?: string;
    onFilesDrop?: (files: File[]) => void; // Add this for drag and drop
}

interface EditorSidebarPanelProps {
    title: string | undefined;
    sections: EditorSidebarPanelSection[];
    customContent?: React.ReactNode;
}

const EditorSidebarPanel = ({ title, sections, customContent }: EditorSidebarPanelProps) => {
    return (
        <SidebarShell>
            <div className="w-full h-full flex flex-col" data-editor-interactive>
                {/* Fixed header */}
                <div className="px-8 pt-8 pb-4 flex-shrink-0">
                    <h2 className="font-bold text-lg">{title}</h2>
                </div>
                
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4">
                    {customContent ? (
                        customContent
                    ) : (
                        <div className="flex flex-col space-y-4 pb-4">
                            {sections.map((section) => (
                                <div key={section.id} className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">{section.title}</h3>
                                    
                                    {/* Render masonry layout for assets */}
                                    {section.layout === 'masonry' && section.masonryItems ? (
                                        <MasonryLayout
                                            items={section.masonryItems}
                                            className="w-full"
                                            columnCount={2}
                                            gap={8}
                                            loading={section.loading}
                                            emptyMessage={section.emptyMessage}
                                            onFilesDrop={section.onFilesDrop}
                                            enableDragDrop={section.id === "assets" && !!section.onFilesDrop}
                                        />
                                    ) : (
                                        /* Render regular grid layout */
                                        <div className={cn(
                                            "gap-2 mb-2",
                                            section.id === "colors" || section.id.startsWith("colors-") || section.id === "document-colors" ? "flex flex-wrap" : "grid grid-cols-2"
                                        )}>
                                            {section.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200",
                                                        section.id === "colors" || section.id.startsWith("colors-") || section.id === "document-colors" ? "p-1" : "space-x-2"
                                                    )}
                                                    onClick={e => {
                                                        if ((!section.id.startsWith("colors-") && section.id !== "document-colors") && item.onClick) {
                                                            console.log('Non-color item clicked:', item.id);
                                                            e.stopPropagation();
                                                            item.onClick();
                                                        }
                                                        // For color items (including document-colors), the onClick is handled by the icon itself
                                                    }}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            section.id === "colors" || section.id.startsWith("colors-") || section.id === "document-colors" ? "w-12 h-12" : "w-full h-full",
                                                            item.fill && !section.id.startsWith("colors-") && section.id !== "document-colors" ? "stroke-none" : null
                                                        )}
                                                        style={!section.id.startsWith("colors-") && section.id !== "document-colors" ? {
                                                            fill: item.fill ? "var(--color-text-secondary)" : "none"
                                                        } : undefined}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SidebarShell>
    )
}

export default EditorSidebarPanel;