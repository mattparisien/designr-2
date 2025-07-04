/* ------------------------------------------------------------------
   useFonts.ts – lazy‑loads web fonts and exposes a simple helper
   ------------------------------------------------------------------ */

/**
 * Loads a custom font from an external URL, adds it to `document.fonts`,
 * and resolves `true` when ready for Canvas / CSS usage.
 * Returns `{ loadFont }` so callers can do:
 * ```ts
 * const { loadFont } = useFonts();
 * await loadFont('Inter', '/fonts/Inter.var.woff2');
 * ```
 */
export const useFonts = () => {
  /**
   * Inject a @font‑face at runtime and wait until it’s ready.
   */
  const loadFont = async (family: string, url: string): Promise<boolean> => {
    try {
      // Avoid double‑loading the same family+url pair
      if (document.fonts.check(`1em ${family}`)) return true;

      const face = new FontFace(family, `url(${url})`);
      await face.load();
      document.fonts.add(face);
      return true;
    } catch (err) {
      console.error('[useFonts] could not load font:', family, url, err);
      return false;
    }
  };

  return { loadFont };
};
