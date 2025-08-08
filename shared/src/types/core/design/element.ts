import { Rect, Size } from "./common";

export type DesignElementType = 'text' | 'shape' | 'image' | 'line';

export interface DesignElementContent {
  placeholder: string;
  type: DesignElementType;
  value: string;
}

interface DesignElementBase {
  id: string;
  type: DesignElementType;
  placeholder?: string;
  stackingOrder?: number;
  rect: Rect;
}

export interface DesignTextElement extends DesignElementBase {
  type: "text";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  color?: string;
}

export interface DesignShapeElement extends DesignElementBase {
  type: "shape";
  form: 'rectangle' | 'circle' | 'line';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface DesignLineElement extends DesignElementBase {
  type: "line";
  backgroundColor?: string;
  width?: number;
}

export interface DesignImageElement extends DesignElementBase {
  type: "image";
  src: string;
  alt?: string;
}

export type DesignElement = DesignTextElement | DesignShapeElement | DesignLineElement | DesignImageElement;