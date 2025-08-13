export type ColorRole = "primary" | "secondary" | "accent" | "neutral" | "foreground" | "support";

export interface ColorToken {
  id: string;
  name: string;
  value: string;
  role?: ColorRole;
  usage?: ("fills" | "text" | "strokes" | "effects")[];
  locked?: boolean;
  meta?: Record<string, any>;
}

export type SolidPaintRef = { type: "solid"; tokenId?: string; value?: string; opacity?: number };