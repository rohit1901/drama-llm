// API Client Configuration for Drama LLM Backend

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: any[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem("auth_token");
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(contentType: string = "application/json"): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": contentType,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.error || "An error occurred",
          response.status,
          errorData.errors,
        );
      } else {
        throw new ApiError(
          `HTTP Error ${response.status}: ${response.statusText}`,
          response.status,
        );
      }
    }

    if (isJson) {
      return await response.json();
    }

    return response.text() as any;
  }

  public async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  public async post<T>(
    endpoint: string,
    data?: any,
    contentType: string = "application/json",
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(contentType),
      body: contentType === "application/json" ? JSON.stringify(data) : data,
    });

    return this.handleResponse<T>(response);
  }

  public async put<T>(
    endpoint: string,
    data?: any,
    contentType: string = "application/json",
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(contentType),
      body: contentType === "application/json" ? JSON.stringify(data) : data,
    });

    return this.handleResponse<T>(response);
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  public async patch<T>(
    endpoint: string,
    data?: any,
    contentType: string = "application/json",
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(contentType),
      body: contentType === "application/json" ? JSON.stringify(data) : data,
    });

    return this.handleResponse<T>(response);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
