import { describe, it, expect, vi } from 'vitest';
import { api } from '@/data-access/api';

// Mock the utility constants
vi.mock('@/utility/constants', () => ({
  USE_MOCK_API: true,
  API_BASE_URL: 'http://localhost:8000',
  API_ENDPOINTS: {},
  STORAGE_KEYS: {},
  UI_CONSTANTS: {},
  ORDER_STATUS: {},
  ORDER_STATUS_LABELS: {},
  ORDER_STATUS_COLORS: {},
  ERROR_MESSAGES: {},
  SUCCESS_MESSAGES: {},
  ACCESSIBILITY: {},
}));

describe('api', () => {
  it('should have loginCustomer method', () => {
    expect(api.loginCustomer).toBeDefined();
    expect(typeof api.loginCustomer).toBe('function');
  });

  it('should have getMenus method', () => {
    expect(api.getMenus).toBeDefined();
    expect(typeof api.getMenus).toBe('function');
  });

  it('should have createOrder method', () => {
    expect(api.createOrder).toBeDefined();
    expect(typeof api.createOrder).toBe('function');
  });

  it('should have getOrderHistory method', () => {
    expect(api.getOrderHistory).toBeDefined();
    expect(typeof api.getOrderHistory).toBe('function');
  });
});
