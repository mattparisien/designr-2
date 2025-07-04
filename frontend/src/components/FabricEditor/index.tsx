// index.tsx
import { forwardRef, useImperativeHandle } from 'react';
import { FabricProvider } from './FabricProvider';
import FabricCanvas from './FabricCanvas';
import { useObjects } from './hooks/useObjects';
import { useImportExport } from './hooks/useImportExport';
import { useResize } from './hooks/useResize';
import { useFonts } from './hooks/useFonts';

// Type definitions
interface FabricEditorProps {
  width: number;
  height: number;
}

interface FabricEditorRef {
  addText: ReturnType<typeof useObjects>['addText'];
  addShape: ReturnType<typeof useObjects>['addShape'];
  updateSelected: ReturnType<typeof useObjects>['updateSelected'];
  // Add other methods from hooks as needed
}

const FabricEditor = forwardRef<FabricEditorRef, FabricEditorProps>(
  ({ width, height }, ref) => {
    const objects   = useObjects();
    const io        = useImportExport();
    const resize    = useResize(width, height);
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
