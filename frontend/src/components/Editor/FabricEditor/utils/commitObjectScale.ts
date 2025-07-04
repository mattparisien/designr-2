/* ------------------------------------------------------------------
   commitObjectScale.ts – "bake in" an object's visual scale
   ------------------------------------------------------------------
   Fabric lets objects keep `scaleX/scaleY` after transforms. That’s handy
   while user‑dragging, but for template export / uniform canvas‑resize
   we usually want the intrinsic width / height (or radius, line coords)
   to reflect what we see.

   Call this once you’ve multiplied `scaleX/scaleY` into the object – e.g.
   inside a resize routine or at the end of an interactive transform.
   ------------------------------------------------------------------ */
import * as fabric from 'fabric';

export const commitObjectScale = (obj: fabric.Object): void => {
  // Nothing to do if scale is identity
  if ((obj.scaleX ?? 1) === 1 && (obj.scaleY ?? 1) === 1) return;

  switch (obj.type) {
    /* -------------------------------------------------------------- */
    case 'rect':
    case 'triangle': {
      const w = obj.getScaledWidth();
      const h = obj.getScaledHeight();
      obj.set({ width: w, height: h });
      break;
    }

    /* -------------------------------------------------------------- */
    case 'circle': {
      const c = obj as fabric.Circle;
      const r = c.getScaledWidth() / 2; // scaled diameter → radius
      c.set({ radius: r });
      break;
    }

    /* -------------------------------------------------------------- */
    case 'line': {
      const ln = obj as fabric.Line;
      ln.set({
        x2: ln.x2! * (obj.scaleX ?? 1),
        y2: ln.y2! * (obj.scaleY ?? 1),
      });
      break;
    }

    /* -------------------------------------------------------------- */
    case 'textbox': {
      const tb = obj as fabric.Textbox;
      tb.set({
        fontSize: (tb.fontSize ?? 16) * (obj.scaleY ?? 1),
        width: obj.getScaledWidth(),
      });
      break;
    }

    /* -------------------------------------------------------------- */
    default:
      // For unsupported types we just reset the scale so future
      // transforms start from 1 without changing intrinsic props.
      break;
  }

  // Reset scale so future transforms start fresh
  obj.set({ scaleX: 1, scaleY: 1 });
  obj.setCoords(); // recompute controls & bounding box
};
