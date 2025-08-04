import { Rect, Size } from "./common";

export type DesignElementType = 'text' | 'shape' | 'image';

export interface DesignElementContent {
  placeholder: string;
  type: DesignElementType;
  value: string;
}

interface DesignElementBase {
  id: string;
  type: DesignElementType;
  placeholder?: string;
  rect: Rect;
}

export interface DesignTextElement extends DesignElementBase {
  type: "text";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

export interface DesignShapeElement extends DesignElementBase {
  type: "shape";
  form: 'rectangle' | 'circle' | 'line';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface DesignImageElement extends DesignElementBase {
  type: "image";
  src: string;
  alt?: string;
}

export type DesignElement = DesignTextElement | DesignShapeElement | DesignImageElement;