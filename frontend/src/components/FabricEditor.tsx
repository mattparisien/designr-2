'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';

interface FabricEvent {
  selected?: fabric.Object[];
  target?: fabric.Object;
}

interface TemplateElement {
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line';
    radius?: number;
    strokeWidth?: number;
    stroke?: string;
  };
}

interface FabricEditorProps {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  onObjectSelected?: (object: fabric.Object | null) => void;
  onObjectModified?: (object: fabric.Object) => void;
}

export interface FabricEditorRef {
  addText: (text: string, options?: Record<string, unknown>) => fabric.Textbox | undefined;
  updateSelectedObject: (properties: Record<string, unknown>) => void;
  deleteSelected: () => void;
  loadTemplate: (elements: TemplateElement[]) => void;
  exportTemplate: () => TemplateElement[];
  loadFont: (fontName: string, fontUrl: string) => Promise<boolean>;
  addBackground: (color?: string) => fabric.Rect | undefined;
  resizeCanvas: (newWidth: number, newHeight: number, newOriginalWidth: number, newOriginalHeight: number) => void;
  canvas: fabric.Canvas | null;
}

const FabricEditor = forwardRef<FabricEditorRef, FabricEditorProps>(({ 
  width, 
  height, 
  originalWidth = 1080,
  originalHeight = 1080,
  onObjectSelected, 
  onObjectModified 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || width <= 0 || height <= 0) return;

    // Wait a tick to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        // Initialize Fabric canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
          width,
          height,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        });

        // Enable object controls
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#3B82F6';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#3B82F6';
        fabric.Object.prototype.cornerSize = 10;

        setCanvas(fabricCanvas);
      } catch (error) {
        console.error('Failed to initialize Fabric canvas:', error);
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [width, height]); // Remove callback dependencies to avoid recreating canvas

  // Separate effect for event listeners
  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = (e: FabricEvent) => {
      onObjectSelected?.(e.selected?.[0] || null);
    };

    const handleSelectionUpdated = (e: FabricEvent) => {
      onObjectSelected?.(e.selected?.[0] || null);
    };

    const handleSelectionCleared = () => {
      onObjectSelected?.(null);
    };

    const handleObjectModified = (e: FabricEvent) => {
      if (e.target) {
        onObjectModified?.(e.target);
      }
    };

    const handleObjectScaling = (e: FabricEvent) => {
      const target = e.target;
      if (target && target.type === 'textbox') {
        const textObj = target as fabric.Textbox & { originalFontSize?: number };
        
        // Store original font size if not already stored
        if (!textObj.originalFontSize) {
          textObj.originalFontSize = textObj.fontSize || 16;
        }
        
        // Calculate new font size based on scaling
        const scaleX = textObj.scaleX || 1;
        const scaleY = textObj.scaleY || 1;
        // Use the larger of the two scale factors for font scaling
        const scaleFactor = Math.max(scaleX, scaleY);
        
        const newFontSize = Math.max(8, Math.round((textObj.originalFontSize as number) * scaleFactor));
        
        // Update font size and reset scale to 1 to avoid double scaling
        textObj.set({
          fontSize: newFontSize,
          scaleX: 1,
          scaleY: 1
        });
        
        // Recalculate text box dimensions
        textObj.initDimensions();
        textObj.setCoords();
        canvas.renderAll();
      }
    };

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:scaling', handleObjectScaling);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:scaling', handleObjectScaling);
    };
  }, [canvas, onObjectSelected, onObjectModified]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (canvas) {
        try {
          canvas.dispose();
        } catch (error) {
          console.error('Error disposing canvas:', error);
        }
      }
    };
  }, [canvas]);

  // Method to add text
  const addText = useCallback((text: string, options: Record<string, unknown> = {}) => {
    if (!canvas) return;

    const fontSize = (options.fontSize as number) || 32;
    const textObject = new fabric.Textbox(text, {
      left: 50,
      top: 50,
      width: 300,
      fontSize: fontSize,
      fontFamily: 'Arial',
      fill: '#000000',
      textAlign: 'center',
      ...options,
    }) as fabric.Textbox & { originalFontSize?: number };

    // Set the original font size for scaling purposes
    textObject.originalFontSize = fontSize;

    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
    return textObject;
  }, [canvas]);

  // Method to update selected object
  const updateSelectedObject = useCallback((properties: Record<string, unknown>) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(properties);
      
      // If fontSize is being updated and this is a textbox, update originalFontSize too
      if (activeObject.type === 'textbox' && 'fontSize' in properties) {
        const textObj = activeObject as fabric.Textbox & { originalFontSize?: number };
        textObj.originalFontSize = properties.fontSize as number;
      }
      
      activeObject.setCoords(); // Update object coordinates
      canvas.renderAll(); // Force re-render
      canvas.fire('object:modified', { target: activeObject }); // Trigger modified event
    }
  }, [canvas]);

  // Method to delete selected object
  const deleteSelected = useCallback(() => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  }, [canvas]);

  // Method to add background rectangle
  const addBackground = useCallback((color: string = '#ffffff') => {
    if (!canvas) return;

    // Remove existing background if any (check all objects for background-like properties)
    const objects = canvas.getObjects();
    const existingBackground = objects.find(obj => 
      obj.left === 0 && 
      obj.top === 0 && 
      obj.width === canvas.width && 
      obj.height === canvas.height &&
      !obj.selectable
    );
    if (existingBackground) {
      canvas.remove(existingBackground);
    }

    // Create background rectangle that spans the full canvas
    const background = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvas.width,
      height: canvas.height,
      fill: color,
      selectable: false, // Make it non-selectable
      evented: false, // Disable events
      hoverCursor: 'default',
      moveCursor: 'default',
    });

    // Add to canvas and send to back (lowest z-index)
    canvas.add(background);
    canvas.sendObjectToBack(background);
    canvas.renderAll();
    
    return background;
  }, [canvas]);

  // Method to load template data
  const loadTemplate = useCallback((elements: TemplateElement[]) => {
    if (!canvas) return;

    canvas.clear();

    // Add background first
    addBackground('#ffffff');

    // Calculate scale factors based on original template size vs canvas size
    const scaleX = canvas.width! / originalWidth;
    const scaleY = canvas.height! / originalHeight;
    const scale = Math.min(scaleX, scaleY); // Use uniform scale to maintain aspect ratio

    elements.forEach((element) => {
      if (element.type === 'text') {
        const originalFontSize = parseInt(element.style?.fontSize || '16');
        const scaledFontSize = Math.max(8, Math.round(originalFontSize * scale)); // Ensure minimum font size
        
        const textObject = new fabric.Textbox(element.content, {
          left: element.x * scale,
          top: element.y * scale,
          width: element.width * scale,
          fontSize: scaledFontSize,
          fontFamily: element.style?.fontFamily || 'Arial',
          fontWeight: element.style?.fontWeight || 'normal',
          fill: element.style?.color || '#000000',
          backgroundColor: element.style?.backgroundColor || 'transparent',
          textAlign: 'center',
        }) as fabric.Textbox & { originalFontSize?: number };

        // Set the original font size for scaling purposes
        textObject.originalFontSize = scaledFontSize;

        canvas.add(textObject);
      } else if (element.type === 'shape') {
        const shapeType = element.style?.shapeType;
        let shapeObject: fabric.Object | null = null;

        if (shapeType === 'rectangle') {
          shapeObject = new fabric.Rect({
            left: element.x * scale,
            top: element.y * scale,
            width: element.width * scale,
            height: element.height * scale,
            fill: element.style?.color || '#3B82F6',
            stroke: element.style?.stroke || undefined,
            strokeWidth: element.style?.strokeWidth || 0,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'circle') {
          shapeObject = new fabric.Circle({
            left: element.x * scale,
            top: element.y * scale,
            radius: (element.style?.radius || element.width / 2) * scale,
            fill: element.style?.color || '#6B7280',
            stroke: element.style?.stroke || undefined,
            strokeWidth: element.style?.strokeWidth || 0,
            cornerColor: '#6B7280',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'triangle') {
          shapeObject = new fabric.Triangle({
            left: element.x * scale,
            top: element.y * scale,
            width: element.width * scale,
            height: element.height * scale,
            fill: element.style?.color || '#3B82F6',
            stroke: element.style?.stroke || undefined,
            strokeWidth: element.style?.strokeWidth || 0,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'line') {
          shapeObject = new fabric.Line([0, 0, element.width * scale, 0], {
            left: element.x * scale,
            top: element.y * scale,
            stroke: element.style?.stroke || element.style?.color || '#3B82F6',
            strokeWidth: element.style?.strokeWidth || 3,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        }

        if (shapeObject) {
          canvas.add(shapeObject);
        }
      }
    });

    canvas.renderAll();
  }, [canvas, originalWidth, originalHeight, addBackground]);

  // Method to export template data
  const exportTemplate = useCallback(() => {
    if (!canvas) return [];

    // Calculate scale factors to convert back to original coordinates
    const scaleX = canvas.width! / originalWidth;
    const scaleY = canvas.height! / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    return canvas.getObjects()
      // Filter out background objects
      .filter((obj: fabric.Object) => {
        // Skip objects that look like backgrounds (full canvas size, non-selectable)
        return !(
          obj.left === 0 && 
          obj.top === 0 && 
          obj.width === canvas.width && 
          obj.height === canvas.height &&
          !obj.selectable
        );
      })
      .map((obj: fabric.Object) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          return {
            type: 'text' as const,
            content: textObj.text || '',
            x: (textObj.left || 0) / scale,
            y: (textObj.top || 0) / scale,
            width: (textObj.width || 0) / scale,
            height: (textObj.height || 0) / scale,
            style: {
              fontSize: `${Math.round((textObj.fontSize || 16) / scale)}px`,
              fontFamily: textObj.fontFamily,
              fontWeight: textObj.fontWeight,
              color: textObj.fill as string,
              backgroundColor: textObj.backgroundColor as string,
            },
          };
        } else if (obj.type === 'rect') {
          const rectObj = obj as fabric.Rect;
          return {
            type: 'shape' as const,
            content: '', // Shapes don't have content
            x: (rectObj.left || 0) / scale,
            y: (rectObj.top || 0) / scale,
            width: (rectObj.width || 0) / scale,
            height: (rectObj.height || 0) / scale,
            style: {
              shapeType: 'rectangle' as const,
              color: rectObj.fill as string,
              stroke: rectObj.stroke as string,
              strokeWidth: rectObj.strokeWidth || 0,
            },
          };
        } else if (obj.type === 'circle') {
          const circleObj = obj as fabric.Circle;
          const diameter = (circleObj.radius || 0) * 2;
          return {
            type: 'shape' as const,
            content: '', // Shapes don't have content
            x: (circleObj.left || 0) / scale,
            y: (circleObj.top || 0) / scale,
            width: diameter / scale,
            height: diameter / scale,
            style: {
              shapeType: 'circle' as const,
              color: circleObj.fill as string,
              stroke: circleObj.stroke as string,
              strokeWidth: circleObj.strokeWidth || 0,
              radius: (circleObj.radius || 0) / scale,
            },
          };
        } else if (obj.type === 'triangle') {
          const triangleObj = obj as fabric.Triangle;
          return {
            type: 'shape' as const,
            content: '', // Shapes don't have content
            x: (triangleObj.left || 0) / scale,
            y: (triangleObj.top || 0) / scale,
            width: (triangleObj.width || 0) / scale,
            height: (triangleObj.height || 0) / scale,
            style: {
              shapeType: 'triangle' as const,
              color: triangleObj.fill as string,
              stroke: triangleObj.stroke as string,
              strokeWidth: triangleObj.strokeWidth || 0,
            },
          };
        } else if (obj.type === 'line') {
          const lineObj = obj as fabric.Line;
          return {
            type: 'shape' as const,
            content: '', // Shapes don't have content
            x: (lineObj.left || 0) / scale,
            y: (lineObj.top || 0) / scale,
            width: (lineObj.width || 0) / scale,
            height: (lineObj.height || 0) / scale,
            style: {
              shapeType: 'line' as const,
              color: lineObj.stroke as string,
              stroke: lineObj.stroke as string,
              strokeWidth: lineObj.strokeWidth || 3,
            },
          };
        }
        return null;
      })
      .filter(Boolean) as TemplateElement[];
  }, [canvas, originalWidth, originalHeight]);

  // Method to load custom font
  const loadFont = useCallback(async (fontName: string, fontUrl: string) => {
    try {
      const font = new FontFace(fontName, `url(${fontUrl})`);
      await font.load();
      document.fonts.add(font);
      return true;
    } catch (error) {
      console.error('Font loading error:', error);
      return false;
    }
  }, []);

  // Method to resize canvas and update dimensions
  const resizeCanvas = useCallback((newWidth: number, newHeight: number, newOriginalWidth: number, newOriginalHeight: number) => {
    if (!canvas) return;

    // Export current template data before resizing
    const currentElements = exportTemplate();
    
    // Update canvas dimensions
    canvas.setDimensions({ width: newWidth, height: newHeight });
    
    // Clear and reload template with new dimensions
    canvas.clear();
    addBackground('#ffffff');
    
    // Calculate scale factors for elements
    const scaleX = newOriginalWidth / originalWidth;
    const scaleY = newOriginalHeight / originalHeight;
    
    // Scale all elements to new original dimensions
    const scaledElements = currentElements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY,
      style: {
        ...element.style,
        fontSize: element.style?.fontSize 
          ? `${Math.round(parseInt(element.style.fontSize) * Math.min(scaleX, scaleY))}px`
          : undefined,
        radius: element.style?.radius 
          ? element.style.radius * Math.min(scaleX, scaleY)
          : undefined,
        strokeWidth: element.style?.strokeWidth 
          ? element.style.strokeWidth * Math.min(scaleX, scaleY)
          : undefined,
      },
    }));
    
    // Calculate display scale based on new canvas size vs new original size
    const displayScaleX = newWidth / newOriginalWidth;
    const displayScaleY = newHeight / newOriginalHeight;
    const displayScale = Math.min(displayScaleX, displayScaleY);
    
    // Load elements with display scaling
    scaledElements.forEach((element) => {
      if (element.type === 'text') {
        const originalFontSize = parseInt(element.style?.fontSize || '16');
        const scaledFontSize = Math.max(8, Math.round(originalFontSize * displayScale));
        
        const textObject = new fabric.Textbox(element.content, {
          left: element.x * displayScale,
          top: element.y * displayScale,
          width: element.width * displayScale,
          fontSize: scaledFontSize,
          fontFamily: element.style?.fontFamily || 'Arial',
          fontWeight: element.style?.fontWeight || 'normal',
          fill: element.style?.color || '#000000',
          backgroundColor: element.style?.backgroundColor || 'transparent',
          textAlign: 'center',
        }) as fabric.Textbox & { originalFontSize?: number };

        textObject.originalFontSize = scaledFontSize;
        canvas.add(textObject);
      } else if (element.type === 'shape') {
        const shapeType = element.style?.shapeType;
        let shapeObject: fabric.Object | null = null;

        if (shapeType === 'rectangle') {
          shapeObject = new fabric.Rect({
            left: element.x * displayScale,
            top: element.y * displayScale,
            width: element.width * displayScale,
            height: element.height * displayScale,
            fill: element.style?.color || '#3B82F6',
            stroke: element.style?.stroke || undefined,
            strokeWidth: (element.style?.strokeWidth || 0) * displayScale,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'circle') {
          shapeObject = new fabric.Circle({
            left: element.x * displayScale,
            top: element.y * displayScale,
            radius: (element.style?.radius || element.width / 2) * displayScale,
            fill: element.style?.color || '#6B7280',
            stroke: element.style?.stroke || undefined,
            strokeWidth: (element.style?.strokeWidth || 0) * displayScale,
            cornerColor: '#6B7280',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'triangle') {
          shapeObject = new fabric.Triangle({
            left: element.x * displayScale,
            top: element.y * displayScale,
            width: element.width * displayScale,
            height: element.height * displayScale,
            fill: element.style?.color || '#3B82F6',
            stroke: element.style?.stroke || undefined,
            strokeWidth: (element.style?.strokeWidth || 0) * displayScale,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        } else if (shapeType === 'line') {
          shapeObject = new fabric.Line([0, 0, element.width * displayScale, 0], {
            left: element.x * displayScale,
            top: element.y * displayScale,
            stroke: element.style?.stroke || element.style?.color || '#3B82F6',
            strokeWidth: (element.style?.strokeWidth || 3) * displayScale,
            cornerColor: '#3B82F6',
            cornerStyle: 'rect',
            transparentCorners: false,
          });
        }

        if (shapeObject) {
          canvas.add(shapeObject);
        }
      }
    });
    
    canvas.renderAll();
  }, [canvas, originalWidth, originalHeight, exportTemplate, addBackground]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addText,
    updateSelectedObject,
    deleteSelected,
    loadTemplate,
    exportTemplate,
    loadFont,
    addBackground,
    resizeCanvas,
    canvas,
  }), [addText, updateSelectedObject, deleteSelected, loadTemplate, exportTemplate, loadFont, addBackground, resizeCanvas, canvas]);

  return (
    <div className="relative border border-gray-600 rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
});

FabricEditor.displayName = 'FabricEditor';

export default FabricEditor;
