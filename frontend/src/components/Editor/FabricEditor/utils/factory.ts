
import * as fabric from "fabric";
import { ShapeKind, ShapeOptions } from "../types";
// Factory function for creating shapes
export const factory = (kind: ShapeKind, opts: ShapeOptions): fabric.Object => {
    const defaultOptions = {
        left: 100,
        top: 100,
        fill: '#3B82F6',
        stroke: undefined,
        strokeWidth: 0,
        ...opts
    };

    switch (kind) {
        case 'rectangle':
            return new fabric.Rect({
                width: 100,
                height: 100,
                ...defaultOptions,
            });
        case 'circle':
            return new fabric.Circle({
                radius: 50,
                ...defaultOptions,
            });
        case 'triangle':
            return new fabric.Triangle({
                width: 100,
                height: 100,
                ...defaultOptions,
            });
        case 'line':
            return new fabric.Line([0, 0, 100, 0], {
                stroke: (opts.stroke as string) || (opts.color as string) || '#3B82F6',
                strokeWidth: typeof opts.strokeWidth === 'number' ? opts.strokeWidth : 3,
                left: defaultOptions.left,
                top: defaultOptions.top,
            });
        default:
            throw new Error(`Unsupported shape kind: ${kind}`);
    }
};