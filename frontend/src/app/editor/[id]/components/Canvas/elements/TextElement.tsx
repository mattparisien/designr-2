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
const calculateTextWidth = (content: string, fontSize: number, fontFamily: string = 'Arial'): number => {
  // Create a temporary canvas element to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return content.length * fontSize * 0.6; // Fallback calculation
  
  // Set font properties
  context.font = `${fontSize}px ${fontFamily}`;
  
  // Split content by lines and measure the widest line
  const lines = content.split('\n');
  let maxWidth = 0;
  
  lines.forEach(line => {
    const metrics = context.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });
  
  // Add some padding and ensure minimum width
  const calculatedWidth = Math.max(maxWidth + 20, 100);
  
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
  
  const handleContentChange = (content: string) => {
    // Calculate what the auto-fit width would be
    const calculatedAutoWidth = calculateTextWidth(
      content, 
      element.fontSize || 16, 
      element.fontFamily || 'Arial'
    );
    
    // Check if this element is currently being resized
    const isThisElementResizing = (isResizing || storeIsResizing) && 
                                  (activeResizeElement === element.id || activeResizeElement === null);
    
    // Check if this element was recently resized (within last 2 seconds)
    const wasRecentlyResized = Date.now() - lastResizeTime < 2000;
    
    // If current width is significantly larger than what auto-fit would calculate,
    // assume it was manually resized and don't auto-fit
    const isManuallyResized = element.width > calculatedAutoWidth + 50; // 50px threshold
    
    // Don't auto-fit if:
    // 1. Currently resizing
    // 2. Was recently resized 
    // 3. Element appears to be manually resized (wider than auto-fit + threshold)
    // 4. Element is in editable mode (being typed in)
    const shouldAutoFit = !isThisElementResizing && 
                          !wasRecentlyResized && 
                          !isManuallyResized && 
                          !element.isEditable &&
                          element.kind === 'text';
    
    if (shouldAutoFit) {
      // Update both content and width
      updateElement(element.id, { 
        content, 
        width: calculatedAutoWidth 
      });
    } else {
      // Just update content for fixed width mode, during resize, or when manually resized
      updateElement(element.id, { content });
    }
  };

  return (
    <div className="w-full h-full text-element">
      <TextEditor
        key={textEditorKey}
        content={element.content || ""}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        onChange={handleContentChange}
        onHeightChange={handleHeightChange}
        textAlign={element.textAlign || "center"}
        isBold={element.bold}
        isItalic={element.italic}
        isUnderlined={element.underline}
        isStrikethrough={element.isStrikethrough}
        textColor={element.color}
        isEditable={element.isEditable || false}
        onEditingEnd={() => updateElement(element.id, { isEditable: false })}
      />
    </div>
  );
};