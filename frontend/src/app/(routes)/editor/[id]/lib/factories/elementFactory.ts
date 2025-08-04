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
import { Element, CanvasSize, ImageElement, TextElement } from '../types/canvas';
import { DEFAULT_FONT_SIZE, DEFAULT_TEXT_ALIGN, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, DEFAULT_ELEMENT_DIMENSIONS, DEFAULT_ELEMENT_COLORS } from '../constants';
import { measureTextWidth, measureTextHeight } from '../utils/textMeasurement';
import type { Template } from '@/lib/types/api';
import { Rect } from '../types/common';



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
      rect?: Rect;
      letterSpacing?: number;
      lineHeight?: number;
      isBold?: boolean;
      isItalic?: boolean;
      isUnderline?: boolean;
      isStrikethrough?: boolean;
      color?: string;
      isEditable?: boolean;
      isLocked?: boolean;
    } = {}
  ): Omit<TextElement, 'id'> {
    const {
      content = "Add your text here",
      fontSize = DEFAULT_FONT_SIZE,
      fontFamily = "Inter",
      textAlign = DEFAULT_TEXT_ALIGN,
      rect,
      letterSpacing = DEFAULT_LETTER_SPACING,
      lineHeight = DEFAULT_LINE_HEIGHT,
      isBold = false,
      isItalic = false,
      isUnderline = false,
      isStrikethrough = false,
      color = DEFAULT_ELEMENT_COLORS.TEXT_COLOR,
      isEditable = false,
      isLocked = false
    } = options;

    // Calculate text dimensions dynamically based on content and styling
    const textWidth = measureTextWidth(content, {
      fontSize,
      fontFamily,
      isBold,
      isItalic,
      letterSpacing
    });

    // Add some padding to the width for better visual appearance
    const width = Math.max(textWidth, 100); // Minimum width of 100px

    // Calculate height based on the calculated width and line height
    const height = measureTextHeight(content, width, {
      fontSize,
      fontFamily,
      isBold,
      isItalic,
      lineHeight
    });

    // Calculate centered position if not provided
    const elementPosition = {
      x: rect?.x || (canvasSize.width - width) / 2,
      y: rect?.y || (canvasSize.height - height) / 2
    };

    return {
      type: "text" as const,
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
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      color,
      isNew: true,
      isEditable,
      isLocked,
    };
  }

  /**
   * Creates a new shape element
   */
  static createShapeElement(
    canvasSize: CanvasSize,
    shapeType: "rect" | "circle" | "triangle",
    options: {
      scale?: number;
      position?: ElementPosition;
      backgroundColor?: string;
      borderWidth?: number;
      borderColor?: string;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      scale = DEFAULT_ELEMENT_DIMENSIONS.SHAPE_SCALE,
      position,
      backgroundColor = DEFAULT_ELEMENT_COLORS.SHAPE_BACKGROUND,
      borderWidth = 0,
      borderColor = DEFAULT_ELEMENT_COLORS.SHAPE_BORDER,
      opacity = 1,
      rotation = 0
    } = options;

    const width = canvasSize.width * scale;
    const height = canvasSize.height * scale;

    // Calculate centered position if not provided
    const elementPosition = position || {
      x: (canvasSize.width - width) / 2,
      y: (canvasSize.height - height) / 2
    };

    return {
      kind: "shape" as const,
      x: elementPosition.x,
      y: elementPosition.y,
      width,
      height,
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
      rect?: Rect;
      backgroundColor?: string;
      opacity?: number;
      rotation?: number;
    } = {}
  ): Omit<Element, 'id'> {
    const {
      length = DEFAULT_ELEMENT_DIMENSIONS.LINE_LENGTH,
      thickness = DEFAULT_ELEMENT_DIMENSIONS.LINE_THICKNESS,
      rect,
      backgroundColor = DEFAULT_ELEMENT_COLORS.LINE_COLOR,
      opacity = 1,
      rotation = 0
    } = options;

    // Calculate centered position if not provided
    const elementPosition = {
      x: rect?.x || (canvasSize.width - length) / 2,
      y: rect?.y || (canvasSize.height - thickness) / 2
    };

    return {
      type: "line" as const,
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
      rect?: Rect;
    } = {}
  ): Omit<ImageElement, 'id'> {
    const {
      maxWidth = DEFAULT_ELEMENT_DIMENSIONS.IMAGE_MAX_WIDTH,
      maxHeight = DEFAULT_ELEMENT_DIMENSIONS.IMAGE_MAX_HEIGHT,
      rect,
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
    const elementPosition = {
      x: rect?.x || (canvasSize.width - finalWidth) / 2,
      y: rect?.y || (canvasSize.height - finalHeight) / 2
    };

    return {
      type: "image" as const,
      rect: {
        ...elementPosition,
        width: finalWidth,
        height: finalHeight
      },
      src,
      alt,
      isNew: true,
      isEditable: true,
      isLocked: false,
    };
  }

  /**
   * Helper function to generate unique element ID
   */
  static generateId(): string {
    return nanoid();
  }


  /**
   * Creates a new template with default values
   */
  static createNewTemplate(options: {
    title?: string;
    description?: string;
    type?: "presentation" | "social" | "print" | "custom";
    category?: string;
    author?: string;
    canvasWidth?: number;
    canvasHeight?: number;
  } = {}): Omit<Template, '_id' | 'createdAt' | 'updatedAt'> {
    const {
      title = "Untitled Template",
      description = "",
      type = "custom",
      category = "custom",
      author = "current-user",
      canvasWidth = 800,
      canvasHeight = 600
    } = options;

    return {
      title,
      description,
      type,
      category,
      author,
      featured: false,
      popular: false,
      canvasSize: {
        width: canvasWidth,
        height: canvasHeight
      },
      pages: [],
      tags: [],
      starred: false
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

/**
 * Template factory functions
 */
export const createDefaultTemplate = (options?: {
  title?: string;
  description?: string;
  type?: "presentation" | "social" | "print" | "custom";
  category?: string;
  author?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}) => {
  return ElementFactory.createNewTemplate(options);
};

/**
 * Predefined template factories for common use cases
 */
export const createSocialMediaTemplate = (platform: "instagram" | "facebook" | "twitter" = "instagram") => {
  const dimensions = {
    instagram: { width: 1080, height: 1080 },
    facebook: { width: 1200, height: 630 },
    twitter: { width: 1200, height: 675 }
  };

  return ElementFactory.createNewTemplate({
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Post`,
    type: "social",
    category: "social-media",
    canvasWidth: dimensions[platform].width,
    canvasHeight: dimensions[platform].height
  });
};

export const createPresentationTemplate = () => {
  return ElementFactory.createNewTemplate({
    title: "Presentation Slide",
    type: "presentation",
    category: "presentation",
    canvasWidth: 1920,
    canvasHeight: 1080
  });
};

export const createPrintTemplate = (format: "letter" | "a4" = "letter") => {
  const dimensions = {
    letter: { width: 816, height: 1056 }, // 8.5x11 inches at 96 DPI
    a4: { width: 794, height: 1123 } // A4 at 96 DPI
  };

  return ElementFactory.createNewTemplate({
    title: `${format.toUpperCase()} Document`,
    type: "print",
    category: "document",
    canvasWidth: dimensions[format].width,
    canvasHeight: dimensions[format].height
  });
};
