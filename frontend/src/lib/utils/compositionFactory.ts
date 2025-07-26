// src/lib/utils/compositionFactory.ts

/**
 * Options for creating a new composition
 */
export interface CompositionCreateOptions {
  width?: number;
  height?: number;
  name?: string;
  description?: string;
  category?: string;
  type?: string;
  isTemplate?: boolean;
  role?: 'project' | 'template';
  tags?: string[];
  starred?: boolean;
  shared?: boolean;
  featured?: boolean;
  popular?: boolean;
  userId?: string;
}

/**
 * Unified factory function for creating compositions (both projects and templates)
 * 
 * @param options Configuration options for the new composition
 * @returns A composition object ready to be sent to the backend
 */
export function createComposition(options: CompositionCreateOptions = {}): Record<string, unknown> {
  const {
    width = 1080,
    height = 1080,
    isTemplate = false,
    role = isTemplate ? 'template' : 'project',
    name = isTemplate ? 'Untitled Template' : 'Untitled Project',
    type = 'custom',
    category = 'design',
    tags = [],
    starred = false,
    shared = false,
    featured = false,
    popular = false,
    description = '',
    userId = '',
  } = options;

  // Build the common composition structure that matches the backend model
  return {
    name,
    title: name, // For backward compatibility
    description,
    category,
    type,
    width,
    height,
    isTemplate,
    role,
    tags,
    starred,
    shared,
    featured,
    popular,
    userId,
    // For actual composition data - ensure pages array is included in compositionData
    compositionData: {
      version: "1.0",
      pages: [], // Include pages array inside compositionData as expected by backend
      elements: [],
      background: { type: "solid", color: "#ffffff" },
      canvasSize: { width, height } // Move canvasSize inside compositionData
    },
    // For backward compatibility with frontend components
    pages: [], // Keep this for backward compatibility
    data: {},
    ...(role === 'project' ? {
      ownerId: userId || '', // Will be assigned by backend
      layoutId: '',        // Will be assigned by backend
      vibe: "minimal" as const
    } : {
      author: userId ? userId : 'current-user',
    }),
  };
}

/**
 * Helper function to create a project composition
 */
export function createProject(options: Omit<CompositionCreateOptions, 'isTemplate' | 'role'> = {}): Record<string, unknown> {
  return createComposition({
    ...options,
    isTemplate: false,
    role: 'project'
  });
}

/**
 * Helper function to create a template composition
 */
export function createTemplate(options: Omit<CompositionCreateOptions, 'isTemplate' | 'role'> = {}): Record<string, unknown> {
  return createComposition({
    ...options,
    isTemplate: true,
    role: 'template'
  });
}
