// import { projectsAPI } from "@/lib/api";
import { ProjectsAPI } from "@/lib/api/projects";
import { TemplatesAPI } from "@/lib/api/templates";
import { DesignProject as Project, DesignTemplate as Template, UpdateDesignTemplateRequest } from "@shared/types";
import { nanoid } from "nanoid";
import React from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_CANVAS_SIZE } from "../constants";
import { mapPage } from "../mappers/api";
import { CanvasSize, EditorContextType, Element, LineElement, Page, ShapeElement, TextElement } from "../types/canvas";

// Type for pages coming from API (Project or Template)
type APIDesignPage = Project['pages'][number] | Template['pages'][number];

// Define the store state interface
export interface EditorState extends Omit<EditorContextType, "currentPage"> {
  designId: string | null;
  roleId: "project" | "template" | null;
  captureCanvasScreenshot: () => Promise<string | undefined>;
  loadDesignFromAPI: (designId: string) => Promise<{ role: "project" | "template"; design: Project | Template }>;
  loadDesign: (design: Project | string) => Promise<void>;
  getAPIClient: () => Promise<ProjectsAPI | TemplatesAPI | undefined>;
  saveDesign: () => Promise<void>;
  recolorArtwork: (palette: { hex: string }[], pageId?: string) => void;
  recolorState: { lastMappingSignature: string | null };

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
const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    designId: null,
    roleId: null,
    designName: "Untitled Design",
    isDesignSaved: true,
    isSaving: false,
    currentPageId: null,
    currentPageIndex: 0,
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


    // Sidebar panel state
    sidebarPanel: {
      isOpen: false,
      activeItemId: null,
      content: null,
    },

    recolorState: { lastMappingSignature: null },

    toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
    renameDesign: (name: string) => set({ designName: name, isDesignSaved: false }),
    addPage: () => {
      const state = get();

      const currentPage = state.pages.find(page => page.id === state.currentPageId);
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
      // Normalize stackingOrder if missing: assign based on index
      const normalized = elements.map((el, idx) => ({
        ...el,
        stackingOrder: el.stackingOrder ?? idx
      }));
      set(state => ({
        pages: state.pages.map(page =>
          page.id === pageId
            ? { ...page, canvas: { ...page.canvas, elements: normalized } }
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
      const { projectsAPI } = await import('@/lib/api/index');

      role = "project";
      design = await projectsAPI.getById(designId);

      if (!design) {
        throw new Error('Project not found');
      }


      return {
        role,
        design
      }
    },
    loadDesign: async (designOrId: Project | string) => {

      try {
        // Prevent concurrent load/save confusion
        set({ isSaving: true });

        // If already loaded same design, skip
        const currentId = get().designId;
        if (typeof designOrId !== 'string' && currentId === designOrId.id) {
          set({ isSaving: false });
          return;
        }
        if (typeof designOrId === 'string' && currentId === designOrId) {
          set({ isSaving: false });
          return;
        }

        let role: "project" | "template" | null = null;
        let design: Project | Template | null = null;

        if (typeof designOrId === 'string') {
          const result = await get().loadDesignFromAPI(designOrId);
          role = result.role;
          design = result.design as Project | Template;
        } else {
          // Already have the project object
          design = designOrId;
          role = 'project';
        }

        if (!design) throw new Error('Project not found');

        set({
          designName: (design as Project).title || 'Untitled Design',
          pages: design.pages.map((page: APIDesignPage) => mapPage(page)),
          currentPageId: design.pages[0]?.id || '',
          isDesignSaved: true,
          designId: design.id,
          roleId: role
        });

        console.log('Design loaded successfully');
      } catch (error) {
        console.error('Error loading design:', error);
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
        console.log('client', client);

        if (!client) {
          throw new Error('API client is not available.');
        }


        const updateData: UpdateDesignTemplateRequest = {
          title: state.designName,
          thumbnailUrl: thumbnailImage,
          pages: state.pages.map(p => ({
            ...p,
            canvas: {
              ...p.canvas,
              elements: p.canvas.elements.map((el, idx) => ({
                ...el,
                stackingOrder: el.stackingOrder ?? idx
              }))
            }
          })),
        };


        await client.update(designId, updateData);

        // If thumbnail capture was successful, log it
        if (thumbnailImage) {
          console.log('Thumbnail captured successfully for composition');
        }

        console.log('Design saved successfully:', state.designName);
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
    // recolorArtwork updated to isolate unique colors from elements and recolor via palette
    recolorArtwork: (palette: { hex: string }[], pageId?: string) => {
      const state = get();

      const targetPageId = pageId || state.currentPageId || state.pages[0]?.id;
      const targetPage = state.pages.find(p => p.id === targetPageId);
      if (!targetPage) {
        console.warn('recolorArtwork: target page not found');
        return;
      }

      const elements = targetPage.canvas.elements || [];
      if (!elements.length) return;

      // 1) Isolate unique colors used across elements (text, background, border)
      const uniqueSet = new Set<string>();
      for (const el of elements) {
        switch (el.type) {
          case 'text': {
            const e = el as TextElement;
            if (e.color) uniqueSet.add(String(e.color).toLowerCase());
            break;
          }
          case 'shape': {
            const e = el as ShapeElement;
            if (e.backgroundColor) uniqueSet.add(String(e.backgroundColor).toLowerCase());
            if (e.borderColor) uniqueSet.add(String(e.borderColor).toLowerCase());
            break;
          }
          case 'line': {
            const e = el as LineElement;
            if (e.backgroundColor) uniqueSet.add(String(e.backgroundColor).toLowerCase());
            break;
          }
          default:
            break;
        }
      }
      const uniqueColors = Array.from(uniqueSet);
      if (!uniqueColors.length) return;

      // Normalize and validate palette
      const paletteHexes = (palette || [])
        .map(c => c?.hex?.toLowerCase?.())
        .filter((v): v is string => !!v);
      if (!paletteHexes.length) return;

      // 2) Build a mapping from each unique color -> a palette color.
      // We'll shuffle the palette to vary results, and avoid repeating the last mapping signature.
      const buildMapping = (paletteArr: string[]) => {
        const mapping = new Map<string, string>();
        for (let i = 0; i < uniqueColors.length; i++) {
          mapping.set(uniqueColors[i], paletteArr[i % paletteArr.length]);
        }
        return mapping;
      };

      const lastSig = state.recolorState?.lastMappingSignature;
      let attempts = 0;
      let mapping: Map<string, string> | null = null;
      let signature = '';

      if (paletteHexes.length === 1 && uniqueColors.length === 1) {
        // trivial case, single mapping
        const m = buildMapping(paletteHexes);
        const sig = uniqueColors.map(c => `${c}=>${m.get(c)}`).join('|');
        const recoloredSingle = elements.map(el => {
          switch (el.type) {
            case 'text': {
              const e = el as TextElement;
              return { ...e, color: m.get(String(e.color).toLowerCase()) || e.color } as Element;
            }
            case 'shape': {
              const e = el as ShapeElement;
              return {
                ...e,
                backgroundColor: m.get(String(e.backgroundColor).toLowerCase()) || e.backgroundColor,
                borderColor: m.get(String(e.borderColor).toLowerCase()) || e.borderColor,
              } as Element;
            }
            case 'line': {
              const e = el as LineElement;
              return { ...e, backgroundColor: m.get(String(e.backgroundColor).toLowerCase()) || e.backgroundColor } as Element;
            }
            default:
              return el;
          }
        });
        get().updatePageElements(targetPage.id, recoloredSingle);
        set({ recolorState: { lastMappingSignature: sig } });
        return;
      }

      // Try shuffled palettes until mapping differs from last signature
      while (attempts < 12) {
        const shuffled = [...paletteHexes];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const m = buildMapping(shuffled);
        const sig = uniqueColors.map(c => `${c}=>${m.get(c)}`).join('|');
        if (sig !== lastSig) { mapping = m; signature = sig; break; }
        attempts++;
      }

      if (!mapping) {
        // Fallback: rotate palette to force a change
        const rotated = [...paletteHexes.slice(1), paletteHexes[0]];
        mapping = buildMapping(rotated);
        signature = uniqueColors.map(c => `${c}=>${mapping!.get(c)}`).join('|');
        if (signature === lastSig) return; // still same, abort
      }

      const mapColor = (value?: string) => {
        if (!value) return value;
        const key = String(value).toLowerCase();
        return mapping!.get(key) || value;
      };

      const recolored: Element[] = elements.map((el): Element => {
        switch (el.type) {
          case 'text': {
            const e = el as TextElement;
            return { ...e, color: mapColor(e.color) ?? e.color };
          }
          case 'shape': {
            const e = el as ShapeElement;
            return {
              ...e,
              backgroundColor: mapColor(e.backgroundColor) ?? e.backgroundColor,
              borderColor: mapColor(e.borderColor) ?? e.borderColor,
            };
          }
          case 'line': {
            const e = el as LineElement;
            return { ...e, backgroundColor: mapColor(e.backgroundColor as string) ?? e.backgroundColor } as Element;
          }
          default:
            return el;
        }
      });

      get().updatePageElements(targetPage.id, recolored);
      set({ recolorState: { lastMappingSignature: signature } });
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

        // Collect inline <style> tag CSS (avoid external fetch CORS for now)
        const styleTags = Array.from(document.querySelectorAll('style'));
        const inlineCSS = styleTags.map(s => s.textContent || '').join('\n');
        // Optionally attempt to inline same-origin linked stylesheets
        const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        const linkedCSSChunks: string[] = [];
        await Promise.all(linkTags.map(async link => {
          try {
            const href = link.href;
            // Only fetch same-origin to avoid CORS issues
            if (href.startsWith(window.location.origin)) {
              const resp = await fetch(href);
              if (resp.ok) {
                linkedCSSChunks.push(await resp.text());
              }
            }
          } catch {
            // Ignore failures silently
          }
        }));
        const css = `${inlineCSS}\n${linkedCSSChunks.join('\n')}`;

        // Determine background color from page background state if color
        let backgroundColor: string | undefined = undefined;
        const bg: { type?: string; value?: string } | undefined = (currentPage as unknown as { background?: { type?: string; value?: string } }).background;
        if (bg && bg.type === 'color' && bg.value) backgroundColor = bg.value;

        // Get canvas styles
        const canvasStyles = {
          fontFamily: 'Inter, sans-serif',
          color: '#000000',
          backgroundColor: backgroundColor || '#ffffff'
        } as Record<string, string>;

        // Extract element info for proper stacking
        const elementInfo = Array.from(captureElement.querySelectorAll('[data-element-id]'))
          .map(el => ({
            id: el.getAttribute('data-element-id') || '',
            kind: el.getAttribute('data-element-type') || 'unknown',
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

        // Convert base64 image to data URL (then upload to Cloudinary)
        const dataURL = `data:image/png;base64,${result.imageData}`;
        let uploadedUrl: string | undefined = undefined;
        try {
          const byteChars = atob(result.imageData);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          const file = new File([blob], `canvas-${Date.now()}.png`, { type: 'image/png' });
          const formData = new FormData();
          formData.append('asset', file);
          formData.append('name', 'Design Thumbnail');
          formData.append('tags', JSON.stringify(['thumbnail', 'design', 'auto']));
          const uploadResp = await fetch('/api/assets/upload', { method: 'POST', body: formData });
          if (uploadResp.ok) {
            const json = await uploadResp.json();
            uploadedUrl = json?.data?.thumbnail || json?.data?.url;
            if (!uploadedUrl) {
              console.warn('Upload response missing url/thumbnail, falling back to data URL');
            }
          } else {
            console.warn('Thumbnail upload failed:', uploadResp.status, uploadResp.statusText);
          }
        } catch (e) {
          console.warn('Thumbnail upload exception, falling back to data URL', e);
        }

        console.log('Screenshot captured successfully using Puppeteer');
        console.log({ uploadedUrl, dataURL })
        return uploadedUrl || dataURL;

      } catch (error) {
        console.error('Error capturing screenshot:', error);
        return undefined;
      }
    },
  })));

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