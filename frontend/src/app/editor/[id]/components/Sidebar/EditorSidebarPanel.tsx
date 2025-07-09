import { SidebarShell } from "@/components/ui/sidebar"

export interface EditorSidebarPanelSection {
    id: string;
    title: string;
    items: {
        id: string;
        title: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        onClick?: () => void;
    }[];
}

interface EditorSidebarPanelProps {
    title: string | undefined;
    sections: EditorSidebarPanelSection[]
}

const EditorSidebarPanel = ({ title, sections }: EditorSidebarPanelProps) => {
    return (
        <SidebarShell>
            <div className="px-4">
                <div className="pt-8 px-4">
                    <h2 className="font-bold text-lg">{title}</h2>
                </div>
                <div className="flex flex-col space-y-4 mt-4">
                    {sections.map((section) => (
                        <div key={section.id} className="mt-4">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {section.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={item.onClick}>
                                        <item.icon className="w-full h-full stroke-none" style={{
                                            fill: "var(--color-text-secondary)"
                                        }}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </SidebarShell>
    )
}

export default EditorSidebarPanel;