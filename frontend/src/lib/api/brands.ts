import { Brand } from "@shared/types/core/brand";
import { Axios } from "axios";
import {
    APIService,
    GenerateBrandFromAssetsRequest
} from "../types/api";
import { CreateBrandRequest } from "@shared/types";
import { Brand as BrandType } from "../types/brands";
import { APIBase } from "./base";

export class BrandsAPI extends APIBase implements APIService<Brand> {
    API_URL: string = "/api/brands";
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }

    async getAll(): Promise<Brand[]> {
        try {
            const response = await this.apiClient.get<{ data: Brand[] }>(
                "/brands"
            );
            return response.data.brands;
        } catch (error: any) {
            console.error(
                "Error fetching brands:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch brands");
        }
    }

    async getById(brandId: string): Promise<BrandType> {
        try {
            const response = await this.apiClient.get<{ data: Brand }>(
                `/brands/${brandId}`
            );
            return response.data.brand;
        } catch (error: any) {
            console.error(
                `Error fetching brand ${brandId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch brand");
        }
    }

    async create(data: CreateBrandRequest): Promise<Brand> {
        try {
            const response = await this.apiClient.post<{ data: Brand }>(
                "/brands",
                data
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error creating brand:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to create brand");
        }
    }

    async update(
        brandId: string,
        data: Partial<CreateBrandRequest>
    ): Promise<Brand> {
        try {
            const response = await this.apiClient.put<{ data: Brand }>(
                `/brands/${brandId}`,
                data
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error updating brand ${brandId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to update brand");
        }
    }

    async delete(brandId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/brands/${brandId}`);
        } catch (error: any) {
            console.error(
                `Error deleting brand ${brandId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to delete brand");
        }
    }

    async generateFromAssets(
        request: GenerateBrandFromAssetsRequest
    ): Promise<Brand> {
        try {
            const response = await this.apiClient.post<{ data: Brand }>(
                "/brands/generate",
                request
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error generating brand from assets:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to generate brand");
        }
    }

    async updateWithAsset(brandId: string, assetId: string): Promise<Brand> {
        try {
            const response = await this.apiClient.post<{ data: Brand }>(
                `/brands/${brandId}/add-asset`,
                { assetId }
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error updating brand ${brandId} with asset:`,
                error.response?.data || error.message
            );
            throw (
                error.response?.data || new Error("Failed to update brand with asset")
            );
        }
    }

    async share(brandId: string, userEmails: string[]): Promise<Brand> {
        try {
            const response = await this.apiClient.post<{ data: Brand }>(
                `/brands/${brandId}/share`,
                { userEmails }
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error sharing brand ${brandId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to share brand");
        }
    }

    async uploadDocumentsAndGenerate(
        files: File[],
        brandName: string
    ): Promise<Brand> {
        try {
            const assetIds = await this.uploadFilesAsAssets(files);
            console.log(assetIds, 'the asset ids');
            if (!assetIds.length) {
                throw new Error("No assets were created from the uploaded files");
            }
            return this.generateFromAssets({ assetIds, brandName });
        } catch (error: any) {
            console.error(
                "Error uploading documents and generating brand:",
                error.response?.data || error.message
            );
            throw (
                error.response?.data ||
                new Error("Failed to upload documents and generate brand")
            );
        }
    }

    // /**
    //  * Helper function to upload multiple files as assets
    //  * @param files - Array of files to upload
    //  * @returns Array of created asset IDs
    //  */
    async uploadFilesAsAssets(files: File[]): Promise<string[]> {
        try {
            const uploadPromises = files.map((file) => this.uploadFileAsAsset(file));
            const results = await Promise.all(uploadPromises);
            return results.filter((id) => id !== null) as string[];
        } catch (error) {
            console.error("Error uploading files as assets:", error);
            throw new Error("Failed to upload files as assets");
        }
    }

    // /**
    //  * Helper function to upload a single file as an asset
    //  * @param file - File to upload
    //  * @returns Created asset ID or null if upload failed
    //  */
    async uploadFileAsAsset(file: File): Promise<string | null> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name);

            // Include optional metadata
            const tags = ["brand-generation", "auto-upload"];
            formData.append("tags", JSON.stringify(tags));

            // Get userId from localStorage - critical for asset creation
            const token = this.getAuthToken();
            let userId = "";
            if (token) {
                try {
                    // Decode the JWT to get the user ID
                    const decoded = JSON.parse(atob(token.split(".")[1]));
                    userId = decoded.id || decoded.userId || decoded.sub;
                } catch (e) {
                    console.error("Error decoding token to get userId:", e);
                }
            }

            // Include the userId which is required by the backend
            if (userId) {
                formData.append("userId", userId);
            } else {
                console.error("No userId available for asset upload");
            }

            const response = await this.apiClient.post("/assets/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data._id;
        } catch (error) {
            console.error("Error uploading file:", file.name, error);
            return null;
        }
    }

      async getPaginated(
        page: number = 1,
        limit: number = 10,
        filters: Record<string, string | number | boolean> = {},
      ): Promise<{
        brands: Brand[];
        totalBrands: number;
        totalPages: number;
        currentPage: number;
      }> {
        try {
    
          const params = new URLSearchParams();
          params.append("page", page.toString());
          params.append("limit", limit.toString());
    
          // Add any filters to the query params
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          });
    
          const response = await this.apiClient.get<{
            brands: Brand[];
            totalBrands: number;
            totalPages: number;
            currentPage: number;
          }>(`/brands/paginated?${params.toString()}`);

          return {
            brands: response.data.brands,
            totalBrands: response.data.totalBrands,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(
            "Error fetching paginated templates:",
            errorMessage
          );
          throw new Error("Failed to fetch paginated templates");
        }
      }
}