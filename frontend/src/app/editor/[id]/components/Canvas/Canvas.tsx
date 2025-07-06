"use client"

import { AlignmentGuides } from "../Canvas/AlignmentGuides"
import { CanvasElement } from "../Canvas/CanvasElement"
import { calculateFitScale } from "../../lib/utils/canvas"
import useCanvasStore, { useCurrentCanvasSize, useCurrentPageElements } from "../../lib/stores/useCanvasStore"
import useEditorStore from "../../lib/stores/useEditorStore"
import classNames from "classnames"
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, forwardRef, ForwardRefRenderFunction } from "react"
import { type EditorState } from "../../lib/stores/useEditorStore"
import { type CanvasState } from "../../lib/stores/useCanvasStore"
import styles from "../Editor.module.css";

type CanvasProps = {
  zoom: number;
  setZoom: (zoom: number) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
};

const CanvasComponent: ForwardRefRenderFunction<HTMLDivElement, CanvasProps> = (
  { zoom, setZoom, editorRef },
  ref
) => {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  // Use Zustand stores directly
  const isEditMode = useEditorStore((state: EditorState) => state.isEditMode)
  const openSidebarPanel = useEditorStore((state: EditorState) => state.openSidebarPanel)
  const currentPage = useEditorStore((state: EditorState) => state.pages.find(p => p.id === state.currentPageId))

  // Canvas store selectors
  const elements = useCurrentPageElements()
  const canvasSize = useCurrentCanvasSize()
  
  // Infer element type from the elements array
  type CanvasElementType = typeof elements[0]
  const selectedElementIds = useCanvasStore((state: CanvasState) => state.selectedElementIds)
  const selectElement = useCanvasStore((state: CanvasState) => state.selectElement)
  const selectCanvas = useCanvasStore((state: CanvasState) => state.selectCanvas)
  const isCanvasSelected = useCanvasStore((state: CanvasState) => state.isCanvasSelected)
  const selectedElement = useCanvasStore((state: CanvasState) => state.selectedElement)
  const isLoaded = useCanvasStore((state: CanvasState) => state.isLoaded)
  const updateMultipleElements = useCanvasStore((state: CanvasState) => state.updateMultipleElements)

  // Alignment guides from canvas store
  const alignmentGuides = useCanvasStore((state: CanvasState) => state.alignmentGuides)
  const isDragging = useCanvasStore((state: CanvasState) => state.isDragging)
  const setDragState = useCanvasStore((state: CanvasState) => state.setDragState)
  const clearAlignmentGuides = useCanvasStore((state: CanvasState) => state.clearAlignmentGuides)

  const canvasRef = useRef<HTMLDivElement>(null) // un‑scaled logical canvas

  // Combine internal ref with forwarded ref
  const handleRef = useCallback((node: HTMLDivElement) => {
    canvasRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null) // Track last drag position


  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100


  // Fit canvas to container logic
  const fitCanvasToContainer = useCallback(() => {
    if (isLoaded && canvasRef.current && editorRef?.current && canvasSize.width > 0 && canvasSize.height > 0) {
      const container = editorRef.current;
      const newScale = calculateFitScale(
        canvasSize.width,
        canvasSize.height,
        container.clientWidth,
        container.clientHeight
      );
      // Set a minimum zoom level, e.g., 5%
      const newZoom = Math.max(5, Math.round(newScale * 100));

      if (zoom !== newZoom) { // Only update if zoom needs to change
        setZoom(newZoom);
      }
    }
  }, [isLoaded, editorRef, canvasSize, setZoom, zoom]); // Added zoom to dependencies

  useEffect(() => {
    // Initial fit (with a slight delay for layout stabilization)
    const timeoutId = setTimeout(fitCanvasToContainer, 50);

    // Fit on window resize
    window.addEventListener('resize', fitCanvasToContainer);

    // Optional: For more precise fitting if editorRef resizes independently of the window,
    // you could use a ResizeObserver on editorRef.current here.

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', fitCanvasToContainer);
      // If using ResizeObserver, disconnect it here.
    };
  }, [fitCanvasToContainer, canvasSize]); // Re-run if fitCanvasToContainer or canvasSize changes

  // Clear selection when switching to view mode
  useEffect(() => {
    if (!isEditMode) {
      selectElement(null);
      selectCanvas(false);
    }
  }, [isEditMode, selectElement, selectCanvas]);


  /* ------------------------------------------------------------------
   * Canvas click → deselect
   * ------------------------------------------------------------------ */
  const handleCanvasClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    // Only handle clicks directly on the canvas background, not on canvas elements
    if (e.target === canvasRef.current) {
      // Don't prevent default behavior to allow event to bubble up

      // Toggle canvas selection if it's already selected
      if (isCanvasSelected) {
        selectCanvas(false);
      } else {
        // Select the canvas if target is the canvas itself
        selectCanvas(true);
        // Open the background color panel when canvas is selected
        openSidebarPanel("background-color");
      }

      // Clear element selection
      if (!e.shiftKey) {
        selectElement(null);
      }
    }
  }, [selectElement, selectCanvas, canvasRef, isCanvasSelected, isEditMode, openSidebarPanel])

  /* ------------------------------------------------------------------
   * Drag handlers (logical units)
   * ------------------------------------------------------------------ */
  const handleDragStart = useCallback((element: CanvasElementType) => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    setDragState(true, element.id)
    clearAlignmentGuides()
    setLastDragPos({ x: element.x, y: element.y }) // Initialize last drag position
  }, [isEditMode, setDragState, clearAlignmentGuides])

  const handleDrag = useCallback((element: CanvasElementType, x: number, y: number, newAlignments: typeof alignmentGuides, isDragSelection: boolean = false) => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    // Note: alignment guides are now managed by ElementControls through the canvas store
    // This handler is kept for backward compatibility but the guides are set in ElementControls

    // When dragging multiple elements, update their positions
    if (isDragSelection && selectedElementIds.length > 1) {
      if (lastDragPos) {
        // Calculate the delta movement
        const deltaX = x - lastDragPos.x;
        const deltaY = y - lastDragPos.y;

        // Update positions of all selected elements
        updateMultipleElements((prev: CanvasElementType) => {
          return {
            x: prev.x + deltaX,
            y: prev.y + deltaY
          };
        });

        // Update last drag position
        setLastDragPos({ x, y });
      }
    }
  }, [selectedElementIds, updateMultipleElements, lastDragPos, isEditMode])

  const handleDragEnd = useCallback(() => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    setDragState(false)
    clearAlignmentGuides()
    setLastDragPos(null) // Reset last drag position
  }, [isEditMode, setDragState, clearAlignmentGuides])

  // Handle element hover
  const handleElementHover = useCallback((id: string | null) => {
    // Only set hover states in edit mode
    if (isEditMode) {
      setIsHoveringChild(id !== null)
    }
  }, [isEditMode])

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)

  // Track when we're hovering over a child element to prevent canvas border
  const [isHoveringChild, setIsHoveringChild] = useState(false)

  // Sort elements by type to ensure proper stacking order (shapes behind text)
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => {
      // Text elements should always be on top
      if (a.kind === "text" && b.kind !== "text") return 1;
      if (a.kind !== "text" && b.kind === "text") return -1;
      return 0;
    });
  }, [elements]);

  // Clear isHoveringChild when leaving canvas
  const handleCanvasMouseLeave = useCallback(() => {
    setIsCanvasHovering(false)
    setIsHoveringChild(false)
  }, [])

  const isBorderActive = isCanvasSelected;

  // Get background color from current page
  const canvasBackgroundColor = currentPage?.background?.type === 'color'
    ? currentPage.background.value
    : '#ffffff'; // Default to white

  return (
    <div
      ref={handleRef}
      className={classNames("canvas-container flex items-center justify-center p-1 z-50 relative overflow-hidden",
        isBorderActive && styles.isHighlighted
      )}
      data-canvas
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        flexShrink: 0, // Add flex-shrink to prevent squeezing by flex parents
        cursor: isEditMode ? "default" : "default",
        borderRadius: "1rem",
        borderColor: "var(--border-elevated-editor)",
        borderWidth: "2px",
        borderStyle: "solid",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        // Fix: TypeScript custom property using type assertion
        ['--canvas-scale' as string]: `${scale}`,
        zIndex: 'var(--editor-canvas-z)',
        backgroundColor: canvasBackgroundColor
      }}
      onClick={handleCanvasClick}
      onMouseLeave={handleCanvasMouseLeave}
      onMouseEnter={() => {
        console.log('Canvas mouse enter triggered');
        if (isEditMode) setIsCanvasHovering(true);
      }}
    >
      {/* Loading indicator - shown when canvas is not loaded */}
      {
        !isLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-t-4 border-b-4 border-brand-blue rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-medium">Loading canvas...</p>
            </div>
          </div>
        )
      }

      {/* Guides with brand colors */}
      {
        isDragging && selectedElement && isEditMode && (
          <AlignmentGuides
            alignments={alignmentGuides}
          />
        )
      }

      {/* Canvas elements */}
      {
        sortedElements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={isEditMode && (selectedElementIds.includes(el.id) || selectedElement?.id === el.id)}
            scale={scale}
            canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
            allElements={elements}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onHover={handleElementHover}
            isEditMode={isEditMode}
          />
        ))
      }
    </div>
  )
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(CanvasComponent);

export default Canvas;
