const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types for API data
interface ElementStyle {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

interface TemplateElement {
  type: string;
  content?: string;
  style?: ElementStyle;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface TemplateData {
  elements: TemplateElement[];
  [key: string]: unknown;
}

interface AIContent {
  headline: string;
  bodyText: string;
  callToAction: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = null;
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Brand endpoints
  async getBrands() {
    return this.request('/brand');
  }

  async getBrand(id: string) {
    return this.request(`/brand/${id}`);
  }

  async createBrand(brandData: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    vibe: string;
    voice: string;
    personality: string;
    targetAudience: string;
    toneGuidelines: string;
    keyValues: string;
    communicationStyle: string;
    industry?: string;
    tagline?: string;
    doNotUse?: string;
    preferredWords?: string[];
    avoidedWords?: string[];
  }) {
    return this.request('/brand', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  async updateBrand(id: string, brandData: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    vibe?: string;
    voice?: string;
    personality?: string;
    targetAudience?: string;
    toneGuidelines?: string;
    keyValues?: string;
    communicationStyle?: string;
    industry?: string;
    tagline?: string;
    doNotUse?: string;
    preferredWords?: string[];
    avoidedWords?: string[];
  }) {
    return this.request(`/brand/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  }

  async deleteBrand(id: string) {
    return this.request(`/brand/${id}`, {
      method: 'DELETE',
    });
  }

  // Template endpoints
  async getTemplates(params?: { vibe?: string; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.vibe) searchParams.set('vibe', params.vibe);
    if (params?.category) searchParams.set('category', params.category);
    
    const query = searchParams.toString();
    return this.request(`/templates${query ? `?${query}` : ''}`);
  }

  async getTemplate(id: string) {
    return this.request(`/templates/${id}`);
  }

  // AI endpoints
  async magicFill(data: { 
    prompt: string; 
    vibe?: string; 
    brandContext?: {
      name: string;
      industry?: string;
      tagline?: string;
      voice?: string;
      personality?: string;
      targetAudience?: string;
      toneGuidelines?: string;
      keyValues?: string;
      communicationStyle?: string;
      doNotUse?: string;
      preferredWords?: string[];
      avoidedWords?: string[];
    } | string; 
    currentContent?: TemplateElement[] 
  }) {
    return this.request('/ai/magic-fill', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateVariations(data: { baseContent: AIContent; vibe?: string; count?: number }) {
    return this.request('/ai/variations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Export endpoints
  async resizeTemplate(data: { templateData: TemplateData; targetWidth?: number; targetHeight?: number }) {
    return this.request('/export/resize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportPNG(data: { templateData: TemplateData; includeWatermark?: boolean }) {
    const response = await fetch(`${this.baseUrl}/export/png`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Stripe endpoints
  async createCheckoutSession() {
    return this.request('/stripe/create-checkout-session', {
      method: 'POST',
    });
  }

  async getCustomerPortal() {
    return this.request('/stripe/customer-portal', {
      method: 'POST',
    });
  }

  // Telemetry
  async trackEvent(data: { event: string; data?: Record<string, unknown>; sessionId?: string }) {
    return this.request('/telemetry/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Font management
  async uploadFont(fontFile: File, fontFamily: string, isPublic: boolean = false) {
    const formData = new FormData();
    formData.append('font', fontFile);
    formData.append('fontFamily', fontFamily);
    formData.append('isPublic', isPublic.toString());

    const response = await fetch(`${this.baseUrl}/fonts/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type header for FormData, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Font upload failed');
    }

    return response.json();
  }

  async getFonts() {
    return this.request('/fonts', {
      method: 'GET',
    });
  }

  async deleteFont(fontId: string) {
    return this.request(`/fonts/${fontId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
