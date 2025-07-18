import { Element as CanvasElement } from "../../../lib/types/canvas";
import { TextEditor } from "../../TextEditor";
import useCanvasStore from "../../../lib/stores/useCanvasStore";

interface TextElementProps {
  element: CanvasElement;
  textEditorKey: number;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  clearNewElementFlag: (id: string) => void;
  handleHeightChange: (newHeight: number) => void;
  handleTextAlignChange: (align: "left" | "center" | "right") => void;
  isResizing?: boolean;
}

// Calculate text width based on content and font size
const calculateTextWidth = (
  content: string, 
  fontSize: number, 
  fontFamily: string = 'Arial', 
  letterSpacing: number = 0,
  fontWeight: string = 'normal',
  fontStyle: string = 'normal'
): number => {
  // Create a temporary canvas element to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return content.length * fontSize * 0.6; // Fallback calculation
  
  // Set high DPI for better accuracy
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 2000 * dpr;
  canvas.height = 200 * dpr;
  context.scale(dpr, dpr);
  
  // Set comprehensive font properties including weight and style
  context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  context.textBaseline = 'top';
  
  // Split content by lines and measure the widest line
  const lines = content.split('\n');
  let maxWidth = 0;
  
  lines.forEach(line => {
    if (line.length === 0) {
      // Empty line still takes up space
      maxWidth = Math.max(maxWidth, fontSize * 0.5);
      return;
    }
    
    const metrics = context.measureText(line);
    let lineWidth = metrics.width;
    
    // Add letter spacing if specified (convert em to pixels)
    if (letterSpacing > 0 && line.length > 1) {
      const letterSpacingPx = letterSpacing * fontSize;
      lineWidth += letterSpacingPx * (line.length - 1);
    }
    
    // Account for special characters and punctuation that might extend bounds
    // Use actualBoundingBoxRight if available for better accuracy
    if (metrics.actualBoundingBoxLeft !== undefined && metrics.actualBoundingBoxRight !== undefined) {
      const actualWidth = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
      lineWidth = Math.max(lineWidth, actualWidth);
    }
    
    maxWidth = Math.max(maxWidth, lineWidth);
  });
  
  // Add small padding to prevent text clipping and ensure minimum width
  const padding = fontSize * 0.1; // 10% of font size as padding
  const calculatedWidth = Math.max(maxWidth + padding, fontSize * 2); // Minimum 2x font size
  
  // Cleanup
  canvas.remove();
  
  return Math.round(calculatedWidth);
};

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
  
  const handleContentChange = (content: string) => {
    // Only auto-fit width when actively editing/typing
    // This allows text to wrap properly when not editing
    if (element.isEditable) {
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
    } else {
      // When not editing, just update content - let text wrap within existing bounds
      updateElement(element.id, { content });
    }
  };


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