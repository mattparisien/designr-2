import { useRef, useCallback } from "react";
import { Element as CanvasElement } from "../types/canvas";

/**
 * Hook to handle text measurement and auto-height adjustment
 * 
 * Provides functionality to measure text height based on width and styling
 * for auto-height adjustment of text elements
 */
export function useTextMeasurement() {
  // Hidden measurer div ref
  const measurerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Measures the width of text content with given styles
   */
  const measureTextWidth = useCallback((
    content: string,
    styles: {
      fontSize?: number;
      fontFamily?: string;
      isBold?: boolean;
      isItalic?: boolean;
      letterSpacing?: number;
    }
  ): number => {
    if (!measurerRef.current) return 0;

    const {
      fontSize = 36,
      fontFamily = 'Inter',
      isBold = false,
      isItalic = false,
      letterSpacing = 0
    } = styles;

    // Configure the measurer with all the styles
    measurerRef.current.style.width = 'auto';
    measurerRef.current.style.height = 'auto';
    measurerRef.current.style.whiteSpace = 'nowrap'; // Prevent line breaks for width measurement
    measurerRef.current.style.fontSize = `${fontSize}px`;
    measurerRef.current.style.fontFamily = fontFamily;
    measurerRef.current.style.fontWeight = isBold ? 'bold' : 'normal';
    measurerRef.current.style.fontStyle = isItalic ? 'italic' : 'normal';
    measurerRef.current.style.letterSpacing = `${letterSpacing}em`;
    measurerRef.current.style.padding = '0';
    measurerRef.current.style.margin = '0';
    measurerRef.current.style.border = 'none';

    // Set content and measure
    measurerRef.current.innerText = content;

    // Return the exact measured width
    return measurerRef.current.scrollWidth;
  }, []);

  /**
   * Measures the height of text content with given styles
   */
  const measureTextHeight = useCallback((
    content: string,
    width: number,
    styles: {
      fontSize?: number;
      fontFamily?: string;
      isBold?: boolean;
      isItalic?: boolean;
      isUnderlined?: boolean;
      isStrikethrough?: boolean;
      textAlign?: string;
      lineHeight?: number;
    }
  ): number => {
    if (!measurerRef.current) return 0;

    const {
      fontSize = 36,
      fontFamily = 'Inter',
      isBold = false,
      isItalic = false,
      isUnderlined = false,
      isStrikethrough = false,
      textAlign = 'center',
      lineHeight = 1.2
    } = styles;

    // Configure the measurer with all the styles
    measurerRef.current.style.width = width + 'px';
    measurerRef.current.style.fontSize = `${fontSize}px`;
    measurerRef.current.style.fontFamily = fontFamily;
    measurerRef.current.style.fontWeight = isBold ? 'bold' : 'normal';
    measurerRef.current.style.fontStyle = isItalic ? 'italic' : 'normal';
    measurerRef.current.style.textDecoration =
      `${isUnderlined ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`.trim() || 'none';
    measurerRef.current.style.textAlign = textAlign;
    measurerRef.current.style.lineHeight = lineHeight.toString(); // Use dynamic line height
    measurerRef.current.style.padding = '0'; // No padding to get exact text height
    measurerRef.current.style.margin = '0'; // No margin
    measurerRef.current.style.border = 'none'; // No border

    // Set content and measure
    measurerRef.current.innerText = content;

    // Return the exact measured height without extra padding
    return measurerRef.current.scrollHeight;
  }, []);



  /**
   * Measures height for a specific canvas element
   */
  const measureElementHeight = useCallback((element: CanvasElement): number => {
    if (element.type !== 'text' || !element.content) return element.rect.height;

    return measureTextHeight(
      element.content,
      element.rect.width,
      {
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        isBold: element.isBold,
        isItalic: element.isItalic,
        isUnderlined: element.isUnderline,
        isStrikethrough: element.isStrikethrough,
        textAlign: element.textAlign,
        lineHeight: element.lineHeight
      }
    );
  }, [measureTextHeight]);

  /**
   * Render the hidden measurer component
   */
  const renderMeasurer = useCallback(() => {
    return <div
      ref={measurerRef}
      style={{
        position: 'absolute',
        visibility: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
        whiteSpace: 'normal',
        lineHeight: 'normal', // Let it be set dynamically by measureTextHeight
        wordBreak: 'break-word',
        overflow: 'auto',
        padding: '0', // No padding to match measurement
        margin: '0', // No margin
        border: 'none', // No border
        boxSizing: 'border-box',
        minHeight: '1em',
        left: 0,
        top: 0,
      }
      }
    />
  }, []);

  return {
    measurerRef,
    measureTextHeight,
    measureTextWidth,
    measureElementHeight,
    renderMeasurer
  };
}