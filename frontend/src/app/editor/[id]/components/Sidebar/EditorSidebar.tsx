import { Sidebar } from "@/components/ui";
import { SidebarItem } from "@/components/ui/sidebar";
import { Circle, LayoutPanelTop, Minus, Palette, Shapes, Square, Triangle, Type } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import useEditorStore from "../../lib/stores/useEditorStore";
import EditorSidebarPanel, { EditorSidebarPanelSection } from "./EditorSidebarPanel";


interface EditorSidebarProps {

}


const EditorSidebar = (props: EditorSidebarProps) => {

    const { } = props;
    const [activeItem, setActiveItem] = useState<SidebarItem | null>(null);

    const sidebarWrapper = useRef<HTMLDivElement>(null);
    const sidebar = useEditorStore((state) => state.sidebar);
    const openSidebar = useEditorStore((state) => state.openSidebar);
    const closeSidebar = useEditorStore((state) => state.closeSidebar);
    const setSidebarWidth = useEditorStore((state) => state.setSidebarWidth);
    const isSidebarOpen = useEditorStore((state) => state.sidebar.isOpen);
    const currentPageId = useEditorStore((state) => state.currentPageId);
    const pages = useEditorStore((state) => state.pages);
    const addElement = useCanvasStore((state) => state.addElement);


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

    // Helper function to add a shape to the canvas
    const addShape = useCallback((shapeType: "rect" | "circle" | "triangle") => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;
        
        const defaultShapeSize = 100;
        const canvasCenter = { 
            x: canvasWidth / 2, 
            y: canvasHeight / 2 
        };

        addElement({
            kind: "shape" as const,
            x: canvasCenter.x - defaultShapeSize / 2,
            y: canvasCenter.y - defaultShapeSize / 2,
            width: defaultShapeSize,
            height: defaultShapeSize,
            shapeType,
            backgroundColor: "#3b82f6", // Default blue color
            borderWidth: 0,
            borderColor: "#000000",
            opacity: 1,
            rotation: 0
        });
    }, [addElement, pages, currentPageId]);

    // Helper function to add a line to the canvas
    const addLine = useCallback(() => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;
        
        const defaultLineLength = 150;
        const canvasCenter = { 
            x: canvasWidth / 2, 
            y: canvasHeight / 2 
        };

        addElement({
            kind: "line" as const,
            x: canvasCenter.x - defaultLineLength / 2,
            y: canvasCenter.y,
            width: defaultLineLength,
            height: 2, // Line thickness
            backgroundColor: "#000000",
            opacity: 1,
            rotation: 0
        });
    }, [addElement, pages, currentPageId]);

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
                            onClick: () => addShape("circle")
                        },
                        {
                            id: "square",
                            title: "Square",
                            icon: Square,
                            fill: true,
                            onClick: () => addShape("rect")
                        },
                        {
                            id: "triangle",
                            title: "Triangle",
                            icon: Triangle,
                            fill: true,
                            onClick: () => addShape("triangle")
                        },
                        {
                            id: "line",
                            title: "Line",
                            icon: Minus,
                            onClick: () => addLine()
                        }
                    ]
                })
            default:

        }

        return sections;
    }, [activeItem, addShape, addLine]);


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