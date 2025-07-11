import { Element } from "../types/canvas";
import { Brand } from "@/lib/types/brands";

/**
 * Core color palette available in the app
 */
export const CORE_COLORS = [
  // Grayscale row
  "#000000", // Black
  "#525252", // Dark gray
  "#737373", // Medium gray
  "#a3a3a3", // Light gray
  "#d4d4d4", // Very light gray
  "#ffffff", // White
  
  // Red/Pink row
  "#dc2626", // Red
  "#ef4444", // Light red
  "#ec4899", // Pink
  "#c084fc", // Light purple
  "#8b5cf6", // Purple
  "#6366f1", // Indigo
  
  // Blue/Cyan row
  "#0891b2", // Teal
  "#06b6d4", // Cyan
  "#7dd3fc", // Light cyan
  "#3b82f6", // Blue
  "#6366f1", // Blue purple
  "#1e40af", // Dark blue
  
  // Green/Yellow row
  "#16a34a", // Green
  "#84cc16", // Lime
  "#bef264", // Light lime
  "#fbbf24", // Yellow
  "#f59e0b", // Orange
  "#f97316", // Dark orange
];

/**
 * Extract unique colors used in the document
 */
export function extractDocumentColors(elements: Element[]): string[] {
  const colors = new Set<string>();
  
  elements.forEach(element => {
    // Extract colors from different element types
    if (element.backgroundColor) {
      colors.add(element.backgroundColor);
    }
    if (element.color) {
      colors.add(element.color);
    }
    if (element.borderColor) {
      colors.add(element.borderColor);
    }
    // Add more color properties as needed
  });
  
  // Filter out only transparent colors but keep black and white
  return Array.from(colors).filter(color => 
    color !== "transparent" && color !== ""
  );
}

/**
 * Extract brand colors from brand data
 */
export function extractBrandColors(brand: Brand | null): string[] {
  if (!brand) return [];
  
  const colors = new Set<string>();
  
  // Extract colors from brand color palettes
  if (brand.colorPalettes) {
    brand.colorPalettes.forEach(palette => {
      palette.colors.forEach(color => {
        colors.add(color);
      });
    });
  }
  
  return Array.from(colors);
}

/**
 * Check if a color is a light color (for determining text color)
 */
export function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Format color sections for the sidebar
 */
export interface ColorSection {
  id: string;
  title: string;
  colors: string[];
}

export function formatColorSections(
  documentColors: string[],
  brandColors: string[]
): ColorSection[] {
  const sections: ColorSection[] = [];
  
  // Core colors section (always present)
  sections.push({
    id: "core-colors",
    title: "Core Colors",
    colors: CORE_COLORS
  });
  
  // Document colors section (only if there are colors not already in core colors)
  const uniqueDocumentColors = documentColors.filter(color => 
    !CORE_COLORS.includes(color)
  );
  
  if (uniqueDocumentColors.length > 0) {
    sections.push({
      id: "document-colors", 
      title: "Document Colors",
      colors: uniqueDocumentColors.slice(0, 12) // Limit to 12 colors
    });
  }
  
  // Brand colors section (only if there are colors not already in core colors)
  const uniqueBrandColors = brandColors.filter(color => 
    !CORE_COLORS.includes(color)
  );
  
  if (uniqueBrandColors.length > 0) {
    sections.push({
      id: "brand-colors",
      title: "Brand Colors", 
      colors: uniqueBrandColors.slice(0, 12) // Limit to 12 colors
    });
  }
  
  return sections;
}
