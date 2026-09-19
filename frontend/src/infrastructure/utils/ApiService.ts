export interface ApiOptions extends RequestInit {
    headers?: Record<string, string>;
}

export class ApiService {
    // Safely detect environment variables across Vite, Webpack, or fallback to default
    private baseUrl: string =
        (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
        'http://localhost:8080';

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        try {
            const url = endpoint.startsWith('http')
                ? endpoint
                : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    ...(options.headers || {}),
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Api Error ${response.status}: ${errorBody}`);
            }

            return response.json();
        } catch (error: any) {
            throw new Error(error?.message || String(error));
        }
    }

    async get<T>(endpoint: string, options: ApiOptions = {}): Promise<{
        success: boolean;
        response?: T;
        failure: boolean;
        error?: string;
    }> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET'
        }).then((resp) => ({
            success: true,
            response: resp,
            failure: false
        }))
            .catch((error: any) => ({
                success: false,
                failure: true,
                error: `Network Error: ${error?.message || String(error)}`
            }));
    }

    async post<T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<{
        success: boolean;
        response?: T;
        failure: boolean;
        error?: string;
    }> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        }).then((resp) => ({
            success: true,
            response: resp,
            failure: false
        }))
            .catch((error: any) => ({
                success: false,
                failure: true,
                error: `Network Error: ${error?.message || String(error)}`
            }));
    }
}

export const apiService = new ApiService();