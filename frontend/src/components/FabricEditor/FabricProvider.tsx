/* ------------------------------------------------------------------
   FabricProvider.tsx – initializes Fabric canvas against a <canvas> in the DOM
   ------------------------------------------------------------------ */
import React, { createContext, useContext, useRef, useEffect } from 'react';
import * as fabric from 'fabric';

const FabricCtx = createContext<fabric.Canvas | null>(null);
export const useFabric = () => useContext(FabricCtx);

export const FabricProvider: React.FC<
  React.PropsWithChildren<{ width: number; height: number }>
> = ({ width, height, children }) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const elRef = useRef<HTMLCanvasElement>(null);

  // Initialize once on mount
  useEffect(() => {
    if (!canvasRef.current && elRef.current) {
      canvasRef.current = new fabric.Canvas(elRef.current, { width, height });
    }
  }, [width, height]);

  // Keep size in sync
  useEffect(() => {
    const c = canvasRef.current;
    if (c) c.setDimensions({ width, height });
  }, [width, height]);

  return (
    <FabricCtx.Provider value={canvasRef.current}>
      {/* This canvas node will be picked up by Fabric */}
      <canvas ref={elRef} />
      {children}
    </FabricCtx.Provider>
  );
};
