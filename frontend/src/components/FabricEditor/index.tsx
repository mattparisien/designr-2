// index.tsx
import { forwardRef, useImperativeHandle } from 'react';
import { FabricProvider } from './FabricProvider';
import FabricCanvas from './FabricCanvas';
import { useObjects } from './hooks/useObjects';
import { useImportExport } from './hooks/useImportExport';
import { useResize } from './hooks/useResize';
import { useFonts } from './hooks/useFonts';
import { TemplateElement } from './types';

// Type definitions
interface FabricEditorProps {
  width: number;
  height: number;
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

const FabricEditor = forwardRef<FabricEditorRef, FabricEditorProps>(
  ({ width, height }, ref) => {
    const objects = useObjects();
    const io = useImportExport();
    const resize = useResize(width, height);
    const fontTools = useFonts();

    useImperativeHandle(ref, () => ({ ...objects, ...io, ...resize, ...fontTools }), [
      objects,
      io,
      resize,
      fontTools,
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
