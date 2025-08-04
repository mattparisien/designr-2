import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { DEFAULT_CANVAS_SIZE } from '../constants';
import { CanvasContextType, Element, HistoryAction, CanvasSize } from '../types/canvas';
import { reorderByIndex } from '../utils/canvas';
import useEditorStore from './useEditorStore';

export interface CanvasState extends CanvasContextType {
  historyIndex: number;
  history: HistoryAction[];
  duplicateElement: (id: string) => void;
  elementActionBar: {
    isActive: boolean;
    position: { x: number; y: number };
    elementId: string | null;
  };
  // Alignment guides state
  alignmentGuides: {
    horizontal: number[];
    vertical: number[];
  };
  isDragging: boolean;
  activeDragElement: string | null;
  setAlignmentGuides: (alignments: { horizontal: number[], vertical: number[] }) => void;
  setDragState: (isDragging: boolean, elementId?: string | null) => void;
  clearAlignmentGuides: () => void;
  showElementActionBar: (elementId: string, position: { x: number; y: number }) => void;
  hideElementActionBar: () => void;
  setElementActionBarPosition: (position: { x: number; y: number }) => void;
  bringElementForward: (elementId: string) => void;
  sendElementBackward: (elementId: string) => void;
  bringElementToFront: (elementId: string) => void;
  sendElementToBack: (elementId: string) => void;
  // Resize state
  isResizing: boolean;
  activeResizeElement: string | null;
  lastResizeTime: number;
  setResizeState: (isResizing: boolean, elementId?: string | null) => void;
  // Manual resize tracking - maps element IDs to whether they've been manually resized
  manuallyResizedElements: Record<string, boolean>;
  setElementManuallyResized: (elementId: string, isManuallyResized: boolean) => void;
  isElementManuallyResized: (elementId: string) => boolean;
  clearManuallyResizedFlag: (elementId: string) => void;
  // Helper function to check if element is selected
  isElementSelected: (elementId: string) => boolean;
}

// Create the canvas store
const useCanvasStore = create<CanvasState>((set, get) => {
  const getCurrentPage = () => {
    const { currentPageId, pages } = useEditorStore.getState();
    if (!currentPageId) return null;
    return pages.find(page => page.id === currentPageId) || null;
  };

  return {
    // Elements selection state
    elements: [],
    selectedElement: null,
    selectedElementIds: [],
    isCanvasSelected: false,
    isLoaded: true,
    historyIndex: -1,
    history: [],
    canUndo: false,
    canRedo: false,
    elementActionBar: {
      isActive: false,
      position: { x: 0, y: 0 },
      elementId: null,
    },
    // Alignment guides state
    alignmentGuides: {
      horizontal: [],
      vertical: [],
    },
    isDragging: false,
    activeDragElement: null,
    isResizing: false,
    activeResizeElement: null,
    lastResizeTime: 0,
    // Manual resize tracking
    manuallyResizedElements: {},

    // Alignment guides methods
    setAlignmentGuides: (alignments) => {
      set({ alignmentGuides: alignments });
    },

    setDragState: (isDragging, elementId = null) => {
      set({
        isDragging,
        activeDragElement: elementId,
        // Clear alignment guides when drag ends
        alignmentGuides: isDragging ? get().alignmentGuides : { horizontal: [], vertical: [] }
      });
    },

    setResizeState: (isResizing, elementId = null) => {
      set({
        isResizing,
        activeResizeElement: elementId,
        lastResizeTime: isResizing ? Date.now() : get().lastResizeTime,
      });
    },

    clearAlignmentGuides: () => {
      set({ alignmentGuides: { horizontal: [], vertical: [] } });
    },

    // Add new element to the canvas
    addElement: (elementData, type) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Create a helper to extract properties from elementData
      // The elementData might come from ElementFactory (with 'kind' and flat properties)
      // or from other sources, so we need to handle both structures
      type LegacyElementData = {
        kind?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        rect?: { x: number; y: number; width: number; height: number };
        content?: string;
        fontSize?: number;
        fontFamily?: string;
        textAlign?: "left" | "center" | "right";
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        color?: string;
        form?: "rectangle" | "circle" | "line";
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        src?: string;
        alt?: string;
        placeholder?: string;
        isNew?: boolean;
        isEditable?: boolean;
        opacity?: number;
        rotation?: number;
        letterSpacing?: number;
        lineHeight?: number;
        isStrikethrough?: boolean;
        isLocked?: boolean; // New property for locked state
        isBold?: boolean; // For text elements
        isItalic?: boolean; // For text elements
        isUnderline?: boolean; // For text elements
      };

      const data = elementData as LegacyElementData;

      // Generate a unique ID for the new element
      let newElement: Element;
      

      if (type === 'text') {
        newElement = {
          id: nanoid(),
          type: 'text',
          placeholder: data.placeholder,
          content: data.content || 'Add your text here',
          fontSize: data.fontSize,
          fontFamily: data.fontFamily,
          textAlign: data.textAlign,
          isBold: data.isBold || false,
          isItalic: data.isItalic || false,
          isUnderline: data.isUnderline || false,
          color: data.color,
          rect: data.rect || {
            x: data.x || 0,
            y: data.y || 0,
            width: data.width || 100,
            height: data.height || 50,
          },
          isNew: data.isNew || true,
          isLocked: data.isLocked || false,
          isEditable: data.isEditable || true
        };
      } else if (type === 'shape') {
        newElement = {
          id: nanoid(),
          type: 'shape',
          placeholder: data.placeholder,
          rect: data.rect || {
            x: data.x || 0,
            y: data.y || 0,
            width: data.width || 100,
            height: data.height || 50
          },

          form: data.form || 'rectangle',
          backgroundColor: data.backgroundColor,
          borderColor: data.borderColor,
          borderWidth: data.borderWidth,
          isNew: true,
          isLocked: data.isLocked || false,
          isEditable: data.isEditable || true
        };
      } else if (type === 'image') {
        newElement = {
          id: nanoid(),
          type: 'image',
          placeholder: data.placeholder,
          rect: data.rect || {
            x: data.x || 0,
            y: data.y || 0,
            width: data.width || 100,
            height: data.height || 50
          },
          src: data.src || '',
          alt: data.alt,
          isNew: data.isNew || true,
          isLocked: data.isLocked || false,
          isEditable: data.isEditable || true,
        };
      } else {
        // Default to text if unknown type
        newElement = {
          id: nanoid(),
          type: 'text',
          placeholder: data.placeholder,
          rect: data.rect || {
            x: data.x || 0,
            y: data.y || 0,
            width: data.width || 100,
            height: data.height || 50
          },
          content: data.content || 'Add your text here',
          isNew: true,
          isLocked: data.isLocked || false,
          isEditable: data.isEditable || true
        };
      }

      // Add element to current page
      const updatedElements = [...currentPage.canvas.elements, newElement];

      // Update page elements in the editor store
      editor.updatePageElements(currentPageId, updatedElements);

      // Add to history
      const historyAction: HistoryAction = {
        type: 'ADD_ELEMENT',
        element: newElement,
        pageId: currentPageId
      };

      // Update history in canvas store
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyAction);

        return {
          selectedElement: newElement,
          selectedElementIds: [newElement.id],
          isCanvasSelected: false,
          historyIndex: state.historyIndex + 1,
          history: newHistory,
          canUndo: true,
          canRedo: false
        };
      });
    },

    // Update an existing element
    updateElement: (id, updates) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Find the element to update
      const elementToUpdate = currentPage.canvas.elements.find(el => el.id === id);

      if (!elementToUpdate) return;

      // Store the previous state for history
      const before = { ...elementToUpdate };

      // Create updated elements array
      const updatedElements = currentPage.canvas.elements.map(element =>
        element.id === id ? { ...element, ...updates } as Element : element
      );

      // Update the page elements
      editor.updatePageElements(currentPageId, updatedElements);

      // Add to history
      const historyAction: HistoryAction = {
        type: 'UPDATE_ELEMENT',
        id,
        before,
        after: updates,
        pageId: currentPageId
      };

      // Update history in canvas store
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyAction);

        // Update selected element if it's the one being updated
        const updatedSelectedElement = state.selectedElement?.id === id
          ? { ...state.selectedElement, ...updates } as Element
          : state.selectedElement;

        return {
          selectedElement: updatedSelectedElement,
          historyIndex: state.historyIndex + 1,
          history: newHistory,
          canUndo: true,
          canRedo: false
        };
      });
    },

    // Update multiple elements at once
    updateMultipleElements: (updates) => {
      const editor = useEditorStore.getState();
      const state = get();
      const currentPageId = editor.currentPageId;
      const selectedIds = state.selectedElementIds;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage || selectedIds.length === 0) return;

      // Store previous states for history
      const updatedElements = currentPage.canvas.elements.map(element => {
        if (selectedIds.includes(element.id)) {
          const updatedProps = typeof updates === 'function'
            ? updates(element)
            : updates;

          return { ...element, ...updatedProps };
        }
        return element;
      });

      // Update the page elements
      editor.updatePageElements(currentPageId, updatedElements);

      // We're not tracking individual history for bulk updates
      // But we could add a more complex history action if needed

      // Update selected element if it's in the selection
      set(state => {
        if (state.selectedElement && selectedIds.includes(state.selectedElement.id)) {
          const updatedProps = typeof updates === 'function'
            ? updates(state.selectedElement)
            : updates;

          return {
            selectedElement: { ...state.selectedElement, ...updatedProps }
          };
        }
        return {};
      });
    },

    // Delete an element
    deleteElement: (id) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Find the element to delete for history
      const elementToDelete = currentPage.canvas.elements.find(el => el.id === id);

      if (!elementToDelete) return;

      // Filter out the element to delete
      const updatedElements = currentPage.canvas.elements.filter(element => element.id !== id);

      // Update the page elements
      editor.updatePageElements(currentPageId, updatedElements);

      // Add to history
      const historyAction: HistoryAction = {
        type: 'DELETE_ELEMENT',
        element: elementToDelete,
        pageId: currentPageId
      };

      // Update history and selection in canvas store
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyAction);

        // Clear selection if the deleted element was selected
        const newSelectedElement = state.selectedElement?.id === id ? null : state.selectedElement;
        const newSelectedElementIds = state.selectedElementIds.filter(elementId => elementId !== id);

        return {
          selectedElement: newSelectedElement,
          selectedElementIds: newSelectedElementIds,
          isCanvasSelected: newSelectedElementIds.length === 0,
          historyIndex: state.historyIndex + 1,
          history: newHistory,
          canUndo: true,
          canRedo: false
        };
      });
    },

    // Delete all selected elements
    deleteSelectedElements: () => {
      const state = get();
      const selectedIds = state.selectedElementIds;

      if (selectedIds.length === 0) return;

      // Delete each selected element
      selectedIds.forEach(id => {
        get().deleteElement(id);
      });

      // Clear selection
      set({
        selectedElement: null,
        selectedElementIds: [],
        isCanvasSelected: true
      });
    },

    // Select a specific element
    selectElement: (id, addToSelection = false) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage || !id) {
        // If id is null, clear selection
        set({
          selectedElement: null,
          selectedElementIds: [],
          isCanvasSelected: true
        });
        return;
      }

      const elementToSelect = currentPage.canvas.elements.find(el => el.id === id);

      if (!elementToSelect) return;

      set(state => {
        // Determine the new selected IDs based on addToSelection flag
        let newSelectedIds: string[];

        if (addToSelection) {
          // Toggle selection: if already selected, remove it; otherwise add it
          if (state.selectedElementIds.includes(id)) {
            newSelectedIds = state.selectedElementIds.filter(elId => elId !== id);
          } else {
            newSelectedIds = [...state.selectedElementIds, id];
          }
        } else {
          // Replace selection with just this element
          newSelectedIds = [id];
        }

        // If multiple elements are selected, don't set a single selectedElement
        const newSelectedElement = newSelectedIds.length === 1
          ? elementToSelect
          : null;

        return {
          selectedElement: newSelectedElement,
          selectedElementIds: newSelectedIds,
          isCanvasSelected: false
        };
      });
    },

    deselectElement: (id: string) => {
      const state = get();
      const selectedIds = state.selectedElementIds;

      if (!selectedIds.includes(id)) return;

      // Remove the element from selection
      const newSelectedIds = selectedIds.filter(elId => elId !== id);


      set({
        selectedElementIds: newSelectedIds,
      });
    },

    // Select multiple elements at once
    selectMultipleElements: (ids) => {
      if (ids.length === 0) {
        set({
          selectedElement: null,
          selectedElementIds: [],
          isCanvasSelected: true
        });
        return;
      }

      set({
        selectedElement: null, // No single element focus when multiple are selected
        selectedElementIds: ids,
        isCanvasSelected: false
      });
    },

    // Select or deselect the canvas
    selectCanvas: (select) => {
      if (select) {
        set({
          selectedElement: null,
          selectedElementIds: [],
          isCanvasSelected: true
        });
      } else {
        set({
          isCanvasSelected: false
        });
      }
    },

    // Clear all selections
    clearSelection: () => {
      set({
        selectedElement: null,
        selectedElementIds: [],
        isCanvasSelected: true
      });
    },

    // Change the canvas size
    changeCanvasSize: (size) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Store the previous size for history
      const before: CanvasSize = currentPage.canvas
        ? { width: currentPage.canvas.width, height: currentPage.canvas.height }
        : ({
          width: DEFAULT_CANVAS_SIZE.width,
          height: DEFAULT_CANVAS_SIZE.height
        });

      // Update the page canvas size
      editor.updatePageCanvasSize(currentPageId, size);

      // Add to history
      const historyAction: HistoryAction = {
        type: 'CHANGE_CANVAS_SIZE',
        before,
        after: size,
        pageId: currentPageId
      };

      // Update history in canvas store
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyAction);

        return {
          historyIndex: state.historyIndex + 1,
          history: newHistory,
          canUndo: true,
          canRedo: false
        };
      });
    },

    // Clear the "isNew" flag after an element is placed
    clearNewElementFlag: (id) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Find the element
      const element = currentPage.canvas.elements.find(el => el.id === id);

      if (!element || !element.isNew) return;

      // Update the element to remove the isNew flag
      get().updateElement(id, { isNew: false });
    },

    // Helper to scale an element's position and size
    scaleElement: (element, scaleFactor) => {

      const sharedProperties = {
        ...element,
        rect: {
          x: element.rect.x * scaleFactor,
          y: element.rect.y * scaleFactor,
          width: element.rect.width * scaleFactor,
          height: element.rect.height * scaleFactor
        }
      }

      if (element.type == "text" && element.fontSize) {
        const textProperties = {
          ...sharedProperties,
          fontSize: element.fontSize * scaleFactor,
        }

        return textProperties;

      } else if (element.type == "image") {
        // For images, we just scale the rect
        return sharedProperties;
      }

      return sharedProperties;
    },

    // Undo the last action
    undo: () => {
      const state = get();

      if (!state.canUndo || state.historyIndex < 0) return;

      const action = state.history[state.historyIndex];
      const editor = useEditorStore.getState();

      // Apply the reverse of the action
      switch (action.type) {
        case 'ADD_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Remove the added element
          const updatedElements = currentPage.canvas.elements.filter(el => el.id !== action.element.id);

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);

          // Update selection if needed
          if (state.selectedElement?.id === action.element.id) {
            set({
              selectedElement: null,
              selectedElementIds: state.selectedElementIds.filter(id => id !== action.element.id),
              isCanvasSelected: true
            });
          }
          break;
        }

        case 'UPDATE_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Find the element to revert
          const elementToUpdate = currentPage.canvas.elements.find(el => el.id === action.id);

          if (!elementToUpdate) break;

          // Create updated elements array with reverted element
          const updatedElements = currentPage.canvas.elements.map(element =>
            element.id === action.id ? { ...element, ...action.before } as Element : element
          );

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);

          // Update selected element if it's the one being reverted
          if (state.selectedElement?.id === action.id) {
            set({
              selectedElement: { ...state.selectedElement, ...action.before } as Element
            });
          }
          break;
        }

        case 'DELETE_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Add the deleted element back
          const updatedElements = [...currentPage.canvas.elements, action.element];

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);
          break;
        }

        case 'CHANGE_CANVAS_SIZE': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Revert to previous canvas size
          editor.updatePageCanvasSize(action.pageId, action.before);
          break;
        }

        case 'REORDER_ELEMENT': {
          const currentPage = editor.pages.find(page => page.id === action.pageId);
          if (!currentPage) break;

          const reordered = reorderByIndex(currentPage.canvas.elements, action.toIndex, action.fromIndex);
          editor.updatePageElements(action.pageId, reordered);
          break;
        }

        // Handle other action types as needed
      }

      // Update history state
      set({
        historyIndex: state.historyIndex - 1,
        canUndo: state.historyIndex > 0,
        canRedo: true
      });
    },

    // Redo the previously undone action
    redo: () => {
      const state = get();

      if (!state.canRedo || state.historyIndex >= state.history.length - 1) return;

      const action = state.history[state.historyIndex + 1];
      const editor = useEditorStore.getState();

      // Apply the action again
      switch (action.type) {
        case 'ADD_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Add the element back
          const updatedElements = [...currentPage.canvas.elements, action.element];

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);
          break;
        }

        case 'UPDATE_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Find the element to update
          const elementToUpdate = currentPage.canvas.elements.find(el => el.id === action.id);

          if (!elementToUpdate) break;

          // Create updated elements array
          const updatedElements = currentPage.canvas.elements.map(element =>
            element.id === action.id ? { ...element, ...action.after } as Element : element
          );

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);

          // Update selected element if it's the one being updated
          if (state.selectedElement?.id === action.id) {
            set({
              selectedElement: { ...state.selectedElement, ...action.after } as Element
            });
          }
          break;
        }

        case 'DELETE_ELEMENT': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Remove the element
          const updatedElements = currentPage.canvas.elements.filter(el => el.id !== action.element.id);

          // Update the page
          editor.updatePageElements(action.pageId, updatedElements);

          // Update selection if needed
          if (state.selectedElement?.id === action.element.id) {
            set({
              selectedElement: null,
              selectedElementIds: state.selectedElementIds.filter(id => id !== action.element.id),
              isCanvasSelected: true
            });
          }
          break;
        }

        case 'CHANGE_CANVAS_SIZE': {
          // Get the current page
          const currentPage = editor.pages.find(page => page.id === action.pageId);

          if (!currentPage) break;

          // Apply the canvas size change
          editor.updatePageCanvasSize(action.pageId, action.after);
          break;
        }

        case 'REORDER_ELEMENT': {
          const currentPage = editor.pages.find(page => page.id === action.pageId);
          if (!currentPage) break;

          const reordered = reorderByIndex(currentPage.canvas.elements, action.fromIndex, action.toIndex);
          editor.updatePageElements(action.pageId, reordered);
          break;
        }

        // Handle other action types as needed
      }

      // Update history state
      set({
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: state.historyIndex + 1 < state.history.length - 1
      });
    },

    // Helper function to check if an element is selected
    isElementSelected: (elementId: string) => {
      const state = get();
      return state.selectedElementIds.includes(elementId);
    },

    // Helper to calculate zoom to fit canvas in view
    fitCanvasToView: (container: HTMLElement, canvas: HTMLElement): number => {
      if (!container || !canvas) return 1;

      // Force layout update if needed
      const containerRect = container.getBoundingClientRect();

      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const canvasWidth = canvas.offsetWidth || 1;
      const canvasHeight = canvas.offsetHeight || 1;

      console.log(containerWidth, containerHeight);

      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;

      const scale = Math.min(scaleX, scaleY) * 0.9;

      // Apply scale using CSS transform
      canvas.style.transformOrigin = "top left";
      canvas.style.transform = `scale(${scale})`;

      return scale;
    },

    toggleCanvasSelection: () => {
      set(state => ({
        isCanvasSelected: !state.isCanvasSelected
      }));
    },

    // Duplicate an element
    duplicateElement: (id: string) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();

      if (!currentPageId || !currentPage) return;

      // Find the element to duplicate
      const elementToDuplicate = currentPage.canvas.elements.find(el => el.id === id);

      if (!elementToDuplicate) return;

      // Create a copy with a new ID, slightly offset position
      const newElement: Element = {
        ...elementToDuplicate,
        id: nanoid(),
        rect: {
          ...elementToDuplicate.rect,
          x: elementToDuplicate.rect.x + 10, // Offset by 10px to avoid overlap
          y: elementToDuplicate.rect.y + 10 // Offset by 10px to avoid overlap
        }
      };

      // Add the duplicate to the canvas
      const updatedElements = [...currentPage.canvas.elements, newElement];

      // Update the page elements
      editor.updatePageElements(currentPageId, updatedElements);

      // Add to history
      const historyAction: HistoryAction = {
        type: 'ADD_ELEMENT',
        element: newElement,
        pageId: currentPageId
      };

      // Update history and selection in canvas store
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyAction);

        return {
          selectedElement: newElement,
          selectedElementIds: [newElement.id],
          isCanvasSelected: false,
          historyIndex: state.historyIndex + 1,
          history: newHistory,
          canUndo: true,
          canRedo: false
        };
      });
    },

    // Element Action Bar actions
    showElementActionBar: (elementId, position) => {
      set({
        elementActionBar: {
          isActive: true,
          position,
          elementId,
        },
      });
    },
    hideElementActionBar: () => {
      set(state => ({
        elementActionBar: { ...state.elementActionBar, isActive: false, elementId: null },
      }));
    },
    setElementActionBarPosition: (position) => {
      set(state => ({
        elementActionBar: { ...state.elementActionBar, position },
      }));
    },
    // Element reordering actions
    bringElementForward: (elementId) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      const elements = [...currentPage.canvas.elements];
      const index = elements.findIndex(el => el.id === elementId);

      if (index === -1 || index === elements.length - 1) return; // Not found or already at front

      const element = elements.splice(index, 1)[0];
      elements.splice(index + 1, 0, element);

      editor.updatePageElements(currentPageId, elements);
      // Add to history
      const historyAction: HistoryAction = {
        type: 'REORDER_ELEMENT',
        pageId: currentPageId,
        elementId,
        fromIndex: index,
        toIndex: index + 1,
      };
      set(state => ({
        history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: false,
      }));
    },

    sendElementBackward: (elementId) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      const elements = [...currentPage.canvas.elements];
      const index = elements.findIndex(el => el.id === elementId);

      if (index === -1 || index === 0) return; // Not found or already at back

      const element = elements.splice(index, 1)[0];
      elements.splice(index - 1, 0, element);

      editor.updatePageElements(currentPageId, elements);
      // Add to history
      const historyAction: HistoryAction = {
        type: 'REORDER_ELEMENT',
        pageId: currentPageId,
        elementId,
        fromIndex: index,
        toIndex: index - 1,
      };
      set(state => ({
        history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: false,
      }));
    },

    bringElementToFront: (elementId) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      const elements = [...currentPage.canvas.elements];
      const index = elements.findIndex(el => el.id === elementId);

      if (index === -1 || index === elements.length - 1) return; // Not found or already at front

      const element = elements.splice(index, 1)[0];
      elements.push(element);

      editor.updatePageElements(currentPageId, elements);
      // Add to history
      const historyAction: HistoryAction = {
        type: 'REORDER_ELEMENT',
        pageId: currentPageId,
        elementId,
        fromIndex: index,
        toIndex: elements.length - 1,
      };
      set(state => ({
        history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: false,
      }));
    },

    sendElementToBack: (elementId) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      const elements = [...currentPage.canvas.elements];
      const index = elements.findIndex(el => el.id === elementId);

      if (index === -1 || index === 0) return; // Not found or already at back

      const element = elements.splice(index, 1)[0];
      elements.unshift(element);

      editor.updatePageElements(currentPageId, elements);
      // Add to history
      const historyAction: HistoryAction = {
        type: 'REORDER_ELEMENT',
        pageId: currentPageId,
        elementId,
        fromIndex: index,
        toIndex: 0,
      };
      set(state => ({
        history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: false,
      }));
    },

    // Text styling methods
    handleTextColorChange: (color: string) => {
      const { selectedElementIds } = get();
      if (selectedElementIds.length === 0) return;

      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      // Update all selected text elements
      const elements = currentPage.canvas.elements.map(element => {
        if (selectedElementIds.includes(element.id) && element.type === 'text') {
          return { ...element, color };
        }
        return element;
      });

      editor.updatePageElements(currentPageId, elements);
    },

    // Shape/element background color styling
    handleBackgroundColorChange: (color: string) => {
      const { selectedElementIds } = get();
      if (selectedElementIds.length === 0) return;

      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      const currentPage = getCurrentPage();
      if (!currentPageId || !currentPage) return;

      // Update all selected elements that support background color
      const elements = currentPage.canvas.elements.map(element => {
        if (selectedElementIds.includes(element.id) && element.type !== "text") {
          return { ...element, backgroundColor: color };
        }
        return element;
      });

      editor.updatePageElements(currentPageId, elements);
    },

    // Canvas background color styling
    handleCanvasBackgroundColorChange: (color: string) => {
      const editor = useEditorStore.getState();
      const currentPageId = editor.currentPageId;
      if (!currentPageId) return;

      // Update the current page's background
      editor.updatePageBackground(currentPageId, {
        type: 'color',
        value: color
      });
    },

    // Manual resize tracking methods
    setElementManuallyResized: (elementId: string, isManuallyResized: boolean) => {
      set(state => ({
        manuallyResizedElements: {
          ...state.manuallyResizedElements,
          [elementId]: isManuallyResized
        }
      }));
    },

    isElementManuallyResized: (elementId: string) => {
      const state = get();
      return state.manuallyResizedElements[elementId] === true;
    },

    clearManuallyResizedFlag: (elementId: string) => {
      set(state => {
        const { [elementId]: _removed, ...rest } = state.manuallyResizedElements;
        void _removed; // Suppress unused variable warning
        return {
          manuallyResizedElements: rest
        };
      });
    },
  }

});

// Create a selector to get the current page elements
export const useCurrentPageElements = () => {
  const currentPage = useEditorStore(state => {
    return state.pages.find(page => page.id === state.currentPageId);
  });

  return currentPage?.canvas.elements || [];
};

// Create a selector to get the current page canvas size
export const useCurrentCanvasSize = () => {
  const currentPage = useEditorStore(state => {
    return state.pages.find(page => page.id === state.currentPageId);
  });

  return currentPage?.canvas || DEFAULT_CANVAS_SIZE;
};

export default useCanvasStore;