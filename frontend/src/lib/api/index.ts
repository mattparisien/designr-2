import axios, { Axios, AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIService, Asset, Composition } from "../types/api";
import { AIAPI } from "./ai";
import { AuthAPI } from "./auth";
import { BrandsAPI } from "./brands";
import { ChatSessionAPI } from "./chat";
import { CollectionAPI } from "./collection";
import { FontsAPI } from "./fonts";
import { ProjectsAPI } from "./projects";
import { TemplatesAPI } from "./templates";
import { UsersAPI } from "./user";

function createAPIService<T, S extends APIService<T>>(
  ctor: new (client: Axios) => S,
  client: Axios
): S {
  return new ctor(client);
}

// Helper to get the auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Create an Axios instance with default headers
export const apiClient = axios.create({
  baseURL: "/api",
});

// Add request interceptor to automatically add auth headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// const assetsAPI = createAPIService(AssetsAPI, apiClient);
const brandsAPI = createAPIService(BrandsAPI, apiClient);
const projectsAPI = createAPIService(ProjectsAPI, apiClient);
const usersAPI = createAPIService(UsersAPI, apiClient);
const templatesAPI = createAPIService(TemplatesAPI, apiClient);
const chatSessionAPI = createAPIService(ChatSessionAPI, apiClient);
const aiAPI = new AIAPI(apiClient);
// Backend actually serves them under /api/projects
// const projectsAPI = new CollectionAPI<
//   Project,
//   "projects",
//   "totalProjects",
//   { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
// >(apiClient, "/projects", { list: "projects", total: "totalProjects" });


const assetsAPI = new CollectionAPI<
  Asset,
  "assets",
  "totalAssets",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
>(apiClient, "/assets", { list: "assets", total: "totalAssets" });

const compositionAPI = new CollectionAPI<
  Composition,
  "compositions",
  "totalCompositions",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
>(apiClient, "/compositions", { list: "compositions", total: "totalCompositions" });


// const assetsAPI = new CollectionAPI<
//   Asset,
//   "assets",
//   "totalAssets",
//   { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
// >(apiClient, "/assets", { list: "assets", total: "totalAssets" });


const authAPI = new AuthAPI(apiClient);
const fontsAPI = new FontsAPI(apiClient);

export { aiAPI, assetsAPI, authAPI, brandsAPI, chatSessionAPI, compositionAPI, fontsAPI, projectsAPI, templatesAPI, usersAPI };

