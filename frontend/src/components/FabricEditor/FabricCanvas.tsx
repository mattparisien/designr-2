// FabricCanvas.tsx
import React, { useEffect, useRef } from 'react';
import { useFabric } from './FabricProvider';

const FabricCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvas = useFabric();

  useEffect(() => {
    if (canvas && canvasEl.current) {
      // Fabric’s initialize method is protected in the typings,
      // so we force-cast here to actually bind the existing instance
      // to our <canvas> element.
      //
      // NOTE: initialize() comes from StaticCanvas under the hood.
      // If you’d rather re-create the instance, see the earlier examples.
      // @ts-ignore
      canvas.initialize(canvasEl.current);

      // Optional: re-render any existing objects
      canvas.requestRenderAll();
    }

    // We do NOT dispose here — let your provider own the lifecycle.
  }, [canvas]);

  return <canvas ref={canvasEl} className={className} />;
};

export default FabricCanvas;
