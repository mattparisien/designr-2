// import { projectsAPI } from "@/lib/api";
import { DesignProject as Project, DesignTemplate as Template, UpdateDesignTemplateRequest } from "@shared/types";
import { nanoid } from "nanoid";
import React from "react";
import { create } from "zustand";
import { DEFAULT_CANVAS_SIZE } from "../constants";
import { CanvasSize, EditorContextType, Element, Page } from "../types/canvas";
import { ProjectsAPI } from "@/lib/api/projects";
import { TemplatesAPI } from "@/lib/api/templates";
import { mapPage } from "../mappers/api";


// Define the store state interface
export interface EditorState extends Omit<EditorContextType, "currentPage"> {
  designId: string | null;
  roleId: "project" | "template" | null;
  captureCanvasScreenshot: () => Promise<string | undefined>;
  loadDesign: (designId: string) => Promise<void>;
  loadDesignFromAPI: (designId: string) => Promise<{ role: "project" | "template", design: Project | Template }>;
  getAPIClient: () => Promise<ProjectsAPI | TemplatesAPI | undefined>;
  saveDesign: () => Promise<void>;
  setDesign: (designId: string) => void;

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
  designId: null,
  roleId: null,
  designName: "Untitled Design",
  isDesignSaved: true,
  isSaving: false,
  templateId: null,
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
      canvas: { width: DEFAULT_CANVAS_SIZE.width, height: DEFAULT_CANVAS_SIZE.height, elements: [] },
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

    const currentPage = state.pages.find(page => page.id === state.currentPageId); state.pages.find(page => page.id === state.currentPageId);
    if (!currentPage) {
      console.error('Current page not found');
      return;
    }

    const canvasSize = {
      width: currentPage.canvas.width || DEFAULT_CANVAS_SIZE.width,
      height: currentPage.canvas.height || DEFAULT_CANVAS_SIZE.height
    }

    const newPage: Page = {
      id: nanoid(),
      canvas: { width: canvasSize.width, height: canvasSize.height, elements: [] },
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

      const newPage: Page = {
        id: nanoid(),
        canvas: { ...currentPage.canvas },
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
            canvas: { ...page.canvas, width: canvasSize.width, height: canvasSize.height },
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
  setDesign: (designId: string) => {
    set({ designId });
  },
  getAPIClient: async () => {
    const role: "project" | "template" | null = get().roleId;
    if (!role) {
      throw new Error('Role is not set. Please load a design first.');
    }

    if (role === "project") {
      const { projectsAPI } = await import('@/lib/api/index');
      return projectsAPI;
    }
    if (role === "template") {
      const { templatesAPI } = await import('@/lib/api/index');
      return templatesAPI;
    }

  },
  loadDesignFromAPI: async (designId: string) => {

    let role: "project" | "template" | null = null;

    let design: Project | Template | null = null;

    // Import the API client
    const { projectsAPI, templatesAPI } = await import('@/lib/api/index');

    // Get the composition data
    role = "template";
    design = await templatesAPI.getById(designId) as Template;


    if (!design) {
      console.warn('Template not found. Searching for project...');
    } else {
      set({
        designName: design.title || get().designName,
        pages: design.pages,
      })
    }

    role = "project";
    design = await projectsAPI.getById(designId) as Project;

    if (!design) {
      throw new Error('Project not found');
    }


    return {
      role,
      design
    }
  },
  loadDesign: async (designId: string) => {

    try {
      // Set loading indicator
      set({ isSaving: true });

      const {
        design,
        role
      } = await get().loadDesignFromAPI(designId);

      if (!design) {
        throw new Error('Project not found');
      }

      set({
        designName: design.title || 'Untitled Design',
        pages: design.pages.map(page => mapPage(page)),
        currentPageId: design.pages[0]?.id || '',
        currentPageIndex: 0,
        isDesignSaved: true,
        designId: design.id,
        roleId: role
      });

      console.log('Design loaded successfully');
    } catch (error) {
      console.error('Error loading design:', error);

      console.log('Composition loaded successfully');
    } finally {
      set({ isSaving: false });
    }
  },
  saveDesign: async () => {
    const state = get();

    const designId = state.designId;

    if (!designId) {
      throw new Error('Design ID is required to save the design. Please call loadDesign first.');
    }

    try {
      // Set saving indicator to true
      set({ isSaving: true });

      // Capture canvas screenshot for thumbnail
      const thumbnailImage = await get().captureCanvasScreenshot();

      // Import the API client
      const client = await get().getAPIClient();

      if (!client) {
        throw new Error('API client is not available.');
      }


      const updateData: UpdateDesignTemplateRequest = {
        title: state.designName,
        thumbnailUrl: thumbnailImage,
        pages: state.pages,

      };

      console.log('Update payload:', updateData);
      await client.update(designId, updateData);

      // If thumbnail capture was successful, log it
      if (thumbnailImage) {
        console.log('Thumbnail captured successfully for composition');
      }

      console.log('Composition saved successfully:', state.designName);
      set({
        isDesignSaved: true,
        designId
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


      // Get canvas styles
      const canvasStyles = {
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




export default useEditorStore;