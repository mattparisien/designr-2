/* ------------------------------------------------------------------
   gradients.ts – helper utilities for Fabric ⇄ Template gradients
   ------------------------------------------------------------------ */
import * as fabric from 'fabric';
import { GradientConfig } from '../types';

/** Concrete Fabric gradient covering both kinds */
export type FGradient = fabric.Gradient<'linear' | 'radial'>;

/** Runtime guard */
export const isGradient = (f: unknown): f is FGradient =>
  !!f && typeof f === 'object' && 'colorStops' in (f as Record<string, unknown>);

/**
 * Convert Fabric → serialisable GradientConfig without hitting the
 * "r1 doesn't exist on Linear" TypeScript error.
 */
export const serialiseGradient = (g: FGradient): GradientConfig => {
  // Common linear‑coords base
  const coords: GradientConfig['coords'] = {
    x1: g.coords.x1,
    y1: g.coords.y1,
    x2: g.coords.x2,
    y2: g.coords.y2,
  };

  // Radial extras added only when available
  if (g.type === 'radial') {
    const rc = g.coords as fabric.RadialGradientCoords<number>;
    coords.r1 = rc.r1;
    coords.r2 = rc.r2;
  }

  return {
    type: g.type,
    coords,
    colorStops: g.colorStops.map(({ offset, color }) => ({ offset, color })),
  };
};
