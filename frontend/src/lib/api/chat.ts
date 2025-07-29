import { Axios } from "axios";
import { ChatSession } from "../types/api";
import { APIBase } from "./base";

export class ChatSessionAPI extends APIBase
// implements ChatAPIService
{
    API_URL: string = "/api/chat";
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }

    async getAll(): Promise<ChatSession[]> {
        try {
            const response = await this.apiClient.get<ChatSession[]>(
                "/chat/sessions"
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Error fetching chat sessions:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch chat sessions");
        }
    }

    async getById(chatSessionId: string): Promise<ChatSession> {
        try {
            const response = await this.apiClient.get<ChatSession>(
                `/chat/sessions/${chatSessionId}`
            );
            return response.data;
        } catch (error: any) {
            console.error(
                `Error fetching chat session ${chatSessionId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch chat session");
        }
    }

    async create(data: Partial<ChatSession>): Promise<ChatSession> {
        try {
            const response = await this.apiClient.post<ChatSession>(
                "/chat/sessions",
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

    async update(chatSessionId: string, data: Partial<ChatSession>): Promise<ChatSession> {
        try {
            const response = await this.apiClient.put<ChatSession>(
                `/chat/sessions/${chatSessionId}`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(
                `Error updating chat session ${chatSessionId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to update chat session");
        }
    }

    async delete(chatSessionId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/chat/sessions/${chatSessionId}`);
        } catch (error: any) {
            console.error(
                `Error deleting chat session ${chatSessionId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to delete chat session");
        }
    }
}