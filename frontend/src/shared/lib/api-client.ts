import { config } from '@/config/env';
import { ApiResponse } from '../types';

const TOKEN_KEY = 'gdg_auth_token';

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string = config.apiUrl) {
    this.baseUrl = baseUrl;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private onRefreshed(newToken: string): void {
    this.refreshSubscribers.forEach((callback) => callback(newToken));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Includes HTTP-only refresh cookies
      });

      // Handle 401 Unauthorized - Attempt Refresh if not already refreshing or calling auth endpoints
      if (
        response.status === 401 &&
        !isRetry &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/google') &&
        !endpoint.includes('/auth/refresh')
      ) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            if (refreshRes.ok) {
              const refreshJson = await refreshRes.json();
              const newAccessToken = refreshJson.data?.tokens?.accessToken;
              if (newAccessToken) {
                this.setToken(newAccessToken);
                this.isRefreshing = false;
                this.onRefreshed(newAccessToken);

                // Retry original request
                return this.request<T>(endpoint, options, true);
              }
            }
          } catch (refreshErr) {
            console.warn('[ApiClient] Silent token refresh failed:', refreshErr);
          }

          this.isRefreshing = false;
          this.setToken(null);
        } else {
          // Wait for current refresh to finish
          return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.addRefreshSubscriber((newToken) => {
              const retryOptions = {
                ...options,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };
              this.request<T>(endpoint, retryOptions, true)
                .then(resolve)
                .catch(reject);
            });
          });
        }
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json as ApiResponse<T>;
    } catch (error) {
      console.warn(`[ApiClient] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
