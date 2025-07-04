// Function to normalize properties for different object types
export const normaliseProps = (obj: fabric.Object, props: Record<string, unknown>): Record<string, unknown> => {
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

    return updatedProperties;
};