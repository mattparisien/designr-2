import { Sidebar } from "@/components/ui";
import { SidebarItem, SidebarShell } from "@/components/ui/sidebar";
import { LayoutPanelTop, Palette, Shapes, Type } from "lucide-react";
import { useCallback, useRef, useState, useLayoutEffect } from "react";
import useEditorStore from "../../lib/stores/useEditorStore";


interface EditorSidebarProps {

}


const EditorSidebar = (props: EditorSidebarProps) => {

    const { } = props;
    const [activeItem, setActiveItem] = useState<SidebarItem | null>(null);

    const sidebarWrapper = useRef(null);
    const sidebar = useEditorStore((state) => state.sidebar);
    const openSidebar = useEditorStore((state) => state.openSidebar);
    const closeSidebar = useEditorStore((state) => state.closeSidebar);
    const setSidebarWidth = useEditorStore((state) => state.setSidebarWidth);
    const isSidebarOpen = useEditorStore((state) => state.sidebar.isOpen);
    

    const sections = [
        {
            title: "General",
            items: [
                {
                    id: "design",
                    title: "Design",
                    href: "/editor/brand",
                    icon: LayoutPanelTop
                },
                {
                    id: "brand",
                    title: "Brands",
                    href: "/editor/brand",
                    icon: Palette
                },
                {
                    id: "shape",
                    title: "Shapes",
                    href: "/editor/brand",
                    icon: Shapes
                },
                {
                    id: "text",
                    title: "Text",
                    href: "/editor/brand",
                    icon: Type
                },
            ],
        },
    ];


    const getSidebarWidth = (): number => {
        const sidebarWidth = sidebarWrapper.current?.getBoundingClientRect().width || 0;
        return sidebarWidth;
    }

    const handleItemClick = useCallback((item: SidebarItem) => {
        if (item.id === activeItem?.id) {
            closeSidebar();
            setActiveItem(null);
        } else {
            openSidebar(item.id);
            setActiveItem(item);
        }

    }, [activeItem, openSidebar, closeSidebar])

    useLayoutEffect(() => {
        if (sidebarWrapper.current) {
            const width = getSidebarWidth();
            setSidebarWidth(width);
        }
    }, [isSidebarOpen]);


    return <div className="inline-flex relative z-[var(--z-editor-sidebar)]" ref={sidebarWrapper}>
        <Sidebar
            isDefaultCollapsed
            sections={sections}
            onItemClick={handleItemClick}
        />
        {sidebar.isOpen && <SidebarShell>
            <div className="px-4">
                <div className="pt-8 px-4">
                <h2 className="font-bold text-lg">{activeItem?.title}</h2>
                </div>
            </div>
            {/* <div className="w-[var(--sidebar-width)] h-screen z-[var(--z-editor-sidebar)]" style={{
                backgroundColor: "var(--bg-elevated-secondary)"
            }}> */}
        </SidebarShell>}

    </div >

}

export default EditorSidebar;