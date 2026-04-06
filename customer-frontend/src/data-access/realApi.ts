import {
  CustomerApiClient,
  CustomerLoginRequest,
  CustomerLoginResponse,
  Menu,
  GetMenusParams,
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  ApiError,
} from './types';
import { API_BASE_URL, API_ENDPOINTS, UI_CONSTANTS } from '@/utility/constants';
import Logger from '@/infrastructure/Logger';

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = UI_CONSTANTS.REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Handle API errors
 */
async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiError;

  try {
    errorData = await response.json();
  } catch {
    errorData = {
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    };
  }

  Logger.error('API Error:', errorData);
  throw errorData;
}

/**
 * Real API Implementation
 * Communicates with actual backend server
 */
export const realApi: CustomerApiClient = {
  /**
   * Login Customer
   */
  async loginCustomer(
    credentials: CustomerLoginRequest
  ): Promise<CustomerLoginResponse> {
    Logger.info('Real API: loginCustomer', credentials);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER_LOGIN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies for JWT
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  /**
   * Get Menus
   */
  async getMenus(params?: GetMenusParams): Promise<Menu[]> {
    Logger.info('Real API: getMenus', params);

    const queryParams = new URLSearchParams();
    if (params?.category_id) {
      queryParams.append('category_id', params.category_id.toString());
    }
    if (params?.available !== undefined) {
      queryParams.append('available', params.available.toString());
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER_MENUS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for JWT
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  /**
   * Create Order
   */
  async createOrder(
    request: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    Logger.info('Real API: createOrder', request);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER_ORDERS}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for JWT
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  /**
   * Get Order History
   */
  async getOrderHistory(tableId: number): Promise<Order[]> {
    Logger.info('Real API: getOrderHistory', tableId);

    const url = `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER_ORDER_HISTORY}?table_id=${tableId}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for JWT
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },
};
