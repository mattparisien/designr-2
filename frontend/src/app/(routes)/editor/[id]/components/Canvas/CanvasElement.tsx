"use client"

import React, { useState } from "react";
import useCanvasStore from "../../lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "../../lib/types/canvas";
import { calculateViewportRect } from "../../lib/utils/canvas";
import { useCallback, useEffect, useRef } from "react";
import { useTextMeasurement } from "../../lib/hooks";
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
  scale,
  canvasRef,
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


  const prevMeasuredHeight = useRef<number | null>(null);

  useEffect(() => {
    if (element.type !== "text" || !element.content || !element.fontSize) return;
    const measuredHeight = measureElementHeight(element);
    if (
      measuredHeight &&
      measuredHeight !== element.rect.height &&
      prevMeasuredHeight.current !== measuredHeight
    ) {
      prevMeasuredHeight.current = measuredHeight;
      updateElement(element.id, {
        rect: {
          ...element.rect,
          height: measuredHeight
        }
      });
    }
  }, [
    element.id,
    element.type,
    element.content,
    element.fontSize,
    element.rect.height,
    measureElementHeight,
    updateElement
  ]);

  // useEffect(() => {
  //   const newRect = calculateViewportRect(element, canvasRef, scale);
  //   if (
  //     element.rect.x !== newRect.x ||
  //     element.rect.y !== newRect.y ||
  //     element.rect.width !== newRect.width ||
  //     element.rect.height !== newRect.height
  //   ) {
  //     updateElement(element.id, { rect: newRect });
  //   }
  // }, [
  //   element.id,
  //   element.rect.x,
  //   element.rect.y,
  //   element.rect.width,
  //   element.rect.height,
  //   scale,
  //   canvasRef,
  //   updateElement
  // ]);



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
