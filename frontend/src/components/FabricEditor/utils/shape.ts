/* ------------------------------------------------------------------
   shape.ts – converts TemplateElement ➜ options for addShape()
   ------------------------------------------------------------------ */
import { TemplateElement } from '../types/index';
import { GradientConfig } from '../types/index';

/**
 * Turn a serialised shape element into the options object our `addShape`
 * helper expects. Scales positional props if `scale` is provided.
 */
export const denormaliseShape = (
  el: TemplateElement,
  scale = 1,
): Record<string, unknown> => {
  if (el.type !== 'shape') throw new Error('denormaliseShape expects a shape element');

  const st = el.style ?? {};
  const base = {
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    stroke: st.stroke,
    strokeWidth: st.strokeWidth,
    // accept any of the colour aliases
    color: st.color ?? st.fill ?? st.backgroundColor,
    fill: st.fill,
    backgroundColor: st.backgroundColor,
    gradient: st.gradient as GradientConfig | undefined,
  } as Record<string, unknown>;

  if (st.shapeType === 'circle' && st.radius) {
    base.radius = st.radius * scale;
    delete base.width;
    delete base.height;
  }

  return base;
};
