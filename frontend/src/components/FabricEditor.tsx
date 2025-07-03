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
      }
      return null;
    }).filter(Boolean) as TemplateElement[];
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

    // Store current objects
    const currentObjects = canvas.getObjects();
    
    // Calculate scale factors
    const oldScaleX = canvas.width! / originalWidth;
    const oldScaleY = canvas.height! / originalHeight;
    const oldScale = Math.min(oldScaleX, oldScaleY);
    
    const newScaleX = newWidth / newOriginalWidth;
    const newScaleY = newHeight / newOriginalHeight;
    const newScale = Math.min(newScaleX, newScaleY);
    
    const scaleFactor = newScale / oldScale;

    // Update canvas dimensions
    canvas.setDimensions({ width: newWidth, height: newHeight });
    
    // Scale all objects
    currentObjects.forEach((obj) => {
      if (obj.selectable !== false) { // Skip non-selectable objects like background
        // Scale position and size
        obj.set({
          left: (obj.left || 0) * scaleFactor,
          top: (obj.top || 0) * scaleFactor,
          scaleX: (obj.scaleX || 1) * scaleFactor,
          scaleY: (obj.scaleY || 1) * scaleFactor,
        });
        
        // Special handling for text objects to scale font size
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox & { originalFontSize?: number };
          const currentFontSize = textObj.fontSize || 16;
          const newFontSize = Math.max(8, Math.round(currentFontSize * scaleFactor));
          
          textObj.set({
            fontSize: newFontSize,
            width: (textObj.width || 0) * scaleFactor,
          });
          
          // Update original font size for future scaling
          if (textObj.originalFontSize) {
            textObj.originalFontSize = newFontSize;
          }
          
          // Recalculate text dimensions
          textObj.initDimensions();
        }
        
        obj.setCoords();
      }
    });
    
    // Update background if it exists
    const background = currentObjects.find(obj => 
      obj.left === 0 && 
      obj.top === 0 && 
      !obj.selectable
    );
    
    if (background) {
      background.set({
        width: newWidth,
        height: newHeight,
      });
      background.setCoords();
    }
    
    canvas.renderAll();
  }, [canvas, originalWidth, originalHeight]);

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
