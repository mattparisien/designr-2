import { DesignTemplate } from "../core/design";

/**
 * CREATE DESIGN TEMPLATE REQUEST/RESPONSE TYPES
 */
export type CreateDesignTemplateRequest = Omit<DesignTemplate, "_id" | "createdAt" | "updatedAt" | "createdBy">;
export type CreateDesignTemplateResponse = DesignTemplate;

/**
 * UPDATE DESIGN TEMPLATE REQUEST/RESPONSE TYPES
 */
export type UpdateDesignTemplateRequest = Partial<Omit<DesignTemplate, "_id" | "createdAt" | "updatedAt" | "createdBy">>;
export type UpdateDesignTemplateResponse = DesignTemplate;
