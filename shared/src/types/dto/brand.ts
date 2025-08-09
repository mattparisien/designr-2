import { Brand } from "../core/brand";
import { OmitUpdate, OmitCreate } from "../utils/omit";

/**
 * CREATE BRAND REQUEST/RESPONSE TYPES
 */
export type CreateBrandRequest = OmitCreate<Brand>;
export type CreateBrandResponse = Brand;

/**
 * UPDATE BRAND REQUEST/RESPONSE TYPES
 */
export type UpdateBrandRequest = Partial<OmitUpdate<Brand>>;
export type UpdateBrandResponse = Brand;

/**
 * GET A SINGLE BRAND RESPONSE TYPE
 */
export type GetBrandRequest = { id: string };
export type GetBrandResponse = Brand;

/**
 * GET ALL BRANDS RESPONSE TYPE
 */
export type GetBrandsRequest = {
    category?: string;
    isPublic?: boolean;
};
export type GetBrandsResponse = Brand[];
