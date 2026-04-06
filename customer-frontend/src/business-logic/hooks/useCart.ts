import { useMemo } from 'react';
import { useCustomerApp } from '../context/CustomerAppContext';
import { Menu } from '@/data-access/types';

/**
 * Cart hook
 * Wrapper around useCustomerApp for cart operations
 * Provides computed values and convenient cart actions
 */
export function useCart() {
  const {
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCustomerApp();

  // Computed values
  const totalPrice = useMemo(() => cart.total, [cart.total]);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const isEmpty = useMemo(() => cart.items.length === 0, [cart.items]);

  const itemCount = useMemo(() => cart.items.length, [cart.items]);

  // Convenient action wrappers
  const add = (menu: Menu, quantity: number = 1) => {
    addToCart(menu, quantity);
  };

  const updateQuantity = (menuId: number, quantity: number) => {
    updateCartItemQuantity(menuId, quantity);
  };

  const remove = (menuId: number) => {
    removeFromCart(menuId);
  };

  const clear = () => {
    clearCart();
  };

  const getItemQuantity = (menuId: number): number => {
    const item = cart.items.find((item) => item.menu.id === menuId);
    return item?.quantity || 0;
  };

  const hasItem = (menuId: number): boolean => {
    return cart.items.some((item) => item.menu.id === menuId);
  };

  return {
    // State
    cart,
    items: cart.items,

    // Computed values
    totalPrice,
    totalItems,
    isEmpty,
    itemCount,

    // Actions
    add,
    updateQuantity,
    remove,
    clear,

    // Helpers
    getItemQuantity,
    hasItem,
  };
}
