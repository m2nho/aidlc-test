import { describe, it, expect } from 'vitest';
import {
  validateCartItem,
  validateCart,
  isMenuInCart,
  findCartItem,
  validateOrderRequest,
} from '@/business-logic/validators/domainValidators';
import { Cart, CartItem, Menu } from '@/data-access/types';

const mockMenu: Menu = {
  id: 1,
  name: 'Test Menu',
  price: 10000,
  store_id: 1,
  category_id: 1,
  description: 'Test',
  is_available: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('domainValidators', () => {
  describe('validateCartItem', () => {
    it('should accept valid cart item', () => {
      const item: CartItem = {
        menu: mockMenu,
        quantity: 2,
      };

      const result = validateCartItem(item);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid quantity', () => {
      const item: CartItem = {
        menu: mockMenu,
        quantity: 0,
      };

      const result = validateCartItem(item);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid menu', () => {
      const item: CartItem = {
        menu: { ...mockMenu, id: 0 },
        quantity: 1,
      };

      const result = validateCartItem(item);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCart', () => {
    it('should accept valid cart', () => {
      const cart: Cart = {
        items: [
          { menu: mockMenu, quantity: 2 },
          { menu: { ...mockMenu, id: 2 }, quantity: 1 },
        ],
        total: 30000, // (10000 * 2) + (10000 * 1)
      };

      const result = validateCart(cart);
      expect(result.valid).toBe(true);
    });

    it('should reject empty cart', () => {
      const cart: Cart = {
        items: [],
        total: 0,
      };

      const result = validateCart(cart);
      expect(result.valid).toBe(false);
    });

    it('should reject cart with duplicate menus', () => {
      const cart: Cart = {
        items: [
          { menu: mockMenu, quantity: 2 },
          { menu: mockMenu, quantity: 1 }, // Duplicate
        ],
        total: 30000,
      };

      const result = validateCart(cart);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('중복');
    });

    it('should reject cart with incorrect total', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 2 }],
        total: 99999, // Wrong total
      };

      const result = validateCart(cart);
      expect(result.valid).toBe(false);
    });
  });

  describe('isMenuInCart', () => {
    it('should return true if menu is in cart', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 1 }],
        total: 10000,
      };

      expect(isMenuInCart(cart, 1)).toBe(true);
    });

    it('should return false if menu is not in cart', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 1 }],
        total: 10000,
      };

      expect(isMenuInCart(cart, 999)).toBe(false);
    });
  });

  describe('findCartItem', () => {
    it('should find cart item by menu ID', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 2 }],
        total: 20000,
      };

      const item = findCartItem(cart, 1);
      expect(item).toBeDefined();
      expect(item?.quantity).toBe(2);
    });

    it('should return undefined if not found', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 1 }],
        total: 10000,
      };

      const item = findCartItem(cart, 999);
      expect(item).toBeUndefined();
    });
  });

  describe('validateOrderRequest', () => {
    it('should accept valid order request', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 1 }],
        total: 10000,
      };

      const result = validateOrderRequest(cart, 1);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid cart', () => {
      const cart: Cart = {
        items: [],
        total: 0,
      };

      const result = validateOrderRequest(cart, 1);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid table ID', () => {
      const cart: Cart = {
        items: [{ menu: mockMenu, quantity: 1 }],
        total: 10000,
      };

      const result = validateOrderRequest(cart, 0);
      expect(result.valid).toBe(false);
    });
  });
});
