import { Sidebar } from "@/components/ui";
import { SidebarItem } from "@/components/ui/sidebar";
import { Circle, LayoutPanelTop, Minus, Palette, Shapes, Square, Triangle, Type, Camera } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import useEditorStore from "../../lib/stores/useEditorStore";
import EditorSidebarPanel, { EditorSidebarPanelSection } from "./EditorSidebarPanel";
import { Asset } from "@/lib/types/api";
import { apiClient } from "@/lib/api";


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
            {
                id: "assets",
                title: "Assets",
                href: "/editor/assets",
                icon: Camera
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

    // State for assets
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    // Function to fetch assets from backend
    const fetchAssets = useCallback(async () => {
        setLoadingAssets(true);
        try {
            const response = await apiClient.getAssets();
            // Handle both response.data and direct response formats
            const assetsData = response.data || response || [];
            setAssets(Array.isArray(assetsData) ? assetsData : []);
        } catch (error) {
            console.error('Error fetching assets:', error);
            setAssets([]);
        } finally {
            setLoadingAssets(false);
        }
    }, []);

    // Function to add an image asset to the canvas
    const addImageAsset = useCallback((asset: Asset) => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;

        // Use actual asset dimensions if available, otherwise use defaults
        const originalWidth = asset.metadata?.width || 200;
        const originalHeight = asset.metadata?.height || 150;
        
        // Calculate scaled dimensions to fit within a reasonable size on canvas
        const maxWidth = 300; // Maximum width for added images
        const aspectRatio = originalHeight / originalWidth;
        
        let finalWidth = originalWidth;
        let finalHeight = originalHeight;
        
        // Scale down if the image is too large
        if (originalWidth > maxWidth) {
            finalWidth = maxWidth;
            finalHeight = maxWidth * aspectRatio;
        }

        const canvasCenter = {
            x: canvasWidth / 2,
            y: canvasHeight / 2
        };

        addElement({
            kind: "image" as const,
            x: canvasCenter.x - finalWidth / 2,
            y: canvasCenter.y - finalHeight / 2,
            width: finalWidth,
            height: finalHeight,
            src: asset.url,
            alt: asset.name,
            opacity: 1,
            rotation: 0
        });
    }, [addElement, pages, currentPageId]);

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

    // Extract document colors from current page elements
    const getDocumentColors = useCallback(() => {
        const currentPage = pages.find(page => page.id === currentPageId);
        if (!currentPage?.elements) return [];

        const colorsSet = new Set<string>();
        
        currentPage.elements.forEach(element => {
            // Extract colors based on element type
            if (element.kind === "shape" && element.backgroundColor) {
                colorsSet.add(element.backgroundColor);
            }
            if (element.kind === "text" && element.color) {
                colorsSet.add(element.color);
            }
            if (element.kind === "line" && element.backgroundColor) {
                colorsSet.add(element.backgroundColor);
            }
        });

        return Array.from(colorsSet);
    }, [pages, currentPageId]);


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

            const documentColors = getDocumentColors();

            const sections = [];

            // Add Document Colors section first (if there are colors in the document)
            if (documentColors.length > 0) {
                sections.push({
                    id: "document-colors",
                    title: "Document Colors",
                    items: documentColors.map((color, index) => ({
                        id: `doc-color-${index}`,
                        title: color,
                        icon: ((props: React.HTMLAttributes<HTMLElement>) => (
                            <div
                                {...props}
                                className={`w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors ${props.className || ''}`}
                                style={{ backgroundColor: color }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedElement) {
                                        if (isBackgroundColor && selectedElement.kind === "shape") {
                                            updateElement(selectedElement.id, { backgroundColor: color });
                                        } else if (!isBackgroundColor && selectedElement.kind === "text") {
                                            updateElement(selectedElement.id, { color: color });
                                        }
                                    }
                                }}
                            />
                        )) as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
                    }))
                });
            }

            // Add Core Colors section second
            sections.push({
                id: "colors",
                title: "Core Colors",
                items: colors.map((color, index) => ({
                    id: `color-${index}`,
                    title: color,
                    icon: ((props: React.HTMLAttributes<HTMLElement>) => (
                        <div
                            {...props}
                            className={`w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors ${props.className || ''}`}
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
            });

            return sections;
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
                });
                break;
            case "assets":
                sections.push({
                    id: "assets",
                    title: "Assets",
                    layout: 'masonry',
                    loading: loadingAssets,
                    emptyMessage: "No images found",
                    items: [], // Empty regular items array since we're using masonryItems
                    masonryItems: assets
                        .filter(asset => asset.type === 'image' || asset.mimeType.startsWith('image/'))
                        .filter(asset => asset.metadata?.width && asset.metadata?.height) // Only include assets with dimensions
                        .map((asset) => ({
                            id: asset._id,
                            src: asset.thumbnail || asset.url,
                            alt: asset.name,
                            width: asset.metadata!.width!, // Safe to use ! after filter
                            height: asset.metadata!.height!, // Safe to use ! after filter
                            onClick: () => {
                                addImageAsset(asset);
                            }
                        }))
                })
                break;
            default:
                break;
        }

        return sections;
    }, [activeItem, addShape, addLine, sidebarPanel, selectedElement, updateElement, assets, loadingAssets, addImageAsset, getDocumentColors]);

    // Effect to fetch assets when assets panel is opened
    useEffect(() => {
        if (activeItem?.id === "assets") {
            fetchAssets();
        }
    }, [activeItem?.id, fetchAssets]);


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