import { CanvasElement, CanvasSize, CanvasPage } from "./canvas";

// Define the types of actions that can be performed
export type HistoryAction =
  | { type: "ADD_ELEMENT"; element: CanvasElement; pageId: string }
  | { type: "UPDATE_ELEMENT"; id: string; before: Partial<CanvasElement>; after: Partial<CanvasElement>; pageId: string }
  | { type: "DELETE_ELEMENT"; element: CanvasElement; pageId: string }
  | { type: "CHANGE_CANVAS_SIZE"; before: CanvasSize; after: CanvasSize; pageId: string }
  | { type: "ADD_PAGE"; page: CanvasPage }
  | { type: "DELETE_PAGE"; page: CanvasPage }
  | { type: "REORDER_PAGES"; before: string[]; after: string[] }
  | { type: "REORDER_ELEMENT"; pageId: string; elementId: string; fromIndex: number; toIndex: number }; // Added for element reordering

// Editor context handles document-level state and page management
export interface EditorContextType {
  // Document metadata
  designName: string
  isDesignSaved: boolean
  isSaving: boolean
  renameDesign: (name: string) => void

  // Editor mode
  isEditMode: boolean
  toggleEditMode: () => void

  // Page management
  pages: CanvasPage[]
  currentPageId: string | null
  currentPage: CanvasPage | null
  currentPageIndex: number
  addPage: () => void
  deletePage: (id: string) => void
  goToPage: (id: string) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  duplicateCurrentPage: () => void

  // Page content updates (called by CanvasContext)
  updatePageElements: (pageId: string, elements: CanvasElement[]) => void
  updatePageCanvasSize: (pageId: string, canvasSize: CanvasSize) => void
  updatePageBackground: (pageId: string, background: { type: 'color' | 'image' | 'gradient', value?: string }) => void
}

// Canvas context handles the canvas-specific operations for the current page
export interface CanvasContextType {
  // Canvas elements and properties
  elements: CanvasElement[] // Elements of the current page
  selectedElement: CanvasElement | null
  selectedElementIds: string[]
  isCanvasSelected: boolean
  canvasSize: CanvasSize
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
  addElement: (element: Omit<CanvasElement, "id">) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  updateMultipleElements: (updates: Partial<CanvasElement> | ((element: CanvasElement) => Partial<CanvasElement>)) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string | null, addToSelection?: boolean) => void
  deselectElement: (id: string) => void
  selectMultipleElements: (ids: string[]) => void
  selectCanvas: (select: boolean) => void
  clearSelection: () => void
  changeCanvasSize: (size: CanvasSize) => void
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: CanvasElement, scaleFactor: number) => CanvasElement
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