import { ElementContent } from './element';

export interface PageContent {
  templatePageIndex: number;
  elements: ElementContent[];
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  templateId?: string;
  ownerId?: string;
  pages: PageContent[];
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectPayload = Omit<Project, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectPayload = Partial<CreateProjectPayload>;
