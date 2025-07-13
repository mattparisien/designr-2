/**
 * Text measurement utilities for calculating text dimensions
 */

/**
 * Measures the width of text content with given styles
 */
export function measureTextWidth(
  content: string,
  styles: {
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    letterSpacing?: number;
  }
): number {
  const {
    fontSize = 36,
    fontFamily = 'Inter',
    isBold = false,
    isItalic = false,
    letterSpacing = 0
  } = styles;

  // Create a temporary canvas element for measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return 0;

  // Set font properties
  let fontStyle = '';
  if (isItalic) fontStyle += 'italic ';
  if (isBold) fontStyle += 'bold ';
  fontStyle += `${fontSize}px ${fontFamily}`;
  
  context.font = fontStyle;
  
  // Measure the text
  const metrics = context.measureText(content);
  
  // Apply letter spacing if specified
  let width = metrics.width;
  if (letterSpacing > 0) {
    width += (content.length - 1) * letterSpacing * fontSize;
  }
  
  return Math.ceil(width);
}

/**
 * Measures the height of text content with given styles
 */
export function measureTextHeight(
  content: string,
  width: number,
  styles: {
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    lineHeight?: number;
  }
): number {
  const {
    fontSize = 36,
    fontFamily = 'Inter',
    isBold = false,
    isItalic = false,
    lineHeight = 1.2
  } = styles;

  // Create a temporary div element for measurement
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.width = `${width}px`;
  div.style.fontSize = `${fontSize}px`;
  div.style.fontFamily = fontFamily;
  div.style.fontWeight = isBold ? 'bold' : 'normal';
  div.style.fontStyle = isItalic ? 'italic' : 'normal';
  div.style.lineHeight = lineHeight.toString();
  div.style.padding = '0';
  div.style.margin = '0';
  div.style.border = 'none';
  div.style.wordBreak = 'break-word';
  div.style.whiteSpace = 'normal';
  
  div.textContent = content;
  
  // Append to body to get measurements
  document.body.appendChild(div);
  const height = div.scrollHeight;
  document.body.removeChild(div);
  
  return height;
}
