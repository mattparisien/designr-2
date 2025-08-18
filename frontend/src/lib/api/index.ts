import axios, { AxiosError, InternalAxiosRequestConfig, AxiosInstance, AxiosRequestHeaders } from "axios";
import { Asset } from "@/lib/types/api/asset";
import { AIAPI } from "./ai";
import { AuthAPI } from "./auth";
import { BrandsAPI } from "./brands";
import { ChatSessionAPI } from "./chat";
import { CollectionAPI } from "./collection";
import { FontsAPI } from "./fonts";
import { ProjectsAPI } from "./projects";
import { TemplatesAPI } from "./templates";
import { UsersAPI } from "./user";

// If you eventually add a composition type, import it here. For now create a minimal placeholder to keep existing code compiling.
export interface Composition {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to get the auth token from localStorage
const getAuthToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

// Create an Axios instance with default headers
export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
});

// Add request interceptor to automatically add auth headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      // Ensure headers is a mutable object of AxiosRequestHeaders
      const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Helper to coerce AxiosInstance to legacy Axios type expected by existing service classes
// (Their files import { Axios } from 'axios'). This preserves strictness without any.
// When services are refactored to accept AxiosInstance, remove this.
const asAxios = (client: AxiosInstance) => client as unknown as import('axios').Axios;

// Instantiate concrete service classes directly (simpler than generic factory, avoids constructor mismatch typing issues)
const brandsAPI = new BrandsAPI(asAxios(apiClient));
const projectsAPI = new ProjectsAPI(asAxios(apiClient));
const usersAPI = new UsersAPI(asAxios(apiClient));
const templatesAPI = new TemplatesAPI(asAxios(apiClient));
const chatSessionAPI = new ChatSessionAPI(asAxios(apiClient));
const aiAPI = new AIAPI(asAxios(apiClient));

// Collections (keep strong typing for keys / filters)
const assetsAPI = new CollectionAPI<
  Asset,
  "assets",
  "totalAssets",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
>(asAxios(apiClient), "/assets", { list: "assets", total: "totalAssets" });

// Placeholder composition collection until a real type is added
const compositionAPI = new CollectionAPI<
  Composition,
  "compositions",
  "totalCompositions",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
>(asAxios(apiClient), "/compositions", { list: "compositions", total: "totalCompositions" });

const authAPI = new AuthAPI(asAxios(apiClient));
const fontsAPI = new FontsAPI(asAxios(apiClient));

export {
  aiAPI,
  assetsAPI,
  authAPI,
  brandsAPI,
  chatSessionAPI,
  compositionAPI,
  fontsAPI,
  projectsAPI,
  templatesAPI,
  usersAPI,
};

