import {
  CustomerLoginRequest,
  CustomerLoginResponse,
  Menu,
  GetMenusParams,
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
} from './types';
import { USE_MOCK_API } from '@/utility/constants';

/**
 * Customer API Client Interface
 * Subset of ApiClient from Day 0 Contract for Customer Frontend
 */
export interface CustomerApiClient {
  // Auth
  loginCustomer(credentials: CustomerLoginRequest): Promise<CustomerLoginResponse>;

  // Menus
  getMenus(params?: GetMenusParams): Promise<Menu[]>;

  // Orders
  createOrder(order: CreateOrderRequest): Promise<CreateOrderResponse>;
  getOrderHistory(tableId: number): Promise<Order[]>;
}

/**
 * API Client Selector
 * Selects between Mock API and Real API based on environment variable
 */
function getApiClient(): CustomerApiClient {
  if (USE_MOCK_API) {
    // Dynamically import mock API
    return import('./mockApi').then((module) => module.mockApi);
  } else {
    // Dynamically import real API
    return import('./realApi').then((module) => module.realApi);
  }
}

// Export async API client
let cachedApiClient: CustomerApiClient | null = null;

export async function getApi(): Promise<CustomerApiClient> {
  if (!cachedApiClient) {
    cachedApiClient = await getApiClient();
  }
  return cachedApiClient;
}

// Convenience methods for direct usage
export const api = {
  async loginCustomer(credentials: CustomerLoginRequest) {
    const client = await getApi();
    return client.loginCustomer(credentials);
  },
  async getMenus(params?: GetMenusParams) {
    const client = await getApi();
    return client.getMenus(params);
  },
  async createOrder(order: CreateOrderRequest) {
    const client = await getApi();
    return client.createOrder(order);
  },
  async getOrderHistory(tableId: number) {
    const client = await getApi();
    return client.getOrderHistory(tableId);
  },
};
