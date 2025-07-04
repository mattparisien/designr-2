/* ------------------------------------------------------------------
   serialize.ts – convert Fabric.Object ➜ TemplateElement
   ------------------------------------------------------------------ */
import * as fabric from 'fabric';
import { TemplateElement } from '../types';
import { serialiseGradient, isGradient } from './gradients';

/**
 * Convert any Fabric object into its equivalent TemplateElement for export.
 */
export const serialize = (obj: fabric.Object): TemplateElement => {
  const base = {
    x: (obj.left ?? 0),
    y: (obj.top ?? 0),
    width: (obj.width ?? 0),
    height: (obj.height ?? 0),
    content: '',
  } as const;

  // Text box
  if (obj.type === 'textbox') {
    const tb = obj as fabric.Textbox;
    return {
      ...base,
      type: 'text',
      content: tb.text ?? '',
      style: {
        fontSize: `${tb.fontSize}px`,
        fontFamily: tb.fontFamily,
        fontWeight: String(tb.fontWeight),
        color: tb.fill as string,
        backgroundColor: tb.backgroundColor as string,
      },
    };
  }

  // Shapes (rect, triangle, circle, line)
  const style: Record<string, unknown> = {};
  if (obj.type === 'rect' || obj.type === 'triangle' || obj.type === 'circle') {
    const shape = obj as fabric.Rect | fabric.Triangle | fabric.Circle;
    const fill = shape.fill;
    if (isGradient(fill)) {
      style.gradient = serialiseGradient(fill);
    } else {
      style.color = fill as string;
      style.fill = fill as string;
    }
    style.stroke = shape.stroke as string;
    style.strokeWidth = shape.strokeWidth;

    // circle radius override
    if (obj.type === 'circle') {
      const c = shape as fabric.Circle;
      style.shapeType = 'circle';
      style.radius = c.radius;
    } else {
      style.shapeType = obj.type === 'rect' ? 'rectangle' : 'triangle';
    }

    return {
      ...base,
      type: 'shape',
      content: '',
      style,
    };
  }

  if (obj.type === 'line') {
    const line = obj as fabric.Line;
    style.shapeType = 'line';
    style.stroke = line.stroke as string;
    style.strokeWidth = line.strokeWidth;
    style.color = line.stroke as string;
    return {
      ...base,
      type: 'shape',
      content: '',
      style,
    };
  }

  throw new Error(`serialize: unsupported object type ${obj.type}`);
};
