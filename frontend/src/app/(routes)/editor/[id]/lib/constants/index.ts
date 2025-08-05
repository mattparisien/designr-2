/**
 * Editor constants for navigation
 */

import { CanvasSize } from "../types/canvas";

export * from "./navigation";

/**
 * Editor constants for canvas and elements
 */

// Canvas zoom limits
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 200;

// Resizable element constants
export const SNAP_THRESHOLD = 10; // Threshold for alignment snapping in pixels

// Resize handle dimensions - simple base size that will be divided by scale
export const HANDLE_BASE_SIZE = 18;
// The min/max size constraints are no longer needed as we're using direct scaling
// export const HANDLE_MIN_SIZE = 12;
// export const HANDLE_MAX_SIZE = 24;

// Font sizes
export const DEFAULT_FONT_SIZE = 80;
export const MIN_FONT_SIZE = 1;
export const MAX_FONT_SIZE = 800;

// Font families
export const DEFAULT_FONT_FAMILY = "Inter";

// Font weights
export const DEFAULT_FONT_WEIGHT = "normal";

// Font styles
export const DEFAULT_FONT_STYLE = "normal";

// Letter spacing (in em units)
export const DEFAULT_LETTER_SPACING = 0;
export const MIN_LETTER_SPACING = -0.1;
export const MAX_LETTER_SPACING = 1;

// Line height (relative to font size)
export const DEFAULT_LINE_HEIGHT = 1.2;
export const MIN_LINE_HEIGHT = 0.8;
export const MAX_LINE_HEIGHT = 3;

// Font lists
export const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

// Canvas constants
export const DEFAULT_CANVAS_SIZE : CanvasSize = {
  width: 720,
  height: 720
};

export const DEFAULT_ELEMENT_DIMENSIONS = {
  // Text element defaults
  TEXT_WIDTH: 400,
  TEXT_HEIGHT: 100,

  // Shape element defaults
  SHAPE_SCALE: 0.55,

  // Line element defaults
  LINE_LENGTH: 150,
  LINE_THICKNESS: 2,

  // Arrow element defaults
  ARROW_LENGTH: 150,
  ARROW_THICKNESS: 2,

  // Image element defaults
  IMAGE_MAX_WIDTH: 400,
  IMAGE_MAX_HEIGHT: 400,
  IMAGE_DEFAULT_WIDTH: 200,
  IMAGE_DEFAULT_HEIGHT: 150,

  // Small image variant (for assets added from sidebar)
  IMAGE_SIDEBAR_MAX_WIDTH: 300,
} as const;


// Text alignment options
export type TextAlignment = "left" | "center" | "right";
export const DEFAULT_TEXT_ALIGN: TextAlignment = "center";

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