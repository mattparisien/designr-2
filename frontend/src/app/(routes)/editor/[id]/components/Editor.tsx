"use client"

import { addToRefArrayOfObjects } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_ZOOM, MIN_ZOOM } from "../lib/constants";
import { ElementFactory } from "../lib/factories/elementFactory";
import useElementActionBar from "../lib/hooks/useElementActionBar";
import useCanvasStore, { useCurrentCanvasSize, useCurrentPageElements } from "../lib/stores/useCanvasStore";
import useEditorStore from "../lib/stores/useEditorStore";
import { TextElement } from "../lib/types/canvas";
import BottomBar from "./BottomBar";
import Canvas from "./Canvas/Canvas";
import ElementControls from "./Canvas/controls/ElementControls";
import { ElementActionBar } from "./Canvas/ElementActionBar";
import { ElementPropertyBar } from "./ElementPropertyBar";

interface EditorProps {
    designId: string;
}

/**
 * Editor component serves as the main wrapper for the canvas editing experience.
 * It focuses exclusively on the canvas area and related editing functionality.
 */
export default function Editor({ designId }: EditorProps) {
    // Reference for the editor container
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const elementPropertyBarRef = useRef<HTMLDivElement>(null);
    const elementActionBarRef = useRef<HTMLDivElement>(null);
    const elementRefs = useRef<Array<{ id: string; node: HTMLDivElement }>>([]);



    const [zoom, setZoom] = useState(30) // 25 – 200 %
    const [isFullscreen, setIsFullscreen] = useState(false)
    // Track which page thumbnail is selected (for delete functionality)
    const [selectedPageThumbnail, setSelectedPageThumbnail] = useState<string | null>(null)

    // Use Zustand stores directly
    const pages = useEditorStore(state => state.pages)
    const currentPageIndex = useEditorStore(state => state.currentPageIndex)
    const deletePage = useEditorStore(state => state.deletePage)
    const isEditMode = useEditorStore(state => state.isEditMode)


    // Canvas store selectors
    const canvasSize = useCurrentCanvasSize()
    const selectedElementIds = useCanvasStore(state => state.selectedElementIds)
    const selectedElement = useCanvasStore(state => state.selectedElement)
    const elements = useCurrentPageElements()
    const updateElement = useCanvasStore(state => state.updateElement)
    const clearSelection = useCanvasStore(state => state.clearSelection)
    const deleteSelectedElements = useCanvasStore(state => state.deleteSelectedElements)
    const selectElement = useCanvasStore(state => state.selectElement)
    const deselectElement = useCanvasStore(state => state.deselectElement);
    const selectCanvas = useCanvasStore(state => state.selectCanvas);
    const isCanvasSelected = useCanvasStore(state => state.isCanvasSelected);
    const isSidebarPanelOpen = useEditorStore(state => state.sidebarPanel.isOpen);
    const closeSidebarPanel = useEditorStore(state => state.closeSidebarPanel);

    // Hooks
    const { position, placement } = useElementActionBar(selectedElement, elementActionBarRef, elementPropertyBarRef);

    // Zoom handler that will be passed to Canvas
    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(MAX_ZOOM, prev + 10));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(MIN_ZOOM, prev - 10));
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Listen for keyboard events for page deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // If Delete key is pressed and a page thumbnail is selected
            if ((e.key === "Delete" || e.key === "Backspace") && selectedPageThumbnail) {
                e.preventDefault(); // Prevent browser's back navigation on Backspace
                e.stopPropagation(); // Stop event propagation

                // Don't delete if it's the only page
                if (pages.length <= 1) {
                    return;
                }

                console.log(`Deleting page with ID: ${selectedPageThumbnail}`);
                deletePage(selectedPageThumbnail);
                setSelectedPageThumbnail(null);
            }

            // Deselect with Escape key
            if (e.key === "Escape" && selectedPageThumbnail) {
                setSelectedPageThumbnail(null);
            }
        };

        // Add event listener directly to the document
        document.addEventListener("keydown", handleKeyDown, { capture: true });

        // Clicking elsewhere should deselect the page thumbnail
        const handleClickOutside = (e: MouseEvent) => {
            const pageThumbnails = document.querySelector('.page-thumbnails-container');
            if (pageThumbnails && !pageThumbnails.contains(e.target as Node) && selectedPageThumbnail) {
                setSelectedPageThumbnail(null);
            }
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
            window.removeEventListener("click", handleClickOutside);
        };
    }, [deletePage, pages.length, selectedPageThumbnail]);

    // Text editing handlers
    const handleFontSizeChange = useCallback((size: number) => {

        if (!selectedElement) return;

        updateElement(selectedElement.id, { fontSize: size })
    }, [selectedElement, updateElement]);

    // Add a keyboard event handler for element deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // If Delete or Backspace key is pressed and we have selected elements
            if ((e.key === "Delete" || e.key === "Backspace") && selectedElementIds.length > 0) {
                e.preventDefault();
                // Delete all selected elements
                deleteSelectedElements();
            }
        };

        // Add event listener to document
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedElementIds, deleteSelectedElements]);

    const handleFontFamilyChange = useCallback((family: string) => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { fontFamily: family })
        }
    }, [selectedElement, updateElement]);

    const handleTextAlignChange = useCallback((align: "left" | "center" | "right") => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { textAlign: align })
        }
    }, [selectedElement, updateElement]);

    const handleLetterSpacingChange = useCallback((spacing: number) => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { letterSpacing: spacing })
        }
    }, [selectedElement, updateElement]);

    const handleLineHeightChange = useCallback((height: number) => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { lineHeight: height })
        }
    }, [selectedElement, updateElement]);

    const handleFormatChange = useCallback((format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => {
        if (selectedElement && selectedElement.type === "text") {
            const updates: Partial<TextElement> = {};
            if (format.bold !== undefined) updates.isBold = format.bold;
            if (format.italic !== undefined) updates.isItalic = format.italic;
            if (format.underline !== undefined) updates.isUnderline = format.underline;
            if (format.strikethrough !== undefined) updates.isStrikethrough = format.strikethrough;
            updateElement(selectedElement.id, updates);
        }
    }, [selectedElement, updateElement]);

    const handlePositionChange = useCallback((position: { x?: number, y?: number }) => {
        if (selectedElement) {
            updateElement(selectedElement.id, {
                rect: {
                    ...selectedElement.rect,
                    ...position
                }
            });
        }
    }, [selectedElement, updateElement]);

    useEffect(() => {
        // Add non-passive wheel event listener to prevent the error
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const zoomDelta = e.deltaY * 0.25;
                const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - zoomDelta)));
                setZoom(next);
            }
        };

        // Get the element where the wheel event should be captured
        const editorElement = editorContainerRef.current;
        if (editorElement) {
            editorElement.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (editorElement) {
                editorElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, [zoom]);

    // Add keyboard shortcut for creating text elements with 'T' key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // Create text element when 'T' key is pressed
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();

                // Get addElement from store
                const addElement = useCanvasStore.getState().addElement;

                // Create a new text element using the factory
                const newTextElement = ElementFactory.createTextElement(
                    { width: canvasSize.width, height: canvasSize.height },
                    {
                        content: "Add your text here",
                        isEditable: true
                    }
                );

                // Add the element to the canvas
                addElement(newTextElement, "text");
            }
        };

        // Add event listener to document
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [canvasSize.width, canvasSize.height]);

    // Initialize template ID and load template data when component mounts
    useEffect(() => {
        if (designId) {
            const initDesign = useEditorStore.getState().initDesign;
            initDesign(designId);
        }
    }, [designId]);



    // Add keyboard shortcut for saving template with Cmd+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if Cmd+S (Mac) or Ctrl+S (Windows/Linux) is pressed
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault(); // Prevent browser's default save action

                // Call the save function
                const saveDesign = useEditorStore.getState().saveDesign;
                if (designId && saveDesign) {
                    saveDesign().catch((error) => {
                        console.error('Error saving design:', error);
                    });
                }
            }
        };

        // Add event listener to document
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [designId]);

    useEffect(() => {
        const handleOutsideClick = (e: globalThis.MouseEvent) => {
            // Only process if we're in edit mode

            if (!isEditMode) return;

            const target = e.target as HTMLElement;

            // Use data attributes to identify clickable areas
            const isClickOnInteractiveElement = target.closest('[data-editor-interactive]');

            // If click is on an interactive element, don't clear selection
            if (isClickOnInteractiveElement) {
                return;
            }

            // Close sidebar panel if open
            if (isSidebarPanelOpen) {
                closeSidebarPanel();
            }

            // Clear selections and exit text editing mode
            elementRefs.current.forEach(ref => {
                deselectElement(ref.id);
            });

            // Exit text editing mode for all elements when clicking outside
            elements.forEach(element => {
                if (element.type === "text" && element.isEditable) {
                    updateElement(element.id, { isEditable: false });
                }
            });

            // Reset double-click state by dispatching a custom event
            window.dispatchEvent(new CustomEvent('resetDoubleClickState'));

            // Always clear selections when clicking outside
            if (selectedElementIds.length > 0 || selectedElement !== null) {
                clearSelection();
                selectElement(null);
            }

            if (isCanvasSelected) {
                selectCanvas(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, [isEditMode, selectedElementIds, selectedElement, isCanvasSelected, isSidebarPanelOpen, selectElement, selectCanvas, closeSidebarPanel, deselectElement, elements, updateElement, clearSelection]);
    
    
    return (
        <div
            className="flex flex-1 overflow-hidden flex-col relative h-full"
            ref={editorContainerRef}
            style={{
                backgroundColor: "var(--bg-primary)"
            }}
        >
            {/* Main canvas area with wheel handler - removing inline wheel handler */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-editor">

                {/* Element Action Bar */}
                {selectedElement && (
                    <ElementActionBar
                        placement={placement}
                        position={position}
                        element={selectedElement}
                        ref={elementActionBarRef}
                        onDelete={() => {
                            if (selectedElement) {
                                // Delete the element and clear selection
                                deleteSelectedElements();
                                clearSelection();
                            }
                        }}
                        onLock={() => {
                            if (selectedElement) {
                                // Toggle the locked state
                                const newLockedState = !selectedElement.isLocked;
                                console.log(`Setting element ${selectedElement.id} locked: ${newLockedState}`);
                                updateElement(selectedElement.id, { isLocked: newLockedState });
                            }
                        }}
                        onDuplicate={() => {
                            if (selectedElement) {
                                // Use the duplicateElement method from the Canvas Store
                                const duplicateElement = useCanvasStore.getState().duplicateElement;
                                duplicateElement(selectedElement.id);
                            }
                        }}
                    />
                )}

                {/* ElementPropertyBar moved here */}
                <header className="absolute top-0 left-0 w-full h-[var(--editor-header-height)] flex items-center justify-center ">
                    {selectedElement && (
                        <ElementPropertyBar
                            selectedElement={selectedElement}
                            onFontSizeChange={handleFontSizeChange}
                            onFontFamilyChange={handleFontFamilyChange}
                            onTextAlignChange={handleTextAlignChange}
                            onLetterSpacingChange={handleLetterSpacingChange}
                            onLineHeightChange={handleLineHeightChange}
                            onFormatChange={handleFormatChange}
                            onPositionChange={handlePositionChange}
                            isHovering={false}
                            elementId={selectedElement?.id || null}
                            canvasWidth={canvasSize.width}
                            ref={elementPropertyBarRef}
                        />
                    )}
                </header>
                <Canvas
                    zoom={zoom}
                    setZoom={handleZoomChange}
                    ref={canvasRef}
                />
                {/* Page Navigation Controls with refined styling */}
                {/* <PageNavigation
                    pages={pages}
                    currentPageId={currentPageId}
                    goToPage={goToPage}
                    addPage={addPage}
                    deletePage={deletePage}
                    selectedPageThumbnail={selectedPageThumbnail}
                    setSelectedPageThumbnail={setSelectedPageThumbnail}
                /> */}

                {elements.map(element => (
                    <ElementControls
                        key={element.id}
                        element={element}
                        scale={zoom / 100}
                        isEditMode={isEditMode}
                        ref={(el: HTMLDivElement | null) => {
                            if (el) addToRefArrayOfObjects({
                                id: element.id,
                                node: el
                            }, elementRefs.current);
                        }}
                    />
                ))}


            </div>


            {/* Bottom Bar with gradient styling */}
            <BottomBar
                zoom={zoom}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                setZoom={setZoom}
                currentPageIndex={currentPageIndex}
                pages={pages}
            />
        </div>
    )
}