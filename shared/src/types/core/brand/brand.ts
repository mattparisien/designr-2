import { Object } from "../object";

// You can keep it broad or narrow it later with a runtime validator
export type HexColor = `#${string}`;

export type BrandVibe =
  | 'playful'
  | 'elegant'
  | 'bold'
  | 'minimal'
  | 'professional';

/**
 * Color Palettes - object structure with name and colors
 * Each palette is an object: { name: "Palette Name", colors: ["#FF0000", "#00FF00", "#0000FF"] }
 */
export interface ColorPalette {
  name: string;
  colors: string[]; // Array of hex color codes
}

export type ColorPalettes = ColorPalette[]; // Array of color palette objects

// New color types matching backend
export type Color = { hex: HexColor };
export interface Palette { colors: Color[] }


export interface Brand extends Object {
  name: string;
  logoUrl?: string;
  palettes: Palette[];
  vibe: BrandVibe;
  voice: string;
  personality: string;
  targetAudience: string;
  toneGuidelines: string;
  keyValues: string;
  communicationStyle: string;
  industry?: string;
  tagline?: string;
  doNotUse?: string;
  preferredWords?: string[];
  avoidedWords?: string[];
}
