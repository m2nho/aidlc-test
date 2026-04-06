import { ApiError, handleApiError } from './apiError';
import { ApiRequestOptions } from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// API Client
// ============================================================================

/**
 * Generic API request function with JWT validation, timeout, and error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Check JWT token presence before request (except for login endpoint)
  if (!endpoint.includes('/login')) {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/login';
      throw new ApiError('인증이 필요합니다', 401, endpoint, method);
    }
  }

  // Setup AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  // Prepare headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  const token = sessionStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };

  // Prepare request
  const url = `${API_BASE_URL}${endpoint}`;
  const requestOptions: RequestInit = {
    method,
    headers: finalHeaders,
    signal: controller.signal,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Make request
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('adminData');
      window.location.href = '/login';
      throw new ApiError('인증이 만료되었습니다', 401, endpoint, method);
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Failed to parse error response, use default message
      }
      throw new ApiError(errorMessage, response.status, endpoint, method);
    }

    // Parse successful response
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw handleApiError(error, endpoint, method);
  }
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
