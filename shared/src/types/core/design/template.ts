
import { DesignPage } from "./page";
import { Design } from "./design";

export type DesignTemplateCategory = 'presentation' | 'social' | 'print' | 'custom';

export interface DesignTemplate extends Design {
    category: DesignTemplateCategory;
    tags: string[];
    thumbnailUrl?: string;
    pages: DesignPage[];
}