import { Sidebar } from "@/components/ui";
import { SidebarItem } from "@/components/ui/sidebar";
import { Circle, LayoutPanelTop, LineSquiggle, Palette, Shapes, Square, Triangle, Type, Minus } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import useEditorStore from "../../lib/stores/useEditorStore";
import EditorSidebarPanel, { EditorSidebarPanelSection } from "./EditorSidebarPanel";


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

    const panelSections = useMemo(() => {
        console.log(activeItem)
        if (!activeItem) return [];

        const sections: EditorSidebarPanelSection[] = [];

        switch (activeItem.id) {
            case "shape":
                sections.push({
                    id: "shapes",
                    title: "Shapes",
                    items: [
                        {
                            id: "circle",
                            title: "Circle",
                            icon: Circle,
                            fill: true,
                            onClick: () => console.log("Add circle clicked")
                        },
                        {
                            id: "square",
                            title: "Square",
                            icon: Square,
                            fill: true,
                            onClick: () => console.log("Edit Shape Clicked")
                        },
                        {
                            id: "triangle",
                            title: "Triangle",
                            icon: Triangle,
                            fill: true,
                            onClick: () => console.log("Edit Shape Clicked")
                        },
                        {
                            id: "line",
                            title: "Line",
                            icon: Minus,
                            onClick: () => console.log("Edit Shape Clicked")
                        }
                    ]
                })
            default:

        }

        return sections;
    }, [activeItem]);


    return <div className="inline-flex relative z-[var(--z-editor-sidebar)]" ref={sidebarWrapper}>
        <Sidebar
            isDefaultCollapsed
            sections={sections}
            onItemClick={handleItemClick}
        />
        {sidebar.isOpen && <EditorSidebarPanel title={activeItem?.title} sections={panelSections} />}

    </div >

}

export default EditorSidebar;