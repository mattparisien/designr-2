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
    const closeSidebarPanel = useEditorStore((state) => state.closeSidebarPanel);


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
        
        // If sidebar panel is open for colors, show color picker
        if (sidebarPanel.isOpen && (sidebarPanel.activeItemId === "background-color" || sidebarPanel.activeItemId === "text-color")) {
            const isBackgroundColor = sidebarPanel.activeItemId === "background-color";
            const colors = [
                "#3b82f6", // Blue
                "#ef4444", // Red  
                "#10b981", // Green
                "#f59e0b", // Yellow
                "#8b5cf6", // Purple
                "#f97316", // Orange
                "#06b6d4", // Cyan
                "#84cc16", // Lime
                "#ec4899", // Pink
                "#6b7280", // Gray
                "#000000", // Black
                "#ffffff", // White
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
                        />
                    )) as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
                    onClick: () => {
                        if (selectedElement) {
                            console.log('=== COLOR UPDATE DEBUG ===');
                            console.log('Selected element before update:', JSON.stringify(selectedElement, null, 2));
                            console.log('Element kind:', selectedElement.kind);
                            console.log('Element shapeType:', selectedElement.shapeType);
                            console.log('Current backgroundColor:', selectedElement.backgroundColor);
                            console.log('Applying color:', color);
                            console.log('Is background color?', isBackgroundColor);
                            
                            if (isBackgroundColor && selectedElement.kind === "shape") {
                                // Update shape background color
                                console.log('Updating shape backgroundColor to:', color);
                                updateElement(selectedElement.id, { backgroundColor: color });
                                
                                // Let's also check if the update worked by logging after a short delay
                                setTimeout(() => {
                                    const canvasStore = useCanvasStore.getState();
                                    const editorStore = useEditorStore.getState();
                                    const currentPage = editorStore.pages.find(p => p.id === editorStore.currentPageId);
                                    const updatedElement = currentPage?.elements.find(el => el.id === selectedElement.id);
                                    const selectedFromStore = canvasStore.selectedElement;
                                    
                                    console.log('=== AFTER UPDATE ===');
                                    console.log('Element from page:', updatedElement);
                                    console.log('Selected element from store:', selectedFromStore);
                                    console.log('Updated backgroundColor:', updatedElement?.backgroundColor);
                                    console.log('===================');
                                }, 100);
                                
                            } else if (!isBackgroundColor && selectedElement.kind === "text") {
                                // Update text color
                                console.log('Updating text color to:', color);
                                updateElement(selectedElement.id, { color: color });
                            } else {
                                console.log('No matching condition - element kind:', selectedElement.kind, 'isBackground:', isBackgroundColor);
                            }
                            
                            // Close the sidebar panel after color selection
                            closeSidebarPanel();
                        } else {
                            console.log('No element selected');
                        }
                    }
                }))
            }];
        }

        // Original shape panel logic
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
    }, [activeItem, addShape, addLine, sidebarPanel, selectedElement, updateElement, closeSidebarPanel]);


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