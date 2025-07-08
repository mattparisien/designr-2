// import { projectsAPI } from "@/lib/api";
import { create } from "zustand";
import React from "react";
import { DEFAULT_CANVAS_SIZE } from "../constants";
import { CanvasSize, EditorContextType, Element, Page } from "../types/canvas";

// Define API types for better type safety
interface APIElement {
  id: string;
  kind: "text" | "image" | "shape" | "line" | "arrow";
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: unknown;
}

interface APIPage {
  name: string;
  canvas?: { width: number; height: number };
  background?: { type: string; value?: string };
  elements?: APIElement[];
}

interface APIDesign {
  title: string;
  layoutId?: string | object;
  thumbnail?: string;
  layout?: {
    pages: APIPage[];
  };
}

interface APITemplate {
  title: string;
  layout?: {
    pages: APIPage[];
  };
}

interface APILayout {
  pages: APIPage[];
}

interface PresetItem {
  id: string;
  [key: string]: unknown;
}

// Helper function to convert API Page to frontend Page
const convertAPIPageToFrontend = (apiPage: APIPage): Page => {
  return {
    id: `page-${Date.now()}-${Math.random()}`, // Generate frontend ID
    name: apiPage.name,
    canvas: apiPage.canvas || { width: 800, height: 600 },
    background: apiPage.background ? {
      type: apiPage.background.type as "color" | "image" | "gradient",
      value: apiPage.background.value
    } : { type: 'color' as const, value: '#ffffff' },
    elements: (apiPage.elements || []).map((el: APIElement) => ({
      ...el,
      // Ensure frontend-specific properties exist
      isNew: false,
      locked: false,
      isEditable: true,
    })),
    // Convert canvas to canvasSize for backward compatibility
    canvasSize: {
      name: 'Custom',
      width: apiPage.canvas?.width || 800,
      height: apiPage.canvas?.height || 600,
    }
  };
};

// Helper function to convert frontend Page to API Page
const convertFrontendPageToAPI = (frontendPage: Page): APIPage => {
  return {
    name: frontendPage.name || 'Untitled Page',
    canvas: frontendPage.canvas || {
      width: frontendPage.canvasSize?.width || 800,
      height: frontendPage.canvasSize?.height || 600,
    },
    background: frontendPage.background ? {
      type: frontendPage.background.type,
      value: frontendPage.background.value
    } : { type: 'color', value: '#ffffff' },
    elements: frontendPage.elements.map(el => {
      // Remove frontend-specific properties
      const { rect, isNew, locked, isEditable, isStrikethrough, borderStyle, ...apiElement } = el;
      // Suppress unused variable warnings with void operator
      void rect; void isNew; void locked; void isEditable; void isStrikethrough; void borderStyle;
      return apiElement;
    }),
  };
};

// Define the store state interface
export interface EditorState extends Omit<EditorContextType, "currentPage"> {
  designId: string | null;
  captureCanvasScreenshot: () => Promise<string | undefined>;
  sidebar: {
    width: number | null;
    isOpen: boolean;
    activeItemId: string | null;
  }
  // Sidebar panel state
  sidebarPanel: {
    isOpen: boolean;
    activeItemId: string | null;
    content: React.ReactNode | null;
  };

  // Sidebar panel actions
  openSidebarPanel: (itemId: string) => void;
  closeSidebarPanel: () => void;

  openSidebar: (itemId: string) => void;
  closeSidebar: () => void;
  setSidebarWidth: (width: number | null) => void;
}

// Create the editor store
const useEditorStore = create<EditorState>((set, get) => ({
  // Document metadata
  designName: "Untitled Design",
  isDesignSaved: true,
  isSaving: false,
  designId: null,
  sidebar: {
    width: null,
    isOpen: false,
    activeItemId: null,
  },

  // Editor mode
  isEditMode: true,

  // Page management
  pages: [
    {
      id: `page-${Date.now()}`,
      name: 'Page 1',
      canvas: { width: DEFAULT_CANVAS_SIZE.width, height: DEFAULT_CANVAS_SIZE.height },
      background: { type: 'color', value: '#ffffff' },
      elements: [],
      canvasSize: DEFAULT_CANVAS_SIZE
    }
  ],
  currentPageId: `page-${Date.now()}`,
  currentPageIndex: 0,


  // Sidebar panel state
  sidebarPanel: {
    isOpen: false,
    activeItemId: null,
    content: null,
  },
  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
  renameDesign: (name: string) => set({ designName: name, isDesignSaved: false }),
  addPage: () => {
    const state = get();
    const currentPageCanvasSize = state.pages.find(page => page.id === state.currentPageId)?.canvasSize || DEFAULT_CANVAS_SIZE;
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page ${state.pages.length + 1}`,
      canvas: { width: currentPageCanvasSize.width, height: currentPageCanvasSize.height },
      background: { type: 'color', value: '#ffffff' },
      elements: [],
      canvasSize: currentPageCanvasSize
    };

    set(state => ({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
      currentPageIndex: state.pages.length,
      isDesignSaved: false
    }));
  },
  deletePage: (id: string) => {
    const state = get();

    // Don't allow deleting the last page
    if (state.pages.length <= 1) {
      return;
    }

    const newPages = state.pages.filter(page => page.id !== id);

    // If the current page was deleted, switch to the previous page or the first page
    let newCurrentPageId = state.currentPageId;
    let newCurrentPageIndex = state.currentPageIndex;

    if (state.currentPageId === id) {
      const index = state.pages.findIndex(page => page.id === id);
      const newIndex = Math.max(0, index - 1);
      newCurrentPageId = newPages[newIndex]?.id || null;
      newCurrentPageIndex = newIndex;
    } else {
      // Update the current page index
      newCurrentPageIndex = newPages.findIndex(page => page.id === state.currentPageId);
    }

    set({
      pages: newPages,
      currentPageId: newCurrentPageId,
      currentPageIndex: newCurrentPageIndex,
      isDesignSaved: false
    });
  },
  goToPage: (id: string) => {
    const state = get();
    const pageIndex = state.pages.findIndex(page => page.id === id);

    if (pageIndex !== -1) {
      set({
        currentPageId: id,
        currentPageIndex: pageIndex
      });
    }
  },
  goToNextPage: () => {
    const state = get();

    if (state.currentPageIndex < state.pages.length - 1) {
      const nextPage = state.pages[state.currentPageIndex + 1];
      set({
        currentPageId: nextPage.id,
        currentPageIndex: state.currentPageIndex + 1
      });
    }
  },
  goToPreviousPage: () => {
    const state = get();

    if (state.currentPageIndex > 0) {
      const prevPage = state.pages[state.currentPageIndex - 1];
      set({
        currentPageId: prevPage.id,
        currentPageIndex: state.currentPageIndex - 1
      });
    }
  },
  duplicateCurrentPage: () => {
    const state = get();
    const currentPage = state.pages.find(page => page.id === state.currentPageId);

    if (currentPage) {
      // Create deep copy of elements
      const duplicatedElements = JSON.parse(JSON.stringify(currentPage.elements));

      const newPage: Page = {
        id: `page-${Date.now()}`,
        name: `${currentPage.name || 'Page'} Copy`,
        canvas: { ...currentPage.canvas },
        background: currentPage.background ? { ...currentPage.background } : { type: 'color', value: '#ffffff' },
        elements: duplicatedElements,
        canvasSize: currentPage.canvasSize ? { ...currentPage.canvasSize } : {
          name: 'Custom',
          width: currentPage.canvas.width,
          height: currentPage.canvas.height
        }
      };

      // Insert after current page
      const newPages = [
        ...state.pages.slice(0, state.currentPageIndex + 1),
        newPage,
        ...state.pages.slice(state.currentPageIndex + 1)
      ];

      set({
        pages: newPages,
        currentPageId: newPage.id,
        currentPageIndex: state.currentPageIndex + 1,
        isDesignSaved: false
      });
    }
  },
  updatePageElements: (pageId: string, elements: Element[]) => {
    set(state => ({
      pages: state.pages.map(page =>
        page.id === pageId
          ? { ...page, elements }
          : page
      ),
      isDesignSaved: false
    }));
  },
  updatePageCanvasSize: (pageId: string, canvasSize: CanvasSize) => {
    set(state => ({
      pages: state.pages.map(page =>
        page.id === pageId
          ? {
            ...page,
            canvas: { width: canvasSize.width, height: canvasSize.height },
            canvasSize // Keep for backward compatibility
          }
          : page
      ),
      isDesignSaved: false
    }));
  },
  updatePageBackground: (pageId: string, background: { type: 'color' | 'image' | 'gradient', value?: string }) => {
    set(state => ({
      pages: state.pages.map(page =>
        page.id === pageId
          ? { ...page, background }
          : page
      ),
      isDesignSaved: false
    }));
  },
  saveDesign: async () => {
    const state = get();

    try {
      // Set saving indicator to true
      set({ isSaving: true });

      // Use the saved design ID or get it from URL
      let idToUse = state.designId;

      if (!idToUse && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        idToUse = urlParams.get('id');
      }

      if (!idToUse) {
        console.error('No design ID found to save');
        set({ isSaving: false });
        return;
      }

      // Capture canvas screenshot for thumbnail
      const thumbnailImage = await get().captureCanvasScreenshot();

      // Prepare the data to be saved
      const designData = {
        title: state.designName,
        layout: {
          pages: state.pages.map(convertFrontendPageToAPI)
        },
        updatedAt: new Date().toISOString(),
        thumbnail: thumbnailImage // Add the thumbnail data
      };

      console.log('Saving design:', state.designName, 'with ID:', idToUse);

      // Call the API to update the design
      //   await projectsAPI.update(idToUse, designData);

      console.log('Design saved successfully:', state.designName);
      set({
        isDesignSaved: true,
        designId: idToUse
      });
    } catch (error) {
      console.error('Error saving design:', error);
      // You might want to show a toast notification here
    } finally {
      // Set saving indicator back to false
      set({ isSaving: false });
    }
  },
  captureCanvasScreenshot: async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      try {
        // Use a longer delay to ensure all rendering and text calculations are complete
        setTimeout(async () => {
          // Find the canvas element in the DOM - targeting the specific canvas element
          const canvasElement = document.querySelector('[data-canvas]');
          console.log(canvasElement)
          if (!canvasElement) {
            console.error('Canvas element not found for screenshot');
            resolve(undefined);
            return;
          }

          try {
            // Create a clone of the canvas for screenshot to avoid modifying the visible one
            const canvasClone = canvasElement.cloneNode(true) as HTMLElement;
            document.body.appendChild(canvasClone);
            canvasClone.style.position = 'absolute';
            canvasClone.style.left = '-9999px';
            canvasClone.style.top = '-9999px';

            // Make sure all text elements are properly sized with adequate padding
            const textElements = canvasClone.querySelectorAll('.text-element');
            textElements.forEach((textEl) => {
              const el = textEl as HTMLElement;
              el.style.padding = '4px';
              el.style.lineHeight = '1.5';
              el.style.overflow = 'visible'; // Ensure text isn't clipped
            });

            // Use html2canvas to capture the clone
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(canvasClone, {
              scale: 2, // Higher scale for better quality
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
              allowTaint: true,
              windowWidth: canvasClone.offsetWidth * 2,
              windowHeight: canvasClone.offsetHeight * 2
            });

            // Clean up the clone
            document.body.removeChild(canvasClone);

            // Convert canvas to data URL (PNG format with good quality)
            const thumbnailDataUrl = canvas.toDataURL('image/png', 0.9);
            console.log('Screenshot captured successfully');
            resolve(thumbnailDataUrl);
          } catch (err) {
            console.error('Failed to generate canvas screenshot:', err);
            resolve(undefined);
          }
        }, 300); // Longer delay to ensure rendering is complete
      } catch (error) {
        console.error('Error in screenshot capture process:', error);
        resolve(undefined);
      }
    });
  },
  openSidebarPanel: (itemId: string) =>
    set(state => ({
      sidebarPanel: {
        ...state.sidebarPanel,
        isOpen: true,
        activeItemId: itemId,
        content: undefined,
      },
    })),
  closeSidebarPanel: () =>
    set(state => ({
      sidebarPanel: {
        ...state.sidebarPanel,
        isOpen: false,
        activeItemId: null,
        content: undefined,
      },
    })),
  openSidebar(itemId) {
    set(state => ({
      sidebar: {
        ...state.sidebar,
        isOpen: true,
        activeItemId: itemId
      },
    }));
  },
  closeSidebar() {
    set(state => ({
      sidebar: {
        ...state.sidebar,
        isOpen: false,
        activeItemId: null,
      },
    }));
  },
  setSidebarWidth(width) {
    set(state => ({
      sidebar: {
        ...state.sidebar,
        width,
      },
    }));
  },
}));

// Add a currentPage selector
export const useCurrentPage = () => {
  return useEditorStore(state => {
    return state.pages.find(page => page.id === state.currentPageId) || state.pages[0];
  });
};

// Add auto-save functionality
export const setupAutoSave = () => {
  let autoSaveTimer: NodeJS.Timeout | null = null;

  // Subscribe to changes in the store
  useEditorStore.subscribe(
    (state) => {
      const { isDesignSaved, designId } = state;
      if (!isDesignSaved && designId) {
        // Clear any existing timer
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }

        // Set a new timer for auto-save
        autoSaveTimer = setTimeout(() => {
          console.log('Auto-saving design...');
          useEditorStore.getState().saveDesign();
        }, 3000); // 3 seconds delay
      }
    }
  );

  // Return cleanup function
  return () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  };
};

// Handle keyboard shortcuts
export const setupKeyboardShortcuts = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if the target is an input or textarea or contentEditable
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    const store = useEditorStore.getState();

    // Save: Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      store.saveDesign();
    }

    // Next page: Alt + Right arrow
    if (e.key === "ArrowRight" && e.altKey) {
      e.preventDefault();
      store.goToNextPage();
    }

    // Previous page: Alt + Left arrow
    if (e.key === "ArrowLeft" && e.altKey) {
      e.preventDefault();
      store.goToPreviousPage();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
};

// Initialize design data
export const initializeDesign = async () => {
  try {
    // Get parameters from URL query
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const templateId = urlParams.get('templateId');
    const presetId = urlParams.get('preset');

    // Handle preset initialization
    if (presetId) {
      console.log('Initializing with preset:', presetId);
      await initializeWithPreset(presetId);
      return;
    }

    // Handle template loading
    if (templateId) {
      console.log('Loading template:', templateId);
      await initializeTemplate(templateId);
      return;
    }

    // Handle project loading
    if (!projectId) {
      console.log('No design ID, template ID, or preset ID found in URL, creating new design');
      return;
    }

    // Store the design ID
    useEditorStore.setState({ designId: projectId });

    // Load the design data
    // const design = await projectsAPI.getById(projectId);
    const design: APIDesign | null = null;
    // console.log('the design', design);

    if (design) {
      console.log('Design loaded:', design.title);

      useEditorStore.setState({
        designName: design.title || "Untitled Design",
        isDesignSaved: true
      });

      // Handle layout data - check if layoutId is populated with actual layout data
      let layoutData: APILayout | null = null;

      if (typeof design.layoutId === 'object' && design.layoutId !== null) {
        // layoutId is populated with Layout object
        layoutData = design.layoutId as APILayout;
      } else if (typeof design.layoutId === 'string') {
        // layoutId is just a string reference - this shouldn't happen with proper population
        console.warn('Layout data not populated, using default page');
      }

      if (layoutData && layoutData.pages && layoutData.pages.length > 0) {
        // Convert API pages to frontend format
        const frontendPages = layoutData.pages.map(convertAPIPageToFrontend);

        useEditorStore.setState({
          pages: frontendPages,
          currentPageId: frontendPages[0].id,
          currentPageIndex: 0
        });
      } else {
        // Fallback to default page structure
        const defaultPage: Page = {
          id: `page-${Date.now()}`,
          name: 'Page 1',
          canvas: { width: 800, height: 600 },
          background: { type: 'color', value: '#ffffff' },
          elements: [],
          canvasSize: DEFAULT_CANVAS_SIZE
        };

        useEditorStore.setState({
          pages: [defaultPage],
          currentPageId: defaultPage.id,
          currentPageIndex: 0
        });
      }

      // Check if this is a brand new design (no thumbnail yet)
      if (!design.thumbnail) {
        console.log('New design detected, scheduling initial save for thumbnail generation');
        // Schedule an initial save after a short delay to let the canvas render
        setTimeout(() => {
          useEditorStore.getState().saveDesign();
        }, 1500);
      }
    }
  } catch (error) {
    console.error('Error loading design:', error);
  }
};

// Initialize template data
export const initializeTemplate = async (templateId: string) => {
  try {
    console.log('Loading template:', templateId);

    // Import templatesAPI
    // const { templatesAPI } = await import('@/lib/api');

    // Load template data
    // const template = await templatesAPI.getById(templateId);
    const template = null;

    if (template) {
      console.log('Template loaded:', template.title);

      // Set template as the design name and mark as unsaved (since it's a new project based on template)
      useEditorStore.setState({
        designName: `${template.title} (Copy)`,
        isDesignSaved: false, // Mark as unsaved since this will be a new project
        designId: null // No project ID yet, will be created on first save
      });

      // Handle template pages
      if (template.pages && template.pages.length > 0) {
        // Convert template pages to frontend format
        const frontendPages = template.pages.map(convertAPIPageToFrontend);

        useEditorStore.setState({
          pages: frontendPages,
          currentPageId: frontendPages[0].id,
          currentPageIndex: 0
        });
      } else {
        // Fallback to default page with template canvas size
        const canvasSize = template.canvasSize || DEFAULT_CANVAS_SIZE;
        const defaultPage: Page = {
          id: `page-${Date.now()}`,
          name: 'Page 1',
          canvas: { width: canvasSize.width, height: canvasSize.height },
          background: { type: 'color', value: '#ffffff' },
          elements: [],
          canvasSize: {
            name: canvasSize.name || 'Custom',
            width: canvasSize.width,
            height: canvasSize.height
          }
        };

        useEditorStore.setState({
          pages: [defaultPage],
          currentPageId: defaultPage.id,
          currentPageIndex: 0
        });
      }
    }
  } catch (error) {
    console.error('Error loading template:', error);
  }
};

// Initialize with preset data
export const initializeWithPreset = async (presetId: string) => {
  try {
    console.log('Initializing with preset:', presetId);

    // Handle blank preset
    if (presetId === 'blank') {
      useEditorStore.setState({
        designName: 'Untitled Design',
        isDesignSaved: false,
        designId: null
      });
      return;
    }

    // Import projectsAPI
    const { projectsAPI } = await import('@/lib/api');

    // Load presets
    const presets = await projectsAPI.getPresets();
    const preset = presets.find((p: any) => p.id === presetId);

    if (preset) {
      console.log('Preset loaded:', preset.name);

      // Set preset as the design name and mark as unsaved
      useEditorStore.setState({
        designName: `${preset.name} Project`,
        isDesignSaved: false, // Mark as unsaved since this will be a new project
        designId: null // No project ID yet, will be created on first save
      });

      // Create a page with preset canvas size
      const canvasSize = {
        name: preset.canvasSize.name,
        width: preset.canvasSize.width,
        height: preset.canvasSize.height
      };

      const defaultPage: Page = {
        id: `page-${Date.now()}`,
        name: 'Page 1',
        canvas: { width: canvasSize.width, height: canvasSize.height },
        background: { type: 'color', value: '#ffffff' },
        elements: [],
        canvasSize: canvasSize
      };

      useEditorStore.setState({
        pages: [defaultPage],
        currentPageId: defaultPage.id,
        currentPageIndex: 0
      });
    }
  } catch (error) {
    console.error('Error loading preset:', error);
  }
};

export default useEditorStore;