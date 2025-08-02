import { Axios } from 'axios';
import { APIService, Template, TemplatePreset } from '../types/api';
import { APIBase } from './base';

// Utility type for API error handling
interface APIError {
  response?: {
    data?: unknown;
  };
  message: string;
}

// Return type for template usage
interface TemplateUsageResult {
  projectId: string;
  message: string;
}

export class TemplatesAPI extends APIBase implements APIService<Template> {

  API_URL: string = '/api/templates';
  apiClient: Axios; // Assuming apiClient is an instance of Axios or similar HTTP client

  constructor(apiClient: Axios) {
    super();
    this.apiClient = apiClient;
  }

  // Helper method to handle API errors consistently
  private handleError(error: unknown, context: string): never {
    const apiError = error as APIError;
    console.error(`${context}:`, apiError.response?.data || apiError.message);
    throw apiError.response?.data || new Error(context);
  }

  // Get all templates
  async getAll(params?: { category?: string; type?: string; featured?: boolean; popular?: boolean; tags?: string[] }): Promise<Template[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
      if (params?.popular !== undefined) queryParams.append('popular', params.popular.toString());
      if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));

      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await this.apiClient.get<Template[]>(`/templates${query}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch templates');
    }
  }

  // Get template by ID
  async getById(id: string): Promise<Template> {
    try {
      const response = await this.apiClient.get<Template>(`/templates/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch template');
    }
  }

  // Get featured templates
  async getFeatured(): Promise<Template[]> {
    try {
      const response = await this.apiClient.get<Template[]>('/templates/featured');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch featured templates');
    }
  }

  // Get popular templates
  async getPopular(): Promise<Template[]> {
    try {
      const response = await this.apiClient.get<Template[]>('/templates/popular');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch popular templates');
    }
  }

  // Get templates by category
  async getByCategory(category: string): Promise<Template[]> {
    try {
      const response = await this.apiClient.get<Template[]>(`/templates/category/${category}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch templates by category');
    }
  }

  // Get template presets
  async getPresets(): Promise<TemplatePreset[]> {
    try {
      const response = await this.apiClient.get<TemplatePreset[]>('/templates/presets');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch template presets');
    }
  }

  // Create new template
  async create(data: Partial<Template>): Promise<Template> {
    try {
      const response = await this.apiClient.post<Template>('/templates', data);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create template');
    }
  }

  // Create template from existing project
  async createFromProject(projectId: string, data: { slug: string, categories?: string[], tags?: string[] }): Promise<Template> {
    try {
      const response = await this.apiClient.post<Template>(`/templates/from-project/${projectId}`, data);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create template from project');
    }
  }

  // Use a template to create a project
  async use(templateId: string, ownerId: string): Promise<TemplateUsageResult> {
    try {
      const response = await this.apiClient.post(`/templates/${templateId}/use`, { ownerId });
      return response.data;
    } catch (error: unknown) {
      const apiError = error as APIError;
      console.error(`Error using template ${templateId}:`, apiError.response?.data || apiError.message);
      throw apiError.response?.data || new Error('Failed to use template');
    }
  }

  // Update template
  async update(id: string, data: Partial<Template>): Promise<Template> {
    try {
      const response = await this.apiClient.put<Template>(`/templates/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update template');
    }
  }

  // Delete template
  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/templates/${id}`);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete template');
    }
  }

  // Delete multiple templates
  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      await this.apiClient.delete('/templates/bulk', { data: { ids } });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting multiple templates:', errorMessage);
      throw new Error('Failed to delete multiple templates');
    }
  }


  async getPaginated(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, string | number | boolean> = {},
  ): Promise<{
    templates: Template[];
    totalTemplates: number;
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
        templates: Template[];
        totalTemplates: number;
        totalPages: number;
        currentPage: number;
      }>(`/templates/paginated?${params.toString()}`);

      return {
        templates: response.data.templates,
        totalTemplates: response.data.totalTemplates,
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