import { DesignProject } from "../core/design";
import { OmitCreate, OmitUpdate } from "../utils/omit";

/**
 * CREATE DESIGN Project REQUEST/RESPONSE TYPES
 */
export type CreateDesignProjectRequest = OmitCreate<DesignProject>;
export type CreateDesignProjectResponse = DesignProject;

/**
 * UPDATE DESIGN Project REQUEST/RESPONSE TYPES
 */
export type UpdateDesignProjectRequest = Partial<OmitUpdate<DesignProject>>;
export type UpdateDesignProjectResponse = DesignProject;

/**
 * GET A SINGLE DESIGN Project RESPONSE TYPE
 */
export type GetDesignProjectRequest = { id: string };
export type GetDesignProjectResponse = DesignProject;

/**
 * GET ALL DESIGN ProjectS RESPONSE TYPE
 */
export type GetDesignProjectsRequest = {
    category?: string;
    isPublic?: boolean;
};
export type GetDesignProjectsResponse = DesignProject[];
