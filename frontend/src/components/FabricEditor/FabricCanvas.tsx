import React, { createContext, useContext, useRef, useEffect } from 'react';
import * as fabric from 'fabric';

const FabricCtx = createContext<fabric.Canvas | null>(null);
export const useFabric = () => useContext(FabricCtx);

export const FabricProvider: React.FC<
  React.PropsWithChildren<{ width: number; height: number }>
> = ({ width, height, children }) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const elRef = useRef<HTMLCanvasElement>(null);

  // 1️⃣ Initialize Fabric when the <canvas> mounts
  useEffect(() => {
    if (!canvasRef.current && elRef.current) {
      canvasRef.current = new fabric.Canvas(elRef.current, { width, height });
    }
  }, [width, height]);

  // 2️⃣ Keep size in sync if width/height change
  useEffect(() => {
    const c = canvasRef.current;
    if (c) c.setDimensions({ width, height });
  }, [width, height]);

  return (
    <FabricCtx.Provider value={canvasRef.current}>
      {/* This is the <canvas> Fabric will draw onto */}
      <canvas ref={elRef} />
      {children}
    </FabricCtx.Provider>
  );
};
