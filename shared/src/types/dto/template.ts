import { DesignTemplate } from "../core/design";

/**
 * CREATE DESIGN TEMPLATE REQUEST/RESPONSE TYPES
 */
export type CreateDesignTemplateRequest = Omit<DesignTemplate, "id" | "createdAt" | "updatedAt" | "createdBy">;
export type CreateDesignTemplateResponse = DesignTemplate;

/**
 * UPDATE DESIGN TEMPLATE REQUEST/RESPONSE TYPES
 */
export type UpdateDesignTemplateRequest = Partial<Omit<DesignTemplate, "id" | "createdAt" | "updatedAt" | "createdBy">>;
export type UpdateDesignTemplateResponse = DesignTemplate;

/**
 * GET A SINGLE DESIGN TEMPLATE RESPONSE TYPE
 */
export type GetDesignTemplateRequest = { id: string };
export type GetDesignTemplateResponse = DesignTemplate;

/**
 * GET ALL DESIGN TEMPLATES RESPONSE TYPE
 */
export type GetDesignTemplatesRequest = {
    category?: string;
    isPublic?: boolean;
};
export type GetDesignTemplatesResponse = DesignTemplate[];
