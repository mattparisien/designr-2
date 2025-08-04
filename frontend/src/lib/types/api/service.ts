import { Axios } from "axios";
import { type Brand } from "../brands";
import { type Template } from "./template";
import { type DesignProject as Project } from "@shared/types";


/**
 * User interface representing a registered user in the system.
 */
export interface User {
    _id: string;                 // Unique identifier for the user
    name: string;                // User's full name
    email: string;               // User's email address (unique)
    company?: string;            // Optional company affiliation
    location?: string;           // Optional location information
    bio?: string;                // Optional user biography
    joinedAt: string;            // ISO timestamp of when the user registered
    profilePictureUrl?: string;  // Optional profile picture URL
}

/**
 * Authentication response object returned after successful login or registration.
 */
export interface AuthResponse {
    user: User;                  // User object with profile information
    token: string;               // JWT authentication token for subsequent API calls
}

/**
 * Payload for updating a user's profile information.
 */
export interface UpdateProfilePayload {
    name?: string;               // Updated name (optional)
    company?: string;            // Updated company (optional)
    location?: string;           // Updated location (optional)
    bio?: string;                // Updated biography (optional)
    currentPassword?: string;    // Current password (required for password changes)
    newPassword?: string;        // New password (for password changes)
}

/**
 * Response after successfully uploading a profile picture.
 */
export interface ProfilePictureUploadResponse {
    message: string;             // Success message
    profilePictureUrl: string;   // URL of the uploaded profile picture
    fileInfo?: any;              // Additional file information
}


/**
 * Base interface for all API services with common authentication functionality.
 */
export interface APIServiceBase {
    /**
     * Retrieves the authentication token from storage.
     * @returns The stored JWT token or null if not authenticated
     */
    getAuthToken: () => string | null;
}

/**
 * Generic API service interface providing standard CRUD operations.
 * @template T - The data type managed by this API service
 */
export interface APIService<T> extends APIServiceBase {
    API_URL: string;             // Base URL for the API endpoint
    apiClient: Axios;            // Axios client instance for making HTTP requests

    /**
     * Retrieves all records of type T.
     * @param args - Optional arguments for filtering (implementation-specific)
     * @returns Promise resolving to an array of T objects
     */
    getAll: (...args: any[]) => Promise<T[]>;

    /**
     * Retrieves a specific record by its ID.
     * @param id - The unique identifier of the record
     * @returns Promise resolving to the requested T object
     */
    getById: (id: string) => Promise<T>;

    /**
     * Creates a new record.
     * @param data - The data for creating the new record
     * @returns Promise resolving to the created T object
     */
    create: (data: Partial<T>) => Promise<T>;

    /**
     * Updates an existing record.
     * @param id - The unique identifier of the record to update
     * @param data - The data to update
     * @returns Promise resolving to the updated T object
     */
    update: (id: string, data: Partial<T>) => Promise<T>;

    /**
     * Deletes a record by ID.
     * @param id - The unique identifier of the record to delete
     * @returns Promise resolving when deletion is complete
     */
    delete: (id: string) => Promise<void>;
    /**
     * Deletes multiple records by their IDs.
     * @param ids - Array of unique identifiers for the records to delete
     * @returns Promise resolving when deletion is complete
     */
    deleteMultiple?: (ids: string[]) => Promise<void>;
}

/**
 * Constructor interface for API services.
 * @template T - The data type managed by this API service
 */
export interface APIServiceConstructor<T> {
    new(apiClient: Axios): APIService<T>;
}


/**
 * Request for generating a brand from uploaded assets.
 */
export interface GenerateBrandFromAssetsRequest {
    assetIds: string[];          // IDs of assets to use for brand generation
    brandName: string;           // Name of the brand to be created
}

/**
 * Extended API service for brand-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface BrandsAPIService extends APIService<Brand> {
    /**
     * Generates a new brand using AI based on uploaded assets.
     * @param request - Contains brand name and IDs of assets to analyze
     * @returns Promise resolving to the generated Brand object
     */
    generateFromAssets(request: GenerateBrandFromAssetsRequest): Promise<Brand>;
}

/**
 * Extended API service for project-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface ProjectsAPIService extends APIService<Project> {
    /**
     * Creates a copy of an existing project.
     * @param id - ID of the project to clone
     * @param ownerId - ID of the user who will own the cloned project
     * @returns Promise resolving to the cloned Project object
     */
    clone: (id: string, ownerId: string) => Promise<Project>;

    /**
     * Toggles whether a project is a template.
     * @param id - ID of the project to update
     * @param isTemplate - Whether the project should be a template
     * @returns Promise resolving to the updated Project object
     */
    toggleTemplate: (id: string, isTemplate: boolean) => Promise<Project>;

    /**
     * Retrieves all templates, optionally filtered by category and type.
     * @param category - Optional category to filter templates by
     * @param type - Optional type to filter templates by
     * @returns Promise resolving to an array of matching templates
     */
    getTemplates: (category?: string, type?: string) => Promise<Project[]>;

    /**
     * Retrieves a paginated list of projects with filtering capabilities.
     * @param page - The page number to retrieve
     * @param limit - Number of projects per page
     * @param filters - Object containing filter criteria
     * @returns Promise resolving to paginated results with metadata
     */
    getPaginated: (
        page: number,
        limit: number,
        filters: Record<string, any>
    ) => Promise<{
        projects: Project[];       // Array of projects for current page
        totalProjects: number;     // Total number of projects matching filters
        totalPages: number;        // Total number of pages available
        currentPage: number;       // Current page number
    }>;
}

/**
 * Extended API service for template-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export type TemplatesAPIService = APIService<Template>

/**
 * Extended API service for user-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface UsersAPIService extends APIService<User> {
    /**
     * Retrieves the current user's profile information.
     * @returns Promise resolving to the User object representing the profile
     */
    getProfile: () => Promise<User>;

    /**
     * Updates the current user's profile information.
     * @param data - Object containing updated profile data
     * @returns Promise resolving to the updated User object
     */
    updateProfile: (data: UpdateProfilePayload) => Promise<User>;

    /**
     * Uploads a new profile picture for the user.
     * @param formData - FormData object containing the image file
     * @returns Promise resolving to the upload response
     */
    uploadProfilePicture: (formData: FormData) => Promise<ProfilePictureUploadResponse>;
}

export interface AuthAPIService {
    /**
     * Authenticates a user and retrieves a JWT token.
     * @param email - User's email address
     * @param password - User's password
     * @returns Promise resolving to an AuthResponse object containing user info and token
     */
    login: (email: string, password: string) => Promise<AuthResponse>;


    /**
     * Registers a new user and retrieves a JWT token.
     * @param name - User's full name
     * @param email - User's email address
     * @param password - User's password
     * @returns Promise resolving to an AuthResponse object containing user info and token
     */
    register: (name: string, email: string, password: string) => Promise<AuthResponse>;

    /**
     * Verifies the user's token and retrieves user information.
     * @param token - JWT token to verify
     * @returns Promise resolving to a User object
     */
    verifyToken: (token?: string) => Promise<User>;

    /**
     * Logs out the user by clearing the authentication token.
     * @returns Promise resolving when logout is complete
     */

    logout: () => Promise<void>;
}