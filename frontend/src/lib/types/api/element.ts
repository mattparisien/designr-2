export const ELEMENT_TYPES = ['text', 'image', 'shape', 'video'] as const;
export type ElementType = (typeof ELEMENT_TYPES)[number];

export interface ElementContent {
  placeholder: string;
  type: ElementType;
  value: string;
}

export interface Element {
  type: ElementType;
  placeholder?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    [key: string]: any;
  };
}
