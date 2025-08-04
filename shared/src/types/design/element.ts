import { Position, Size } from "./common";

export type DesignElementType = 'text' | 'image' | 'shape' | 'video';

export interface DesignElementContent {
  placeholder: string;
  type: DesignElementType;
  value: string;
}

interface DesignElementBase {
  type: DesignElementType;
  placeholder?: string;
  position: Position;
  size: Size;
}

export interface DesignTextElement extends DesignElementBase {
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

export interface DesignImageElement extends DesignElementBase {
  src: string;
  alt?: string;
}

export type DesignElement = DesignTextElement | DesignImageElement;