import { apiClient } from "@/lib/api";
import { Asset } from "@/lib/types/api";
import { Navigation } from "@/components/ui/navigation";
import { NavigationItem } from "@/lib/types/navigation";
import { Camera, Download, LayoutPanelTop, Palette, Shapes, Type, Circle, Square, Triangle, Minus } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ElementFactory } from "../../lib/factories/elementFactory";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import useEditorStore from "../../lib/stores/useEditorStore";
import { Sidebar } from "@/components/ui";
import { EDITOR_NAVIGATION } from "../../lib/constants/navigation";
import EditorSidebarPanel, { type EditorSidebarPanelSection } from "./EditorSidebarPanel";
import { DesignPanelContent } from "./DesignPanelContent";
import { ExportPanelContent } from "./ExportPanelContent";


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
            {
                id: "export",
                title: "Export",
                href: "/editor/export",
                icon: Download
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

    // Function to upload multiple image files
    const uploadAssets = useCallback(async (files: File[]) => {
        try {
            // Filter only image files
            const imageFiles = files.filter(file =>
                file.type.startsWith('image/') &&
                ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)
            );

            if (imageFiles.length === 0) {
                console.warn('No valid image files to upload');
                return;
            }

            // Upload each file
            const uploadPromises = imageFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', file.name);
                formData.append('userId', 'mock-user'); // TODO: Get actual user ID

                const response = await fetch('/api/assets', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                return response.json();
            });

            await Promise.all(uploadPromises);

            // Refresh assets list after upload
            await fetchAssets();
            console.log(`Successfully uploaded ${imageFiles.length} assets`);
        } catch (error) {
            console.error('Error uploading assets:', error);
        }
    }, [fetchAssets]);

    // Function to add an image asset to the canvas
    const addImageAsset = useCallback((asset: Asset) => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;

        // Create image element using the factory
        const imageElement = ElementFactory.createImageElement(
            { width: canvasWidth, height: canvasHeight },
            {
                src: asset.url,
                alt: asset.name,
                originalWidth: asset.metadata?.width || 200,
                originalHeight: asset.metadata?.height || 150
            },
            {
                maxWidth: 300
            }
        );

        addElement(imageElement, "image");
    }, [addElement, pages, currentPageId]);

    // Helper function to add a shape to the canvas
    const addShape = useCallback((shapeType: "rect" | "circle" | "triangle") => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;

        // Create shape element using the factory
        const shapeElement = ElementFactory.createShapeElement(
            { width: canvasWidth, height: canvasHeight },
            shapeType,
            {
                backgroundColor: "#3b82f6"
            }
        );

        addElement(shapeElement, "shape");
    }, [addElement, pages, currentPageId]);

    // Helper function to add a line to the canvas
    const addLine = useCallback(() => {
        const currentPage = pages.find(page => page.id === currentPageId);
        const canvasWidth = currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvas?.height || 600;

        // Create line element using the factory
        const lineElement = ElementFactory.createLineElement(
            { width: canvasWidth, height: canvasHeight },
            {
                backgroundColor: "#000000"
            }
        );

        addElement(lineElement, "line");
    }, [addElement, pages, currentPageId]);

    const activeItem = useMemo(() => {
        return sidebar.activeItemId ? sections.flatMap(section => section.items).find(item => item.id === sidebar.activeItemId) || null : null;
    }, [sidebar.activeItemId]);

    // Build dynamic panel sections based on active item
    const panelSections = useMemo<EditorSidebarPanelSection[]>(() => {
        const sectionsOut: EditorSidebarPanelSection[] = [];

        // Text color panel
        if (sidebarPanel.isOpen && sidebarPanel.activeItemId === 'text-color' && selectedElement?.type === 'text') {
            // Gather document colors from current page text & shape elements
            const currentPage = pages.find(p => p.id === currentPageId);
            const docColorSet = new Set<string>();
            currentPage?.canvas?.elements?.forEach(el => {
                if (el.type === 'text' && el.color) {
                    docColorSet.add(el.color);
                } else if (el.type === 'shape' && 'backgroundColor' in el && el.backgroundColor) {
                    docColorSet.add(el.backgroundColor);
                } else if (el.type === 'line' && 'backgroundColor' in el && el.backgroundColor) {
                    docColorSet.add(el.backgroundColor);
                }
            });
            const documentColors = Array.from(docColorSet).slice(0, 30);

            const DEFAULT_TEXT_COLORS = ['#000000', '#FFFFFF', '#1F2937', '#4B5563', '#9CA3AF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#D946EF', '#F472B6', '#0EA5E9', '#14B8A6', '#22C55E', '#65A30D', '#CA8A04'];

            const makeColorItem = (color: string, idPrefix: string) => ({
                id: `${idPrefix}-${color}`,
                title: color,
                icon: (() => <div className="w-8 h-8 rounded-full border border-gray-300" style={{ backgroundColor: color }} />) as React.ComponentType<React.SVGProps<SVGSVGElement>>, // satisfy type expecting an icon component
                onClick: () => {
                    if (selectedElement?.type === 'text') {
                        updateElement(selectedElement.id, { color });
                    }
                }
            });

            if (documentColors.length) {
                sectionsOut.push({
                    id: 'text-color-doc',
                    title: 'Document Colors',
                    items: documentColors.map(c => makeColorItem(c, 'doc'))
                });
            }
            sectionsOut.push({
                id: 'text-color-defaults',
                title: 'Default Colors',
                items: DEFAULT_TEXT_COLORS.map(c => makeColorItem(c, 'def'))
            });
        }

        // Shape/background color panel
        if (sidebarPanel.isOpen && sidebarPanel.activeItemId === 'background-color' && selectedElement && (selectedElement.type === 'shape' || selectedElement.type === 'line')) {
            const currentPage = pages.find(p => p.id === currentPageId);
            const docColorSet = new Set<string>();
            currentPage?.canvas?.elements?.forEach(el => {
                if (el.type === 'shape' && 'backgroundColor' in el && el.backgroundColor) docColorSet.add(el.backgroundColor);
                if (el.type === 'line' && 'backgroundColor' in el && el.backgroundColor) docColorSet.add(el.backgroundColor);
                if (el.type === 'text' && el.color) docColorSet.add(el.color); // include text colors for convenience
            });
            const documentColors = Array.from(docColorSet).slice(0, 30);
            const DEFAULT_SHAPE_COLORS = ['#3B82F6', '#2563EB', '#1D4ED8', '#000000', '#FFFFFF', '#F87171', '#EF4444', '#DC2626', '#F59E0B', '#D97706', '#10B981', '#059669', '#14B8A6', '#06B6D4', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#D946EF', '#F472B6', '#475569', '#64748B', '#94A3B8', '#CBD5E1'];

            const makeShapeColorItem = (color: string, idPrefix: string) => ({
                id: `${idPrefix}-${color}`,
                title: color,
                icon: (() => <div className="w-8 h-8 rounded-md border border-gray-300" style={{ backgroundColor: color }} />) as React.ComponentType<React.SVGProps<SVGSVGElement>>,
                onClick: () => {
                    if (selectedElement.type === 'shape') {
                        updateElement(selectedElement.id, { backgroundColor: color });
                    } else if (selectedElement.type === 'line') {
                        updateElement(selectedElement.id, { backgroundColor: color });
                    }
                }
            });
            if (documentColors.length) {
                sectionsOut.push({ id: 'shape-color-doc', title: 'Document Colors', items: documentColors.map(c => makeShapeColorItem(c, 'doc')) });
            }
            sectionsOut.push({ id: 'shape-color-defaults', title: 'Default Colors', items: DEFAULT_SHAPE_COLORS.map(c => makeShapeColorItem(c, 'def')) });
        }

        // Existing active item driven sections
        if (activeItem) {
            switch (activeItem.id) {
                case "shape":
                    sectionsOut.push({
                        id: "shapes",
                        title: "Shapes",
                        items: [
                            { id: "circle", title: "Circle", icon: Circle, fill: true, onClick: () => addShape("circle") },
                            { id: "square", title: "Square", icon: Square, fill: true, onClick: () => addShape("rect") },
                            { id: "triangle", title: "Triangle", icon: Triangle, fill: true, onClick: () => addShape("triangle") },
                            { id: "line", title: "Line", icon: Minus, onClick: () => addLine() },
                        ]
                    });
                    break;
                case "assets":
                    sectionsOut.push({
                        id: "assets",
                        title: "Assets",
                        layout: 'masonry',
                        loading: loadingAssets,
                        emptyMessage: "No images found",
                        items: [],
                        onFilesDrop: uploadAssets,
                        masonryItems: assets
                            .filter(asset => (asset.type === 'image' || asset.mimeType.startsWith('image/')) && asset.metadata?.width && asset.metadata?.height)
                            .map(asset => ({
                                id: asset._id,
                                src: asset.thumbnail || asset.url,
                                alt: asset.name,
                                width: asset.metadata!.width!,
                                height: asset.metadata!.height!,
                                onClick: () => addImageAsset(asset)
                            }))
                    });
                    break;
                default:
                    break;
            }
        }

        return sectionsOut;
    }, [activeItem, sidebarPanel.isOpen, sidebarPanel.activeItemId, selectedElement, pages, currentPageId, addShape, addLine, assets, loadingAssets, uploadAssets, addImageAsset, updateElement]);

    const getSidebarWidth = (): number => {
        const sidebarWidth = sidebarWrapper.current?.getBoundingClientRect().width || 0;
        return sidebarWidth;
    }

    const handleItemClick = useCallback((item: NavigationItem) => {
        if (item.id === activeItem?.id) {
            closeSidebar();
        } else {
            openSidebar(item.id);
        }

    }, [activeItem, openSidebar, closeSidebar])

    // Effect to fetch assets when assets panel is opened
    useEffect(() => {
        if (activeItem?.id === "assets") {
            fetchAssets();
        }
    }, [activeItem?.id, fetchAssets]);


    useLayoutEffect(() => {
        if (sidebarWrapper.current) {
            const width = getSidebarWidth();
            setSidebarWidth(width);
        }
    }, [isSidebarOpen, setSidebarWidth]);

    return <div className="inline-flex relative z-[var(--z-editor-sidebar)]" ref={sidebarWrapper}>
        <Sidebar>
            <Navigation navigation={EDITOR_NAVIGATION} onItemClick={handleItemClick} activeItem={sidebar.activeItemId || undefined} />
            <> </>
        </Sidebar>
        {(sidebar.isOpen || sidebarPanel.isOpen) && (
            <EditorSidebarPanel
                title={sidebarPanel.isOpen ?
                    (sidebarPanel.activeItemId === "background-color" ? "Shape Color" :
                        sidebarPanel.activeItemId === "text-color" ? "Text Color" :
                            activeItem?.title) :
                    activeItem?.title
                }
                sections={panelSections}
                customContent={activeItem?.id === "design" ? <DesignPanelContent /> :
                    activeItem?.id === "export" ? <ExportPanelContent /> :
                        undefined}
            />
        )}

    </div >
}

export default EditorSidebar;