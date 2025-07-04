/* ------------------------------------------------------------------
   text.ts – helper utilities for Fabric ⇄ Template text elements
   ------------------------------------------------------------------ */
import { TemplateElement } from '../types';

/**
 * Convert a serialised text element into the options object for `addText()`.
 * Applies an optional uniform `scale` to all positional and size values.
 */
export const denormaliseText = (
  el: TemplateElement,
  scale = 1,
): Record<string, unknown> => {
  if (el.type !== 'text') {
    throw new Error('denormaliseText expects a text element');
  }

  const st = el.style ?? {};
  // Parse the px fontSize string (e.g. "24px") or fallback to 16
  const baseSize = parseInt(st.fontSize?.toString() || '16', 10);
  const fontSize = Math.max(8, Math.round(baseSize * scale));

  return {
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    fontSize,
    fontFamily: st.fontFamily,
    fontWeight: st.fontWeight,
    fill: st.color,
    backgroundColor: st.backgroundColor,
    // additional Textbox props can be spread here if needed
  };
};
