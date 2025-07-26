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
      isEditable: false, // Template elements should not be editable on load
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
  // Template operations
  templateId: string | null;
  compositionId: string | null;
  captureCanvasScreenshot: () => Promise<string | undefined>;
  saveTemplate: (templateId: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  setTemplateId: (templateId: string) => void;
  loadComposition: (compositionId: string) => Promise<void>;
  saveComposition: (compositionId: string) => Promise<void>;
  setCompositionId: (compositionId: string) => void;

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
  templateId: null,
  compositionId: null,
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
  saveTemplate: async (templateId: string) => {
    const state = get();

    try {
      // Set saving indicator to true
      set({ isSaving: true });

      // Capture canvas screenshot for thumbnail
      const thumbnailImage = await get().captureCanvasScreenshot();

      // Prepare the template data from the current editor state
      const templateData = {
        pages: state.pages.map(convertFrontendPageToAPI),
        canvasSize: state.pages[0]?.canvasSize || DEFAULT_CANVAS_SIZE,
        elements: state.pages[0]?.elements || [],
        background: state.pages[0]?.background || { type: 'color', value: '#ffffff' }
      };

      // Import the API client
      const { apiClient } = await import('@/lib/api');

      // Update the template using the API
      await apiClient.updateTemplate(templateId, {
        name: state.designName,
        templateData: templateData
      });

      // Upload thumbnail if captured
      if (thumbnailImage) {
        try {
          const thumbnailResult = await apiClient.uploadTemplateThumbnail(templateId, thumbnailImage);
          console.log('Thumbnail uploaded successfully:', thumbnailResult.thumbnailUrl);
        } catch (thumbnailError) {
          console.error('Error uploading thumbnail:', thumbnailError);
          // Don't fail the entire save if thumbnail upload fails
        }
      }

      console.log('Template saved successfully:', templateId);
      set({
        isDesignSaved: true,
        templateId: templateId
      });
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
  loadTemplate: async (templateId: string) => {
    const state = get();

    try {
      // Set loading indicator
      set({ isSaving: true });

      // Import the API client
      const { apiClient } = await import('@/lib/api');

      // Get the template data
      const response = await apiClient.getTemplate(templateId);
      const template = response.template;

      if (!template) {
        throw new Error('Template not found');
      }

      console.log('Template loaded:', template);

      // Extract font families from template data
      const fontFamilies = new Set<string>();

      // Check if template has pages data
      if (template.templateData && template.templateData.pages) {
        template.templateData.pages.forEach((page: any) => {
          if (page.elements) {
            page.elements.forEach((element: any) => {
              if (element.kind === 'text' && element.fontFamily) {
                fontFamilies.add(element.fontFamily);
              }
            });
          }
        });
      }

      // Preload fonts if any are found
      if (fontFamilies.size > 0) {
        try {
          const { fontsAPI } = await import('@/lib/api/index');
          const allFonts = await fontsAPI.getUserFonts();

          // Load each font that's used in the template
          for (const fontFamily of fontFamilies) {
            const font = allFonts.find((f: { family: string }) => f.family === fontFamily);
            if (font) {
              await fontsAPI.loadFont(font);
              console.log(`Preloaded font: ${fontFamily}`);
            }
          }
        } catch (fontError) {
          console.warn('Error preloading fonts:', fontError);
        }
      }

      // Convert template data to frontend format
      if (template.templateData && template.templateData.pages) {
        const frontendPages = template.templateData.pages.map(convertAPIPageToFrontend);

        set({
          designName: template.name || 'Untitled Template',
          pages: frontendPages,
          currentPageId: frontendPages[0]?.id || '',
          currentPageIndex: 0,
          isDesignSaved: true,
          templateId: templateId
        });
      } else {
        // Handle legacy template format
        const defaultPage = {
          id: `page-${Date.now()}`,
          name: 'Page 1',
          canvas: { width: template.width || 1080, height: template.height || 1080 },
          background: { type: 'color' as const, value: '#ffffff' },
          elements: (template.templateData?.elements || []).map((el: APIElement) => ({
            ...el,
            isEditable: false // Template elements should not be editable on load
          })),
          canvasSize: {
            name: 'Custom',
            width: template.width || 1080,
            height: template.height || 1080
          }
        };

        set({
          designName: template.name || 'Untitled Template',
          pages: [defaultPage],
          currentPageId: defaultPage.id,
          currentPageIndex: 0,
          isDesignSaved: true,
          templateId: templateId
        });
      }

      console.log('Template loaded successfully');
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
  setTemplateId: (templateId: string) => {
    set({ templateId });
  },
  setCompositionId: (compositionId: string) => {
    set({ compositionId });
  },
  loadComposition: async (compositionId: string) => {
    const state = get();

    try {
      // Set loading indicator
      set({ isSaving: true });

      // Import the API client
      const { compositionAPI } = await import('@/lib/api/index');

      // Get the composition data
      const composition = await compositionAPI.getById(compositionId);

      if (!composition) {
        throw new Error('Composition not found');
      }

      console.log('Composition loaded:', composition);

      // Get layout data from the composition's data property
      const layoutData = composition.data as APILayout;
      if (!layoutData || !layoutData.pages) {
        throw new Error('Layout data not found in composition');
      }
      
      // Convert composition pages to frontend format
      const frontendPages = layoutData.pages.map(convertAPIPageToFrontend);

      set({
        designName: composition.name || 'Untitled Composition',
        pages: frontendPages,
        currentPageId: frontendPages[0]?.id || '',
        currentPageIndex: 0,
        isDesignSaved: true,
        compositionId: compositionId
      });

      console.log('Composition loaded successfully');
    } catch (error) {
      console.error('Error loading composition:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
  saveComposition: async (compositionId: string) => {
    const state = get();

    try {
      // Set saving indicator to true
      set({ isSaving: true });

      // Capture canvas screenshot for thumbnail
      const thumbnailImage = await get().captureCanvasScreenshot();

      // Prepare the composition data from the current editor state
      const layoutData: APILayout = {
        pages: state.pages.map(convertFrontendPageToAPI)
      };

      console.log('Saving composition:', state.designName, 'with ID:', compositionId);

      // Import the API client
      const { compositionAPI } = await import('@/lib/api/index');

      // Call the API to update the composition
      await compositionAPI.update(compositionId, {
        name: state.designName,
        data: layoutData, // Using layoutData as the composition data
        updatedAt: new Date().toISOString(),
        thumbnailUrl: thumbnailImage // Include the thumbnail image
      });

      // If thumbnail capture was successful, log it
      if (thumbnailImage) {
        console.log('Thumbnail captured successfully for composition');
      }

      console.log('Composition saved successfully:', state.designName);
      set({
        isDesignSaved: true,
        compositionId: compositionId
      });
    } catch (error) {
      console.error('Error saving composition:', error);
    } finally {
      // Set saving indicator back to false
      set({ isSaving: false });
    }
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
  captureCanvasScreenshot: async (): Promise<string | undefined> => {
    const captureElement = document.querySelector("#capture");
    if (!captureElement) {
      console.error('Capture element not found');
      return undefined;
    }

    try {
      // Get the current page data for canvas dimensions
      const state = get();
      const currentPage = state.pages.find(page => page.id === state.currentPageId);
      if (!currentPage) {
        console.error('Current page not found');
        return undefined;
      }

      // Extract HTML content from the capture element
      const html = captureElement.innerHTML;
      
      // Get computed styles
      const computedStyles = window.getComputedStyle(captureElement);
      const css = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Get canvas styles
      const canvasStyles = {
        backgroundColor: currentPage.background?.value || '#ffffff',
        fontFamily: 'Inter, sans-serif',
        color: '#000000'
      };

      // Extract element info for proper stacking
      const elementInfo = Array.from(captureElement.querySelectorAll('[data-element-id]'))
        .map(el => ({
          id: el.getAttribute('data-element-id') || '',
          kind: el.getAttribute('data-kind') || 'unknown',
          zIndex: parseInt(window.getComputedStyle(el).zIndex) || 0
        }));

      // Make request to puppeteer screenshot API
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          css,
          canvasStyles,
          elementInfo,
          width: currentPage.canvas.width,
          height: currentPage.canvas.height,
          pixelRatio: 2
        }),
      });

      if (!response.ok) {
        console.error('Screenshot API request failed:', response.statusText);
        return undefined;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('Screenshot generation failed:', result.error);
        return undefined;
      }

      // Convert base64 image to data URL
      const dataURL = `data:image/png;base64,${result.imageData}`;

      // Open the captured image in a new tab
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<img src="${dataURL}" style="max-width: 100%; height: auto;" />`);
        newTab.document.title = "Canvas Screenshot";
      }

      console.log('Screenshot captured successfully using Puppeteer');
      return dataURL;

    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return undefined;
    }
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
        designName: design.name || "Untitled Design",
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

    // Import templatesAPI for presets
    const { templatesAPI } = await import('@/lib/api');

    // Load presets
    const presets = await templatesAPI.getPresets();
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