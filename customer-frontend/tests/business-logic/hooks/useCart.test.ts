import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCart } from '@/business-logic/hooks/useCart';
import { Cart, Menu } from '@/data-access/types';

// Mock useCustomerApp
vi.mock('../context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(),
}));

import { useCustomerApp } from '../context/CustomerAppContext';

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

describe('useCart', () => {
  it('should provide cart state and actions', () => {
    const mockCart: Cart = {
      items: [{ menu: mockMenu, quantity: 2 }],
      total: 20000,
    };

    vi.mocked(useCustomerApp).mockReturnValue({
      cart: mockCart,
      addToCart: vi.fn(),
      updateCartItemQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual(mockCart);
    expect(result.current.items).toEqual(mockCart.items);
    expect(result.current.totalPrice).toBe(20000);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.itemCount).toBe(1);
  });

  it('should calculate isEmpty correctly', () => {
    const mockCart: Cart = {
      items: [],
      total: 0,
    };

    vi.mocked(useCustomerApp).mockReturnValue({
      cart: mockCart,
      addToCart: vi.fn(),
      updateCartItemQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalItems).toBe(0);
  });

  it('should provide hasItem helper', () => {
    const mockCart: Cart = {
      items: [{ menu: mockMenu, quantity: 1 }],
      total: 10000,
    };

    vi.mocked(useCustomerApp).mockReturnValue({
      cart: mockCart,
      addToCart: vi.fn(),
      updateCartItemQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCart());

    expect(result.current.hasItem(1)).toBe(true);
    expect(result.current.hasItem(999)).toBe(false);
  });

  it('should provide getItemQuantity helper', () => {
    const mockCart: Cart = {
      items: [{ menu: mockMenu, quantity: 3 }],
      total: 30000,
    };

    vi.mocked(useCustomerApp).mockReturnValue({
      cart: mockCart,
      addToCart: vi.fn(),
      updateCartItemQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCart());

    expect(result.current.getItemQuantity(1)).toBe(3);
    expect(result.current.getItemQuantity(999)).toBe(0);
  });
});
