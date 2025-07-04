/* ------------------------------------------------------------------
   useResize.ts – uniformly resizes the Fabric canvas and all objects
   ------------------------------------------------------------------ */
import { useCallback, useEffect, useRef } from 'react';
import { useFabric } from '../FabricProvider';
import { commitObjectScale } from '../utils/commitObjectScale';

/**
 * Returns a resize function and automatically calls it whenever the
 * supplied `width` / `height` props change.
 */
export const useResize = (width: number, height: number) => {
  const canvas = useFabric();
  const last = useRef({ w: width, h: height });

  /**
   * Scale the whole canvas by the smallest ratio that fits `newW×newH`.
   */
  const resize = useCallback(
    (newW: number, newH: number) => {
      if (!canvas) return;

      const { w: oldW, h: oldH } = last.current;
      const factor = Math.min(newW / oldW, newH / oldH);

      // 1. Resize the canvas DOM element
      canvas.setDimensions({ width: newW, height: newH });

      // 2. Move & scale every selectable object
      canvas.getObjects().forEach((o) => {
        if (o.selectable === false) return; // skip non‑interactive bg
        o.set({
          left: (o.left || 0) * factor,
          top: (o.top || 0) * factor,
          scaleX: (o.scaleX || 1) * factor,
          scaleY: (o.scaleY || 1) * factor,
        });
        commitObjectScale(o); // bake the scale → width / height / radius
      });

      // 3. Remember new size for next call & redraw
      last.current = { w: newW, h: newH };
      canvas.requestRenderAll();
    },
    [canvas],
  );

  /* Auto‑run when the parent passes a different size */
  useEffect(() => {
    resize(width, height);
  }, [width, height, resize]);

  return resize;
};
