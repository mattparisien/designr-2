import axios, { Axios, AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIService, Project, Template } from "../types/api";
import { AssetsAPI } from "./assets";
import { AuthAPI } from "./auth";
import { BrandsAPI } from "./brands";
import { CollectionAPI } from "./collection";
import { FontsAPI } from "./fonts";
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

const assetsAPI = createAPIService(AssetsAPI, apiClient);
const brandsAPI = createAPIService(BrandsAPI, apiClient);
// const projectsAPI = createAPIService(ProjectsAPI, apiClient);
const usersAPI = createAPIService(UsersAPI, apiClient);
// const templatesAPI = createAPIService(TemplatesAPI, apiClient);
// Backend actually serves them under /api/projects
const templatesAPI = new CollectionAPI<
  Template,
  "templates",
  "totalTemplates",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string; featured?: boolean; popular?: boolean }
>(apiClient, "/templates", { list: "templates", total: "totalTemplates" });

const projectsAPI = new CollectionAPI<
  Project,
  "projects",
  "totalProjects",
  { starred?: boolean; shared?: boolean; search?: string; type?: string; category?: string }
>(apiClient, "/api/projects", { list: "projects", total: "totalProjects" });

const authAPI = new AuthAPI(apiClient);
const fontsAPI = new FontsAPI(apiClient);

export { assetsAPI, authAPI, brandsAPI, fontsAPI, projectsAPI, templatesAPI, usersAPI };
