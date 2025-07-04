// index.tsx
import { forwardRef, useImperativeHandle, useCallback } from 'react';
import * as fabric from 'fabric';
import { FabricProvider, useFabric } from './FabricProvider';
import FabricCanvas from './FabricCanvas';
import { useObjects } from './hooks/useObjects';
import { useImportExport } from './hooks/useImportExport';
import { useResize } from './hooks/useResize';
import { useFonts } from './hooks/useFonts';
import { TemplateElement, ShapeKind } from './types';

// Type definitions
interface FabricEditorProps {
  width: number;
  height: number;
}


export interface FabricEditorRef {
  addText: (text: string, options?: Record<string, unknown>) => unknown;
  addShape: (kind: ShapeKind, options?: Record<string, unknown>) => unknown;
  updateSelected: (properties: Record<string, unknown>) => void;
  loadTemplate: (elements: TemplateElement[]) => void;
  exportTemplate: () => TemplateElement[] | undefined;
  loadFont: (fontName: string, fontUrl: string) => Promise<boolean>;
  resize: (newWidth: number, newHeight: number) => void;
  // Additional methods for compatibility
  addBackground: (color?: string) => unknown;
  deleteSelected: () => void;
  canvas: fabric.Canvas | null;
  // Legacy method aliases
  updateSelectedObject: (properties: Record<string, unknown>) => void;
  resizeCanvas: (newWidth: number, newHeight: number, originalWidth?: number, originalHeight?: number) => void;
}

const FabricEditor = forwardRef<FabricEditorRef, FabricEditorProps>(
  ({ width, height }, ref) => {
    const objects = useObjects();
    const io = useImportExport();
    const resize = useResize(width, height);
    const fontTools = useFonts();
    const canvas = useFabric();

    // Additional methods for compatibility
    const addBackground = useCallback((color = '#ffffff') => {
      if (!canvas) return;
      
      // Remove existing background
      const existing = canvas.getObjects().find((obj: fabric.Object) => obj.selectable === false);
      if (existing) canvas.remove(existing);
      
      // Add new background
      const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        fill: color,
        selectable: false,
        evented: false,
        excludeFromExport: false,
      });
      
      canvas.add(rect);
      canvas.sendObjectToBack(rect);
      canvas.requestRenderAll();
      return rect;
    }, [canvas]);

    const deleteSelected = useCallback(() => {
      if (!canvas) return;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    }, [canvas]);

    // Legacy method aliases
    const updateSelectedObject = useCallback((properties: Record<string, unknown>) => {
      objects.updateSelected(properties);
    }, [objects]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const resizeCanvas = useCallback((newWidth: number, newHeight: number, originalWidth?: number, originalHeight?: number) => {
      resize(newWidth, newHeight);
    }, [resize]);

    useImperativeHandle(ref, () => ({ 
      ...objects, 
      ...io, 
      resize, 
      ...fontTools,
      addBackground,
      deleteSelected,
      canvas,
      updateSelectedObject,
      resizeCanvas,
    }), [
      objects,
      io,
      resize,
      fontTools,
      canvas,
      addBackground,
      deleteSelected,
      updateSelectedObject,
      resizeCanvas,
    ]);

    return (
      <FabricProvider width={width} height={height}>
        <div className="relative border border-gray-600 rounded-lg">
          <FabricCanvas className="block" />
        </div>
      </FabricProvider>
    );
  },
);

FabricEditor.displayName = 'FabricEditor';

export default FabricEditor;
