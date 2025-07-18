/**
 * Element Factory Module
 * 
 * This module provides centralized factory functions for creating canvas elements.
 * It encapsulates the logic for element creation, positioning, and default values,
 * making the codebase more maintainable and consistent.
 * 
 * Features:
 * - Type-safe element creation
 * - Automatic centering and positioning
 * - Consistent default values
 * - Aspect ratio calculations for images
 * - Unique ID generation
 * 
 * Usage:
 * ```typescript
 * // Create a text element
 * const textElement = ElementFactory.createTextElement(canvasSize, {
 *   content: "Hello World",
 *   fontSize: 24
 * });
 * 
 * // Create a complete element ready for canvas
 * const completeElement = ElementFactory.createCompleteElement(textElement);
 * 
 * // Or use convenience functions
 * const quickText = createQuickTextElement(canvasSize, "Hello World");
 * ```
 */

import { nanoid } from 'nanoid';
import { Element } from '../types/canvas';
import { DEFAULT_FONT_SIZE, DEFAULT_TEXT_ALIGN, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, DEFAULT_ELEMENT_DIMENSIONS } from '../constants';
import { measureTextWidth, measureTextHeight } from '../utils/textMeasurement';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Default colors for different element types
 */
export const DEFAULT_ELEMENT_COLORS = {
  TEXT_COLOR: "#000000",
  SHAPE_BACKGROUND: "#3b82f6",
  SHAPE_BORDER: "#000000", 
  LINE_COLOR: "#000000",
  ARROW_COLOR: "#000000",
} as const;

/**
 * Factory functions for creating different types of canvas elements
 */
export class ElementFactory {
  /**
   * Creates a new text element
   */
  static createTextElement(
    canvasSize: CanvasSize,
    options: {
      content?: string;
      fontSize?: number;
      fontFamily?: string;
      textAlign?: "left" | "center" | "right";
      width?: number;
      height?: number;
      position?: ElementPosition;
      letterSpacing?: number;
      lineHeight?: number;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      isStrikethrough?: boolean;
      color?: string;
      isEditable?: boolean;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      content = "Add your text here",
      fontSize = DEFAULT_FONT_SIZE,
      fontFamily = "Inter",
      textAlign = DEFAULT_TEXT_ALIGN,
      position,
      letterSpacing = DEFAULT_LETTER_SPACING,
      lineHeight = DEFAULT_LINE_HEIGHT,
      bold = false,
      italic = false,
      underline = false,
      isStrikethrough = false,
      color = DEFAULT_ELEMENT_COLORS.TEXT_COLOR,
      isEditable = false
    } = options;

    // Calculate text dimensions dynamically based on content and styling
    const textWidth = measureTextWidth(content, {
      fontSize,
      fontFamily,
      isBold: bold,
      isItalic: italic,
      letterSpacing
    });

    // Add some padding to the width for better visual appearance
    const width = Math.max(textWidth, 100); // Minimum width of 100px
    
    // Calculate height based on the calculated width and line height
    const height = measureTextHeight(content, width, {
      fontSize,
      fontFamily,
      isBold: bold,
      isItalic: italic,
      lineHeight
    });

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - width) / 2,
      y: (canvasSize.height - height) / 2
    };

    return {
      kind: "text" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width,
      height,
      rect: {
        x: elementPosition.x,
        y: elementPosition.y,
        width,
        height
      },
      content,
      fontSize,
      fontFamily,
      textAlign,
      letterSpacing,
      lineHeight,
      bold,
      italic,
      underline,
      isStrikethrough,
      color,
      isNew: true,
      isEditable,
      opacity: 1,
      rotation: 0
    };
  }

  /**
   * Creates a new shape element
   */
  static createShapeElement(
    canvasSize: CanvasSize,
    shapeType: "rect" | "circle" | "triangle",
    options: {
      size?: number;
      position?: ElementPosition;
      backgroundColor?: string;
      borderWidth?: number;
      borderColor?: string;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      size = DEFAULT_ELEMENT_DIMENSIONS.SHAPE_SIZE,
      position,
      backgroundColor = DEFAULT_ELEMENT_COLORS.SHAPE_BACKGROUND,
      borderWidth = 0,
      borderColor = DEFAULT_ELEMENT_COLORS.SHAPE_BORDER,
      opacity = 1,
      rotation = 0
    } = options;

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - size) / 2,
      y: (canvasSize.height - size) / 2
    };

    return {
      kind: "shape" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width: size,
      height: size,
      shapeType,
      backgroundColor,
      borderWidth,
      borderColor,
      opacity,
      rotation,
      isNew: true
    };
  }

  /**
   * Creates a new line element
   */
  static createLineElement(
    canvasSize: CanvasSize,
    options: {
      length?: number;
      thickness?: number;
      position?: ElementPosition;
      backgroundColor?: string;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      length = DEFAULT_ELEMENT_DIMENSIONS.LINE_LENGTH,
      thickness = DEFAULT_ELEMENT_DIMENSIONS.LINE_THICKNESS,
      position,
      backgroundColor = DEFAULT_ELEMENT_COLORS.LINE_COLOR,
      opacity = 1,
      rotation = 0
    } = options;

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - length) / 2,
      y: canvasSize.height / 2
    };

    return {
      kind: "line" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width: length,
      height: thickness,
      backgroundColor,
      opacity,
      rotation,
      isNew: true
    };
  }

  /**
   * Creates a new image element
   */
  static createImageElement(
    canvasSize: CanvasSize,
    imageData: {
      src: string;
      alt?: string;
      originalWidth: number;
      originalHeight: number;
    },
    options: {
      maxWidth?: number;
      maxHeight?: number;
      position?: ElementPosition;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      maxWidth = DEFAULT_ELEMENT_DIMENSIONS.IMAGE_MAX_WIDTH,
      maxHeight = DEFAULT_ELEMENT_DIMENSIONS.IMAGE_MAX_HEIGHT,
      position,
      opacity = 1,
      rotation = 0
    } = options;

    const { src, alt = "", originalWidth, originalHeight } = imageData;

    // Calculate aspect ratio and final dimensions
    const aspectRatio = originalHeight / originalWidth;
    
    let finalWidth = originalWidth;
    let finalHeight = originalHeight;
    
    // Scale down if the image is too large
    if (originalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = maxWidth * aspectRatio;
    }
    
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight / aspectRatio;
    }

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - finalWidth) / 2,
      y: (canvasSize.height - finalHeight) / 2
    };

    return {
      kind: "image" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width: finalWidth,
      height: finalHeight,
      src,
      alt,
      opacity,
      rotation,
      isNew: true
    };
  }

  /**
   * Creates a new arrow element (line with arrow styling)
   */
  static createArrowElement(
    canvasSize: CanvasSize,
    options: {
      length?: number;
      thickness?: number;
      position?: ElementPosition;
      backgroundColor?: string;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      length = DEFAULT_ELEMENT_DIMENSIONS.ARROW_LENGTH,
      thickness = DEFAULT_ELEMENT_DIMENSIONS.ARROW_THICKNESS,
      position,
      backgroundColor = DEFAULT_ELEMENT_COLORS.ARROW_COLOR,
      opacity = 1,
      rotation = 0
    } = options;

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - length) / 2,
      y: canvasSize.height / 2
    };

    return {
      kind: "arrow" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width: length,
      height: thickness,
      backgroundColor,
      opacity,
      rotation,
      isNew: true
    };
  }

  /**
   * Helper function to generate unique element ID
   */
  static generateId(): string {
    return nanoid();
  }

  /**
   * Creates a complete element with ID (ready to be added to canvas)
   */
  static createCompleteElement(elementData: Omit<Element, 'id'>): Element {
    return {
      ...elementData,
      id: ElementFactory.generateId()
    };
  }
}

/**
 * Convenience functions for common element creation patterns
 */
export const createCenteredTextElement = (canvasSize: CanvasSize, content?: string) => {
  return ElementFactory.createTextElement(canvasSize, { content });
};

export const createCenteredShapeElement = (canvasSize: CanvasSize, shapeType: "rect" | "circle" | "triangle") => {
  return ElementFactory.createShapeElement(canvasSize, shapeType);
};

export const createCenteredLineElement = (canvasSize: CanvasSize) => {
  return ElementFactory.createLineElement(canvasSize);
};

export const createCenteredImageElement = (canvasSize: CanvasSize, imageData: {
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
}) => {
  return ElementFactory.createImageElement(canvasSize, imageData);
};

// Additional convenience functions
export const createCenteredArrowElement = (canvasSize: CanvasSize) => {
  return ElementFactory.createArrowElement(canvasSize);
};

// Quick element creation functions with common defaults
export const createQuickTextElement = (canvasSize: CanvasSize, content: string = "Add your text here") => {
  return ElementFactory.createCompleteElement(
    ElementFactory.createTextElement(canvasSize, { content })
  );
};

export const createQuickShapeElement = (canvasSize: CanvasSize, shapeType: "rect" | "circle" | "triangle") => {
  return ElementFactory.createCompleteElement(
    ElementFactory.createShapeElement(canvasSize, shapeType)
  );
};

export const createQuickLineElement = (canvasSize: CanvasSize) => {
  return ElementFactory.createCompleteElement(
    ElementFactory.createLineElement(canvasSize)
  );
};

export const createQuickArrowElement = (canvasSize: CanvasSize) => {
  return ElementFactory.createCompleteElement(
    ElementFactory.createArrowElement(canvasSize)
  );
};

export const createQuickImageElement = (canvasSize: CanvasSize, imageData: {
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
}) => {
  return ElementFactory.createCompleteElement(
    ElementFactory.createImageElement(canvasSize, imageData)
  );
};
