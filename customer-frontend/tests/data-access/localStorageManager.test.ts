import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveCart,
  loadCart,
  clearCart,
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
  calculateCartTotal,
} from '@/data-access/localStorageManager';
import { Cart, Menu } from '@/data-access/types';

// Mock Logger
vi.mock('@/infrastructure/Logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('localStorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Cart operations', () => {
    const mockCart: Cart = {
      items: [
        {
          menu: {
            id: 1,
            name: 'Test Menu',
            price: 10000,
          } as Menu,
          quantity: 2,
        },
      ],
      total: 20000,
    };

    it('should save and load cart', () => {
      saveCart(mockCart);
      const loaded = loadCart();

      expect(loaded).not.toBeNull();
      expect(loaded?.items.length).toBe(1);
      expect(loaded?.total).toBe(20000);
    });

    it('should return null if cart does not exist', () => {
      const loaded = loadCart();
      expect(loaded).toBeNull();
    });

    it('should clear cart', () => {
      saveCart(mockCart);
      clearCart();
      const loaded = loadCart();
      expect(loaded).toBeNull();
    });
  });

  describe('Auth operations', () => {
    const mockAuth = {
      tableNumber: 1,
      password: 'password123',
      storeId: 1,
    };

    it('should save and load auth', () => {
      saveCustomerAuth(mockAuth);
      const loaded = loadCustomerAuth();

      expect(loaded).not.toBeNull();
      expect(loaded?.tableNumber).toBe(1);
      expect(loaded?.password).toBe('password123');
    });

    it('should return null if auth does not exist', () => {
      const loaded = loadCustomerAuth();
      expect(loaded).toBeNull();
    });

    it('should clear auth', () => {
      saveCustomerAuth(mockAuth);
      clearCustomerAuth();
      const loaded = loadCustomerAuth();
      expect(loaded).toBeNull();
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total price correctly', () => {
      const items = [
        {
          menu: { id: 1, price: 10000 } as Menu,
          quantity: 2,
        },
        {
          menu: { id: 2, price: 5000 } as Menu,
          quantity: 3,
        },
      ];

      const total = calculateCartTotal(items);
      expect(total).toBe(35000); // (10000 * 2) + (5000 * 3)
    });

    it('should return 0 for empty cart', () => {
      const total = calculateCartTotal([]);
      expect(total).toBe(0);
    });
  });
});
