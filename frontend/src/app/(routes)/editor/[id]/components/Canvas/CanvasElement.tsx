"use client"

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTextMeasurement } from "../../lib/hooks";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "../../lib/types/canvas";
import ElementRenderer from "./renderers/ElementRenderer";

interface CanvasElementProps {
  element: EditorCanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  onHover: (id: string | null) => void
  isEditMode: boolean
  // Props expected by Canvas for alignment guides
  allElements?: EditorCanvasElement[]
  canvasWidth?: number
  canvasHeight?: number
  onDragStart?: (element: EditorCanvasElement) => void
  onDrag?: (element: EditorCanvasElement, x: number, y: number, alignments: { horizontal: number[], vertical: number[] }, isDragSelection?: boolean) => void
  onDragEnd?: () => void
}

export function CanvasElement({
  element,
  isSelected,
  scale: _scale, // Unused but kept for interface compatibility
  canvasRef: _canvasRef, // Unused but kept for interface compatibility
  onHover,
  isEditMode,
  allElements = [],
  canvasWidth = 800,
  canvasHeight = 600,
  onDragStart,
  onDrag,
  onDragEnd,
}: CanvasElementProps) {
  // Get Zustand store methods
  const updateElement = useCanvasStore((state) => state.updateElement);
  const clearNewElementFlag = useCanvasStore((state) => state.clearNewElementFlag);
  const showElementActionBar = useCanvasStore((state) => state.showElementActionBar);
  const hideElementActionBar = useCanvasStore((state) => state.hideElementActionBar);
  const isResizing = useCanvasStore((state) => state.isResizing);
  const activeResizeElement = useCanvasStore((state) => state.activeResizeElement);

  // Element ref and text editor key for rerendering
  const elementRef = useRef<HTMLDivElement>(null);
  const [textEditorKey, setTextEditorKey] = useState(0);

  // Initialize text measurement hook
  const { measureElementHeight, renderMeasurer } = useTextMeasurement();

  // Create custom drag handlers that communicate with Canvas alignment guides
  const handleDragStart = useCallback(() => {
    if (onDragStart) {
      onDragStart(element);
    }
  }, [element, onDragStart]);

  const handleDrag = useCallback((alignments: { horizontal: number[], vertical: number[] }) => {
    if (onDrag) {
      onDrag(element, element.rect.x, element.rect.y, alignments);
    }
  }, [element, onDrag]);

  const handleDragEnd = useCallback(() => {
    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  // Handle text height change
  const handleHeightChange = useCallback((newHeight: number) => {
    if (element.type === "text") {
      updateElement(element.id, {
        rect: {
          ...element.rect,
          height: newHeight
        }
      });
    }
  }, [element, updateElement]);

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (element.type !== "text") return;
    // Filter out 'justify' since our Element type doesn't support it yet
    if (align === "justify") return;
    updateElement(element.id, { textAlign: align as "left" | "center" | "right" });
  }, [element, updateElement]);

  // Only remount TextEditor when absolutely necessary (font family changes, etc.)
  const fontSize = element.type === "text" ? element.fontSize : null;
  const fontFamily = element.type === "text" ? element.fontFamily : null;


  useEffect(() => {
    if (element.type === "text") {
      setTextEditorKey((k) => k + 1);
    }
  }, [element.type, fontSize, fontFamily]);


  const prevMeasuredHeight = useRef<number | null>(null); // Currently unused but may be needed later
  const hasMeasured = useRef<boolean>(false);

  useEffect(() => {
    // Skip height measurement for new elements that already have proper dimensions from ElementFactory
    if (element.type !== "text" || hasMeasured.current || (element.isNew && element.rect.height > 20)) return;

    const measuredHeight = measureElementHeight(element);

    updateElement(element.id, {
      rect: {
        ...element.rect,
        height: measuredHeight
      }
    });
    hasMeasured.current = true; // Mark as measured to prevent re-runs
  }, [element, measureElementHeight, updateElement]);

  // Use ref to track previous rect values to prevent infinite updates
  const prevRectRef = useRef(element.rect); // Currently unused but may be needed later

  // NOTE: Disabled viewport rect calculation as it was incorrectly applying viewport coordinates
  // back to element rect, which corrupted the dimensions. The calculateViewportRect function
  // returns browser viewport coordinates, not canvas coordinates.
  /*
  useEffect(() => {
    // Skip viewport rect calculation for new elements that already have proper dimensions from ElementFactory
    if (element.isNew && element.rect.width > 50) return;
    
    const newRect = calculateViewportRect(element, canvasRef, scale);
    const prevRect = prevRectRef.current;

    // Only update if there's a meaningful change (avoid floating point precision issues)
    const threshold = 0.5;
    const hasChanged =
      Math.abs(prevRect.x - newRect.x) > threshold ||
      Math.abs(prevRect.y - newRect.y) > threshold ||
      Math.abs(prevRect.width - newRect.width) > threshold ||
      Math.abs(prevRect.height - newRect.height) > threshold;

    if (hasChanged) {
      prevRectRef.current = newRect;
      updateElement(element.id, { rect: newRect });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    element.id,
    scale,
    canvasRef,
    updateElement
    // Note: element.rect dependencies removed to prevent infinite loop
  ]);
  */



  // Show element action bar when this element is selected
  useEffect(() => {
    if (isSelected && isEditMode && element.rect) {
      // Position the action bar at the top center of the element using viewport coordinates
      const centerX = element.rect.x + element.rect.width / 2;
      const topY = element.rect.y;

      showElementActionBar(element.id, { x: centerX, y: topY });
    } else {
      // Only hide the action bar if this element is the one that triggered it
      const elementActionBarState = useCanvasStore.getState().elementActionBar;
      if (elementActionBarState.elementId === element.id) {
        hideElementActionBar();
      }
    }
  }, [element.id, element.rect, isSelected, isEditMode, showElementActionBar, hideElementActionBar]);

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={"absolute"}
        style={{
          left: element.rect.x,
          top: element.rect.y,
          width: element.rect.width,
          height: element.rect.height,
          cursor: isEditMode ? (element.isLocked ? "default" : "grab") : "default",
          transform: "none",
          borderRadius: "2px",
          // Fixed stacking order based only on element type
          zIndex: element.type === "text" ? 1 : 0,
        }}
        onMouseEnter={() => onHover?.(element.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <ElementRenderer
          element={element}
          textEditorKey={textEditorKey}
          updateElement={updateElement}
          clearNewElementFlag={clearNewElementFlag}
          handleHeightChange={handleHeightChange}
          handleTextAlignChange={handleTextAlignChange}
          isEditMode={isEditMode}
          isResizing={isResizing && activeResizeElement === element.id}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          allElements={allElements}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </div>
    </>
  );
}
