import * as fabric from "fabric";
import { useCallback } from "react";
import { useFabric } from "../FabricProvider";
import { TextOptions } from "fabric/fabric-impl";


export const useObjects = () => {
    const canvas = useFabric();

    /** Add text */
    const addText = useCallback((txt: string, opts?: TextOptions) => {

        if (!canvas) return;

        const tb = new fabric.Textbox(txt, { ...defaults.text, ...opts });
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
            obj.set(normaliseProps(obj, props));
            canvas.requestRenderAll();
            canvas.fire('object:modified', { target: obj });
        },
        [canvas],
    );

    return { addText, addShape, updateSelected };
};
