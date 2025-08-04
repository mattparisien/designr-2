import { Axios } from "axios";
import { ProjectsAPIService } from "../types/api";
import { APIBase } from "./base";
import { DesignProject as Project } from "@shared/types";

export class ProjectsAPI extends APIBase implements ProjectsAPIService {
    API_URL: string = "/projects";
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }

    async getAll(): Promise<Project[]> {
        try {
            const response = await this.apiClient.get<Project[]>(
                "/projects"
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Error fetching projects:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch projects");
        }
    }

    async getById(projectId: string): Promise<Project> {
        try {
            const response = await this.apiClient.get<Project>(
                `/projects/${projectId}`
            );
            return response.data;
        } catch (error: any) {
            console.error(
                `Error fetching project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch project");
        }
    }

    async create(data: Partial<Project>): Promise<Project> {
        try {
            const response = await this.apiClient.post<Project>(
                "/projects",
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Error creating project:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to create project");
        }
    }

    async update(projectId: string, data: Partial<Project>): Promise<Project> {
        try {
            const response = await this.apiClient.put<Project>(
                `/projects/${projectId}`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(
                `Error updating project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to update project");
        }
    }

    async delete(projectId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/projects/${projectId}`);
        } catch (error: any) {
            console.error(
                `Error deleting project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to delete project");
        }
    }

    async deleteMultiple(ids: string[]): Promise<void> {
        try {
            const response = await this.apiClient.delete<void>(
                "/projects/bulk",
                { data: { ids } }
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Error deleting multiple projects:",
                error.response?.data || error.message
            );

            throw error.response?.data || new Error("Failed to delete projects");
        }
    }




    async getPaginated(
        page: number = 1,
        limit: number = 10,
        filters: Record<string, any> = {},
    ): Promise<{
        projects: Project[];
        totalProjects: number;
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
                projects: Project[];
                totalProjects: number;
                totalPages: number;
                currentPage: number;
            }>(`/projects/paginated?${params.toString()}`);

            return {
                projects: response.data.projects,
                totalProjects: response.data.totalProjects,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage,
            };
        } catch (error: any) {
            console.error(
                "Error fetching paginated projects:",
                error.response?.data || error.message
            );
            throw (
                error.response?.data || new Error("Failed to fetch paginated projects")
            );
        }
    }

}