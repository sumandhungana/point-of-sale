export interface ApiOptions extends RequestInit {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiResponse<T> {
    success: boolean;
    response?: T;
    failure: boolean;
    error?: string;
}

export class ApiService {
    // Safely detect environment variables across Vite, Webpack, or fallback to default
    private baseUrl: string =
        (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
        'http://localhost:8080';
    // Helper method to append query parameters to endpoint string
    private buildUrlWithParams(endpoint: string, params?: Record<string, any>): string {
        if (!params || Object.keys(params).length === 0) {
            return endpoint;
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        if (!queryString) return endpoint;

        const separator = endpoint.includes('?') ? '&' : '?';
        return `${endpoint}${separator}${queryString}`;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        try {
            // Extract params from options before passing options to fetch
            const { params, ...fetchOptions } = options;
            const endpointWithParams = this.buildUrlWithParams(endpoint, params);

            const url = endpointWithParams.startsWith('http')
                ? endpointWithParams
                : `${this.baseUrl}${endpointWithParams.startsWith('/') ? '' : '/'}${endpointWithParams}`;
            // const url = endpoint.startsWith('http')
            //     ? endpoint
            //     : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

            const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
            const defaultHeaders: Record<string, string> = {
                "X-Requested-With": "XMLHttpRequest",
            };
            if (!isFormData) {
                defaultHeaders["Content-Type"] = "application/json";
            }

            const response = await fetch(url, {
                ...fetchOptions,
                credentials: 'include',
                headers: {
                    ...defaultHeaders,
                    ...(fetchOptions.headers || {}),
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Api Error ${response.status}: ${errorBody}`);
            }

            if (response.status === 204) {
                return {} as T;
            }

            const text = await response.text();
            return text ? JSON.parse(text) : ({} as T);
        } catch (error: any) {
            throw new Error(error?.message || String(error));
        }
    }

    // Track in-flight GET requests to eliminate duplicate simultaneous calls
    private inFlightGetRequests = new Map<string, Promise<ApiResponse<any>>>();

    async get<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const cacheKey = this.buildUrlWithParams(endpoint, options.params);
        if (this.inFlightGetRequests.has(cacheKey)) {
            return this.inFlightGetRequests.get(cacheKey)! as Promise<ApiResponse<T>>;
        }

        const requestPromise = this.request<T>(endpoint, {
            ...options,
            method: 'GET'
        })
            .then((resp) => ({
                success: true,
                response: resp,
                failure: false
            }))
            .catch((error: any) => ({
                success: false,
                failure: true,
                error: `Network Error: ${error?.message || String(error)}`
            }))
            .finally(() => {
                this.inFlightGetRequests.delete(cacheKey);
            });

        this.inFlightGetRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    async post<T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body)
        })
            .then((resp) => ({
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

    async put<T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? body : JSON.stringify(body)
        })
            .then((resp) => ({
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

    async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE'
        })
            .then((resp) => ({
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