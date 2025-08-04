// Import base size from shared types
import { Size, DesignElement, DesignPage, DesignCanvas, DesignElementType } from "@shared/types";
import { Rect } from "./common";

// Frontend-specific Page type
export type CanvasSize = Size;
export type Element = DesignElement & {
  rect: Rect;
  isNew: boolean;
}
export type Canvas = Omit<DesignCanvas, "elements"> & {
  elements: Element[];
}

export type Page = Omit<DesignPage, "canvas"> & {
  canvas: Canvas;
};

// Define the types of actions that can be performed
export type HistoryAction =
  | { type: "ADD_ELEMENT"; element: Element; pageId: string }
  | { type: "UPDATE_ELEMENT"; id: string; before: Partial<Element>; after: Partial<Element>; pageId: string }
  | { type: "DELETE_ELEMENT"; element: Element; pageId: string }
  | { type: "CHANGE_CANVAS_SIZE"; before: CanvasSize; after: CanvasSize; pageId: string }
  | { type: "ADD_PAGE"; page: Page }
  | { type: "DELETE_PAGE"; page: Page }
  | { type: "REORDER_PAGES"; before: string[]; after: string[] }
  | { type: "REORDER_ELEMENT"; pageId: string; elementId: string; fromIndex: number; toIndex: number }; // Added for element reordering

// Editor context handles document-level state and page management
export interface EditorContextType {
  // Document metadata
  designName: string
  isDesignSaved: boolean
  isSaving: boolean
  renameDesign: (name: string) => void
  saveDesign: () => void

  // Editor mode
  isEditMode: boolean
  toggleEditMode: () => void

  // Page management
  pages: Page[]
  currentPageId: string | null
  currentPage: Page | null
  currentPageIndex: number
  addPage: () => void
  deletePage: (id: string) => void
  goToPage: (id: string) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  duplicateCurrentPage: () => void

  // Page content updates (called by CanvasContext)
  updatePageElements: (pageId: string, elements: Partial<Omit<Element, "id" | "type">[]>) => void
  updatePageCanvasSize: (pageId: string, canvasSize: CanvasSize) => void
  updatePageBackground: (pageId: string, background: { type: 'color' | 'image' | 'gradient', value?: string }) => void
}

// Canvas context handles the canvas-specific operations for the current page
export interface CanvasContextType {
  // Canvas elements and properties
  elements: Element[] // Elements of the current page
  selectedElement: Omit<Element, "type"> | null
  selectedElementIds: string[]
  isCanvasSelected: boolean
  isLoaded: boolean // Canvas loading state
  elementActionBar: {
    isActive: boolean,
    position: {
      x: number
      y: number
    },
    elementId: string | null
  }


  // Element manipulation
  addElement: (element: Omit<Element, "id" | "type">, type: DesignElementType) => void
  updateElement: (id: string, updates: Partial<Omit<Element, "id" | "type">>) => void
  updateMultipleElements: (updates: Partial<Omit<Element, "id" | "type">> | ((element: Partial<Omit<Element, "id" | "type">>) => Partial<Element>)) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string | null, addToSelection?: boolean) => void
  deselectElement: (id: string) => void
  selectMultipleElements: (ids: string[]) => void
  selectCanvas: (select: boolean) => void
  clearSelection: () => void
  changeCanvasSize: (size: CanvasSize) => void
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: Element, scaleFactor: number) => Element
  fitCanvasToView: (container: HTMLDivElement, canvas: HTMLDivElement) => number
  toggleCanvasSelection: () => void

  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void

  // Utility
  isElementSelected: (id: string) => boolean,

  // Text styling
  handleTextColorChange: (color: string) => void

  // Shape styling
  handleBackgroundColorChange: (color: string) => void

  // Canvas styling
  handleCanvasBackgroundColorChange: (color: string) => void

}