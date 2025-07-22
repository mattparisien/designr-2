// src/lib/api/composition.ts
import { Axios } from "axios";
import { APIBase } from "./base";
import { Composition } from "../types/api";

interface APIError {
  response?: { data?: unknown };
  message: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

type Filters = Record<string, string | number | boolean | undefined | null>;

export class CompositionAPI extends APIBase {
  constructor(
    private client: Axios,
    /** e.g. "/api/compositions" or "/api/projects" */
    private baseUrl: string,
    /** backend keys for list + total */
    private keys: { list: string; total: string } = {
      list: "compositions",
      total: "totalCompositions",
    }
  ) {
    super();
  }

  private handleError(error: unknown, context: string): never {
    const apiError = error as APIError;
    console.error(`${context}:`, apiError.response?.data || apiError.message);
    throw apiError.response?.data || new Error(context);
  }

  // ---------- helpers ----------
  private qs(params: Filters = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) sp.append(k, String(v));
    });
    return sp;
  }

  // ---------- CRUD ----------
  async getAll(params?: Filters): Promise<Composition[]> {
    try {
      const query = this.qs(params);
      const { data } = await this.client.get<Composition[]>(
        query.size ? `${this.baseUrl}?${query}` : this.baseUrl
      );
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch compositions");
    }
  }

  async getById(id: string): Promise<Composition> {
    try {
      const { data } = await this.client.get<Composition>(`${this.baseUrl}/${id}`);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch composition");
    }
  }

  async create(payload: Partial<Composition>): Promise<Composition> {
    try {
      const { data } = await this.client.post<Composition>(this.baseUrl, payload);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to create composition");
    }
  }

  async update(id: string, payload: Partial<Composition>): Promise<Composition> {
    try {
      const { data } = await this.client.put<Composition>(
        `${this.baseUrl}/${id}`,
        payload
      );
      return data;
    } catch (e) {
      this.handleError(e, "Failed to update composition");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`${this.baseUrl}/${id}`);
    } catch (e) {
      this.handleError(e, "Failed to delete composition");
    }
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      await this.client.delete(`${this.baseUrl}/bulk`, { data: { ids } });
    } catch (e) {
      this.handleError(e, "Failed to bulk delete compositions");
    }
  }

  // ---------- Paginated ----------
  async getPaginated(
    page = 1,
    limit = 10,
    filters: Filters = {}
  ): Promise<PaginatedResult<Composition>> {
    try {
      const params = this.qs({ page, limit, ...filters });
      const { data } = await this.client.get<Record<string, any>>(
        `${this.baseUrl}/paginated?${params.toString()}`
      );

      return {
        items: data[this.keys.list],
        totalItems: data[this.keys.total],
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    } catch (e) {
      this.handleError(e, "Failed to fetch paginated compositions");
    }
  }

  // ----- Extras you might need -----

  async getFeatured(): Promise<Composition[]> {
    try {
      const { data } = await this.client.get<Composition[]>(
        `${this.baseUrl}/featured`
      );
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch featured compositions");
    }
  }

  async getPopular(): Promise<Composition[]> {
    try {
      const { data } = await this.client.get<Composition[]>(
        `${this.baseUrl}/popular`
      );
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch popular compositions");
    }
  }
}
