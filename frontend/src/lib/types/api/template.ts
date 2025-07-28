import { Element } from './element';

export const BACKGROUND_TYPES = ['color', 'image', 'gradient'] as const;
export type BackgroundType = (typeof BACKGROUND_TYPES)[number];

export const TEMPLATE_CATEGORIES = ['presentation', 'social', 'print', 'custom'] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export interface Page {
  name: string;
  background?: {
    type: BackgroundType;
    value?: string;
  };
  elements: Element[];
}

export interface Template {
  _id: string;
  title: string;
  description?: string;
  category: TemplateCategory;
  thumbnailUrl?: string;
  canvasSize: {
    width: number;
    height: number;
  };
  pages: Page[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplatePayload = Omit<Template, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;
