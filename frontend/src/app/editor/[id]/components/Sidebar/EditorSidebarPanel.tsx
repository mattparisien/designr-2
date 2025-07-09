import { SidebarShell } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";

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
}

interface EditorSidebarPanelProps {
    title: string | undefined;
    sections: EditorSidebarPanelSection[]
}

const EditorSidebarPanel = ({ title, sections }: EditorSidebarPanelProps) => {
    return (
        <SidebarShell>
            <div className="w-full h-full" data-editor-interactive>
                <div className="px-4">
                    <div className="pt-8 px-4">
                        <h2 className="font-bold text-lg">{title}</h2>
                    </div>
                    <div className="flex flex-col space-y-4 mt-4">
                        {sections.map((section) => (
                            <div key={section.id} className="mt-4">
                                <div className={cn(
                                    "gap-2 mb-2",
                                    section.id === "colors" ? "grid grid-cols-4" : "grid grid-cols-2"
                                )}>
                                    {section.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200",
                                                section.id === "colors" ? "p-1" : "space-x-2"
                                            )}
                                            onClick={e => {
                                                if (section.id !== "colors" && item.onClick) {
                                                    console.log('Non-color item clicked:', item.id);
                                                    e.stopPropagation();
                                                    item.onClick();
                                                }
                                            }}
                                        >
                                            <item.icon
                                                className={cn(
                                                    section.id === "colors" ? "w-8 h-8" : "w-full h-full",
                                                    item.fill && section.id !== "colors" ? "stroke-none" : null
                                                )}
                                                style={section.id !== "colors" ? {
                                                    fill: item.fill ? "var(--color-text-secondary)" : "none"
                                                } : undefined}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SidebarShell>
    )
}

export default EditorSidebarPanel;