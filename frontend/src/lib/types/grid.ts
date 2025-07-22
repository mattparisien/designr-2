// lib/types/grid.ts
export interface EntityConfig<T, F = any> {
  key: string;                 // 'projects' | 'templates'
  infiniteKey: string;         // 'infiniteProjects' | 'infiniteTemplates'
  api: {
    getPaginated: (p: number, l: number, f: F) => Promise<{
      items: T[];
      totalItems: number;
      totalPages: number;
      currentPage: number;
    }>;
    getAll: () => Promise<T[]>;
    create: (payload: Partial<T>) => Promise<T>;
    update: (id: string, payload: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
    deleteMultiple?: (ids: string[]) => Promise<void>; // optional
  };
  // Optional: factories, copy, etc.
  createFactory?: (type?: string) => Partial<T>;
  nounSingular?: string; // for toasts (“project”, “template”)
}
