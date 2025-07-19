import { useEffect, useCallback } from "react";
import useCanvasStore from "../../../lib/stores/useCanvasStore";
import { Element as CanvasElement } from "../../../lib/types/canvas";
import { TextEditor } from "../../TextEditor";
import { calculateTextWidth } from "./utils/calc";

interface TextElementProps {
  element: CanvasElement;
  textEditorKey: number;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  clearNewElementFlag: (id: string) => void;
  handleHeightChange: (newHeight: number) => void;
  handleTextAlignChange: (align: "left" | "center" | "right") => void;
  isResizing?: boolean;
}


export const TextElement = ({
  element,
  textEditorKey,
  updateElement,
  handleHeightChange,
  isResizing = false,
}: TextElementProps) => {
  // Get resize state from canvas store for additional safety
  const storeIsResizing = useCanvasStore(state => state.isResizing);
  const activeResizeElement = useCanvasStore(state => state.activeResizeElement);
  const lastResizeTime = useCanvasStore(state => state.lastResizeTime);
  const isElementManuallyResized = useCanvasStore(state => state.isElementManuallyResized);
  const clearManuallyResizedFlag = useCanvasStore(state => state.clearManuallyResizedFlag);

  const autoFitElement = useCallback((content: string) => {
    // Only auto-fit width when actively editing/typing
    // This allows text to wrap properly when not editing
    console.log(element.isEditable)
      // Calculate what the auto-fit width would be
      const calculatedAutoWidth = calculateTextWidth(
        content,
        element.fontSize || 16,
        element.fontFamily || 'Arial',
        element.letterSpacing || 0,
        element.bold ? 'bold' : 'normal',
        element.italic ? 'italic' : 'normal'
      );

      // Check if this element is currently being resized
      const isThisElementResizing = (isResizing || storeIsResizing) &&
        (activeResizeElement === element.id || activeResizeElement === null);

      // Check if this element was recently resized (within last 2 seconds)
      const wasRecentlyResized = Date.now() - lastResizeTime < 2000;

      // If current width is significantly larger than what auto-fit would calculate,
      // assume it was manually resized and don't auto-fit
      const isManuallyResized = isElementManuallyResized(element.id);

      // Don't auto-fit if:
      // 1. Currently resizing
      // 2. Was recently resized 
      // 3. Element appears to be manually resized (wider than auto-fit + threshold)
      const shouldAutoFit = !isThisElementResizing &&
        !wasRecentlyResized &&
        !isManuallyResized &&
        element.kind === 'text';

      if (shouldAutoFit) {
        // Calculate new position to keep center fixed when width changes
        const widthChange = calculatedAutoWidth - element.width;
        const newX = element.x - widthChange / 2;

        // Clear the manually resized flag since we're auto-fitting now
        clearManuallyResizedFlag(element.id);

        // Update content, width, and position to maintain center
        updateElement(element.id, {
          content,
          width: calculatedAutoWidth,
          x: newX
        });
      } else {
        // Just update content for fixed width mode, during resize, or when manually resized
        updateElement(element.id, { content });
      }
      // When not editing, just update content - let text wrap within existing bounds
      // updateElement(element.id, { content });
  }, [
    element.isEditable,
    element.fontSize,
    element.fontFamily,
    element.letterSpacing,
    element.bold,
    element.italic,
    element.width,
    element.x,
    element.id,
    element.kind,
    isResizing,
    storeIsResizing,
    activeResizeElement,
    lastResizeTime,
    isElementManuallyResized,
    clearManuallyResizedFlag,
    updateElement
  ]);

  const handleContentChange = (content: string) => {
  //   console.log('hello!');
    autoFitElement(content);
  };

  // Auto-fit when font family changes (if element has content)
  useEffect(() => {
    if (element.content && element.content.trim() !== '') {
      autoFitElement(element.content);
    }
  }, [element.fontFamily, element.fontSize, element.bold, element.italic, element.letterSpacing, element.content, autoFitElement]);

  return (
    <div className="h-full text-element">
      <TextEditor
        key={textEditorKey}
        content={element.content || ""}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        letterSpacing={element.letterSpacing}
        lineHeight={element.lineHeight}
        onChange={handleContentChange}
        onHeightChange={handleHeightChange}
        textAlign={element.textAlign || "center"}
        isBold={element.bold}
        isItalic={element.italic}
        isUnderlined={element.underline}
        isStrikethrough={element.isStrikethrough}
        textColor={element.color}
        isEditable={(element.isEditable || false) && !isResizing}
        onEditingEnd={() => updateElement(element.id, { isEditable: false })}
      />
    </div>
  );
};