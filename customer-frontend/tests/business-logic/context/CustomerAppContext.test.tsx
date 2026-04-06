import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  CustomerAppProvider,
  useCustomerApp,
} from '@/business-logic/context/CustomerAppContext';

// Mock API
vi.mock('@/data-access/api', () => ({
  api: {
    loginCustomer: vi.fn(),
    getMenus: vi.fn(),
    createOrder: vi.fn(),
    getOrderHistory: vi.fn(),
  },
}));

// Mock LocalStorage Manager
vi.mock('@/data-access/localStorageManager', () => ({
  saveCart: vi.fn(),
  loadCart: vi.fn(() => null),
  clearCart: vi.fn(),
  saveCustomerAuth: vi.fn(),
  loadCustomerAuth: vi.fn(() => null),
  clearCustomerAuth: vi.fn(),
  calculateCartTotal: vi.fn((items) =>
    items.reduce((sum: number, item: any) => sum + item.menu.price * item.quantity, 0)
  ),
}));

// Mock Validators
vi.mock('@/business-logic/validators/domainValidators', () => ({
  validateCartItem: vi.fn(() => ({ valid: true })),
  isMenuInCart: vi.fn(() => false),
  validateOrderRequest: vi.fn(() => ({ valid: true })),
}));

// Mock Logger
vi.mock('@/infrastructure/Logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { api } from '@/data-access/api';

describe('CustomerAppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useCustomerApp(), {
      wrapper: CustomerAppProvider,
    });

    expect(result.current.session.isAuthenticated).toBe(false);
    expect(result.current.cart.items).toEqual([]);
    expect(result.current.menus).toEqual([]);
  });

  it('should login successfully', async () => {
    vi.mocked(api.loginCustomer).mockResolvedValue({
      message: '로그인 성공',
      store: { id: 1, name: 'Test Store', table_count: 10, created_at: '2024-01-01T00:00:00Z' },
    });

    const { result } = renderHook(() => useCustomerApp(), {
      wrapper: CustomerAppProvider,
    });

    await act(async () => {
      await result.current.login(1, 'test123');
    });

    await waitFor(() => {
      expect(result.current.session.isAuthenticated).toBe(true);
      expect(result.current.session.tableNumber).toBe(1);
    });
  });

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useCustomerApp(), {
      wrapper: CustomerAppProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.session.isAuthenticated).toBe(false);
    expect(result.current.cart.items).toEqual([]);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useCustomerApp());
    }).toThrow('useCustomerApp must be used within CustomerAppProvider');
  });
});
