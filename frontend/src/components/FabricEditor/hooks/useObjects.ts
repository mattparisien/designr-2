import * as fabric from "fabric";
import { useCallback } from "react";
import { useFabric } from "../FabricProvider";
import { type ShapeKind, type ShapeOptions } from "../types";
import { factory } from "../utils/factory";

// Default options for text
const defaults = {
    text: {
        left: 50,
        top: 50,
        width: 300,
        fontSize: 32,
        fontFamily: 'Arial',
        fill: '#000000',
        textAlign: 'center' as const,
    }
};



export const useObjects = () => {
    const canvas = useFabric();

    /** Add text */
    const addText = useCallback((txt: string, opts?: Partial<fabric.TextboxProps>) => {

        if (!canvas) return;

        const textOptions = {
            ...defaults.text,
            ...opts
        } as fabric.TextboxProps;

        const tb = new fabric.Textbox(txt, textOptions);
        canvas.add(tb);
        canvas.setActiveObject(tb);
        return tb;
    }, [canvas]);

    /** Add shape */
    const addShape = useCallback(
        (kind: ShapeKind, opts: ShapeOptions = {}) => {

            if (!canvas) return;

            const obj = factory(kind, opts);
            canvas.add(obj);
            canvas.setActiveObject(obj);
            return obj;
        },
        [canvas],
    );

    /** Update active object */
    const updateSelected = useCallback(
        (props: Record<string, unknown>) => {

            if (!canvas) return;
            
            const obj = canvas.getActiveObject();
            if (!obj) return;
            
            // Inline property normalization to avoid type issues
            const updatedProperties = { ...props };

            // Handle special property mappings for different object types
            if (obj.type === 'textbox') {
                // For text objects, handle font size specially
                if ('fontSize' in props) {
                    const textObj = obj as fabric.Textbox & { originalFontSize?: number };
                    textObj.originalFontSize = props.fontSize as number;
                }
            } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
                // For shapes, handle color and background color
                if ('color' in props) {
                    updatedProperties.fill = props.color;
                    delete updatedProperties.color;
                }
                if ('backgroundColor' in props) {
                    updatedProperties.fill = props.backgroundColor;
                    delete updatedProperties.backgroundColor;
                }
            } else if (obj.type === 'line') {
                // For lines, map color to stroke
                if ('color' in props) {
                    updatedProperties.stroke = props.color;
                    delete updatedProperties.color;
                }
            }
            
            obj.set(updatedProperties);
            canvas.requestRenderAll();
            canvas.fire('object:modified', { target: obj });
        },
        [canvas],
    );

    return { addText, addShape, updateSelected };
};
