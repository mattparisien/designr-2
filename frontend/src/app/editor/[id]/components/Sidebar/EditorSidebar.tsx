import { Sidebar } from "@/components/ui";
import { SidebarItem } from "@/components/ui/sidebar";
import { Circle, LayoutPanelTop, Minus, Palette, Shapes, Square, Triangle, Type } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import useEditorStore from "../../lib/stores/useEditorStore";
import EditorSidebarPanel, { EditorSidebarPanelSection } from "./EditorSidebarPanel";


const sections = [
    {
        title: "General",
        items: [
            {
                id: "design",
                title: "Design",
                href: "/editor/brand",
                icon: LayoutPanelTop,
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


const EditorSidebar = () => {

    const sidebarWrapper = useRef<HTMLDivElement>(null);
    const sidebar = useEditorStore((state) => state.sidebar);
    const sidebarPanel = useEditorStore((state) => state.sidebarPanel);
    const openSidebar = useEditorStore((state) => state.openSidebar);
    const closeSidebar = useEditorStore((state) => state.closeSidebar);
    const setSidebarWidth = useEditorStore((state) => state.setSidebarWidth);
    const isSidebarOpen = useEditorStore((state) => state.sidebar.isOpen);
    const currentPageId = useEditorStore((state) => state.currentPageId);
    const pages = useEditorStore((state) => state.pages);
    const addElement = useCanvasStore((state) => state.addElement);
    const selectedElement = useCanvasStore((state) => state.selectedElement);
    const updateElement = useCanvasStore((state) => state.updateElement);

    const activeItem = useMemo(() => {
        return sidebar.activeItemId ? sections.flatMap(section => section.items).find(item => item.id === sidebar.activeItemId) || null : null;
    }, [sidebar.activeItemId]);

    const getSidebarWidth = (): number => {
        const sidebarWidth = sidebarWrapper.current?.getBoundingClientRect().width || 0;
        return sidebarWidth;
    }

    const handleItemClick = useCallback((item: SidebarItem) => {
        if (item.id === activeItem?.id) {
            closeSidebar();
        } else {
            openSidebar(item.id);
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
    }, [isSidebarOpen, setSidebarWidth]);

    const panelSections = useMemo(() => {
        // If sidebar panel is open for colors, show color picker - this takes priority
        if (sidebarPanel.isOpen && (sidebarPanel.activeItemId === "background-color" || sidebarPanel.activeItemId === "text-color")) {
            const isBackgroundColor = sidebarPanel.activeItemId === "background-color";
            const colors = [
                // Grayscale row
                "#000000", // Black
                "#525252", // Dark gray
                "#737373", // Medium gray
                "#a3a3a3", // Light gray
                "#d4d4d4", // Very light gray
                "#ffffff", // White
                
                // Red/Pink row
                "#dc2626", // Red
                "#ef4444", // Light red
                "#ec4899", // Pink
                "#c084fc", // Light purple
                "#8b5cf6", // Purple
                "#6366f1", // Indigo
                
                // Blue/Cyan row
                "#0891b2", // Teal
                "#06b6d4", // Cyan
                "#7dd3fc", // Light cyan
                "#3b82f6", // Blue
                "#6366f1", // Blue purple
                "#1e40af", // Dark blue
                
                // Green/Yellow row
                "#16a34a", // Green
                "#84cc16", // Lime
                "#bef264", // Light lime
                "#fbbf24", // Yellow
                "#f59e0b", // Orange
                "#f97316", // Dark orange
            ];

            return [{
                id: "colors",
                title: isBackgroundColor ? "Shape Colors" : "Text Colors",
                items: colors.map((color, index) => ({
                    id: `color-${index}`,
                    title: color,
                    icon: ((props: React.HTMLAttributes<HTMLElement>) => (
                        <div
                            {...props}
                            className={`w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors ${props.className || ''}`}
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (selectedElement) {
                                    if (isBackgroundColor && selectedElement.kind === "shape") {
                                        // Update shape background color
                                        updateElement(selectedElement.id, { backgroundColor: color });
                                    } else if (!isBackgroundColor && selectedElement.kind === "text") {
                                        // Update text color
                                        updateElement(selectedElement.id, { color: color });
                                    }
                                }
                                // Don't close the panel - keep it open for multiple color selections
                            }}
                        />
                    )) as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
                }))
            }];
        }

        // Original shape panel logic - only if color panel is not open
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
                break;
            default:
                break;
        }

        return sections;
    }, [activeItem, addShape, addLine, sidebarPanel, selectedElement, updateElement]);


    return <div className="inline-flex relative z-[var(--z-editor-sidebar)]" ref={sidebarWrapper}>
        <Sidebar
            isDefaultCollapsed
            sections={sections}
            onItemClick={handleItemClick}
        />
        {(sidebar.isOpen || sidebarPanel.isOpen) && (
            <EditorSidebarPanel
                title={sidebarPanel.isOpen ?
                    (sidebarPanel.activeItemId === "background-color" ? "Shape Color" :
                        sidebarPanel.activeItemId === "text-color" ? "Text Color" :
                            activeItem?.title) :
                    activeItem?.title
                }
                sections={panelSections}
            />
        )}

    </div >

}

export default EditorSidebar;