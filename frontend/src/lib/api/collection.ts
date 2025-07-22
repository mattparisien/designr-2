// src/lib/api/collection.ts (rename if you want to keep CompositionAPI name)
import { Axios } from "axios";
import { APIBase } from "./base";

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

export type AnyFilters = Record<string, string | number | boolean | undefined | null>;

export class CollectionAPI<
  TItem,
  TListKey extends string = "items",
  TTotalKey extends string = "totalItems",
  TFilters extends AnyFilters = AnyFilters
> extends APIBase {
  constructor(
    protected client: Axios,
    /** e.g. "/api/templates" | "/api/projects" */
    protected baseUrl: string,
    /** backend response keys */
    protected keys: { list: TListKey; total: TTotalKey }
  ) {
    super();
  }

  // ---------- utils ----------
  protected handleError(error: unknown, context: string): never {
    const apiError = error as APIError;
    console.error(`${context}:`, apiError.response?.data || apiError.message);
    throw apiError.response?.data || new Error(context);
  }

  protected qs(params: AnyFilters = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) sp.append(k, String(v));
    });
    return sp;
  }

  // ---------- CRUD ----------
  async getAll(params?: TFilters): Promise<TItem[]> {
    try {
      const query = this.qs(params);
      const { data } = await this.client.get<TItem[]>(
        query.size ? `${this.baseUrl}?${query}` : this.baseUrl
      );
      return data;
    } catch (e) {
      this.handleError(e, `Failed to fetch from ${this.baseUrl}`);
    }
  }

  async getById(id: string): Promise<TItem> {
    try {
      const { data } = await this.client.get<TItem>(`${this.baseUrl}/${id}`);
      return data;
    } catch (e) {
      this.handleError(e, `Failed to fetch ${id}`);
    }
  }

  async create(payload: Partial<TItem>): Promise<TItem> {
    try {
      const { data } = await this.client.post<TItem>(this.baseUrl, payload);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to create item");
    }
  }

  async update(id: string, payload: Partial<TItem>): Promise<TItem> {
    try {
      const { data } = await this.client.put<TItem>(`${this.baseUrl}/${id}`, payload);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to update item");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`${this.baseUrl}/${id}`);
    } catch (e) {
      this.handleError(e, "Failed to delete item");
    }
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      await this.client.delete(`${this.baseUrl}/bulk`, { data: { ids } });
    } catch (e) {
      this.handleError(e, "Failed to bulk delete items");
    }
  }

  // ---------- Pagination ----------
  async getPaginated(
    page = 1,
    limit = 10,
    filters: TFilters = {} as TFilters
  ): Promise<PaginatedResult<TItem>> {
    try {
      const params = this.qs({ page, limit, ...filters });
      const { data } = await this.client.get<Record<string, any>>(
        `${this.baseUrl}/paginated?${params.toString()}`
      );

      return {
        items: data[this.keys.list] as TItem[],
        totalItems: data[this.keys.total] as number,
        totalPages: data.totalPages as number,
        currentPage: data.currentPage as number,
      };
    } catch (e) {
      this.handleError(e, "Failed to fetch paginated items");
    }
  }

  // ---------- Extras (optional) ----------
  async getFeatured(): Promise<TItem[]> {
    try {
      const { data } = await this.client.get<TItem[]>(`${this.baseUrl}/featured`);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch featured items");
    }
  }

  async getPopular(): Promise<TItem[]> {
    try {
      const { data } = await this.client.get<TItem[]>(`${this.baseUrl}/popular`);
      return data;
    } catch (e) {
      this.handleError(e, "Failed to fetch popular items");
    }
  }
}
