import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_FONT_STYLE, DEFAULT_FONT_WEIGHT, DEFAULT_LETTER_SPACING } from "../../../../lib/constants";

// Calculate text width based on content and font size
export const calculateTextWidth = (
    content: string,
    fontSize: number = DEFAULT_FONT_SIZE,
    fontFamily: string = DEFAULT_FONT_FAMILY,
    letterSpacing: number = DEFAULT_LETTER_SPACING,
    fontWeight: string = DEFAULT_FONT_WEIGHT,
    fontStyle: string = DEFAULT_FONT_STYLE
): number => {
    console.log('DEBUG calculateTextWidth called with:', { content, fontSize, fontFamily, letterSpacing, fontWeight, fontStyle });
    
    // Create a temporary canvas element to measure text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        console.log('DEBUG: No canvas context, using fallback');
        return content.length * fontSize * 0.6; // Fallback calculation
    }

    // Set high DPI for better accuracy
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 2000 * dpr;
    canvas.height = 200 * dpr;
    context.scale(dpr, dpr);

    // Set comprehensive font properties including weight and style
    context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textBaseline = 'top';

    console.log('DEBUG: Canvas font set to:', context.font);

    // Split content by lines and measure the widest line
    const lines = content.split('\n');
    let maxWidth = 0;

    lines.forEach(line => {
        if (line.length === 0) {
            // Empty line still takes up space
            maxWidth = Math.max(maxWidth, fontSize * 0.5);
            return;
        }

        const metrics = context.measureText(line);
        let lineWidth = metrics.width;

        // Add letter spacing if specified (convert em to pixels)
        if (letterSpacing > 0 && line.length > 1) {
            const letterSpacingPx = letterSpacing * fontSize;
            lineWidth += letterSpacingPx * (line.length - 1);
        }

        // Account for special characters and punctuation that might extend bounds
        // Use actualBoundingBoxRight if available for better accuracy
        if (metrics.actualBoundingBoxLeft !== undefined && metrics.actualBoundingBoxRight !== undefined) {
            const actualWidth = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
            lineWidth = Math.max(lineWidth, actualWidth);
        }

        maxWidth = Math.max(maxWidth, lineWidth);
    });

    // Add small padding to prevent text clipping and ensure minimum width
    const padding = fontSize * 0.1; // 10% of font size as padding
    const calculatedWidth = Math.max(maxWidth + padding, fontSize * 2); // Minimum 2x font size

    console.log('DEBUG calculateTextWidth result:', { 
        maxWidth, 
        padding, 
        calculatedWidth,
        finalResult: Math.round(calculatedWidth),
        lines: lines.length,
        firstLine: lines[0]
    });

    // Cleanup
    canvas.remove();

    return Math.round(calculatedWidth);
};