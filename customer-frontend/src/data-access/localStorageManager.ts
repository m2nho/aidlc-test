import { Cart, CartItem } from './types';
import { STORAGE_KEYS, UI_CONSTANTS } from '@/utility/constants';
import Logger from '@/infrastructure/Logger';

/**
 * Save cart to LocalStorage
 */
export function saveCart(cart: Cart): void {
  try {
    const cartWithTimestamp = {
      ...cart,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartWithTimestamp));
    Logger.info('Cart saved to LocalStorage', cartWithTimestamp);
  } catch (error) {
    Logger.error('Failed to save cart to LocalStorage', error);
  }
}

/**
 * Load cart from LocalStorage
 * Returns null if cart is expired or invalid
 */
export function loadCart(): Cart | null {
  try {
    const cartJson = localStorage.getItem(STORAGE_KEYS.CART);
    if (!cartJson) {
      return null;
    }

    const cartWithTimestamp = JSON.parse(cartJson);
    const updatedAt = new Date(cartWithTimestamp.updatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

    // Check if cart is expired (24 hours)
    if (hoursDiff > UI_CONSTANTS.CART_EXPIRY_HOURS) {
      Logger.warn('Cart expired, clearing LocalStorage');
      clearCart();
      return null;
    }

    // Return cart without timestamp
    const cart: Cart = {
      items: cartWithTimestamp.items || [],
      total: cartWithTimestamp.total || 0,
    };

    Logger.info('Cart loaded from LocalStorage', cart);
    return cart;
  } catch (error) {
    Logger.error('Failed to load cart from LocalStorage', error);
    return null;
  }
}

/**
 * Clear cart from LocalStorage
 */
export function clearCart(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
    Logger.info('Cart cleared from LocalStorage');
  } catch (error) {
    Logger.error('Failed to clear cart from LocalStorage', error);
  }
}

/**
 * Save customer authentication credentials to LocalStorage
 */
export function saveCustomerAuth(auth: {
  tableNumber: number;
  password: string;
  storeId: number;
}): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
    Logger.info('Customer auth saved to LocalStorage');
  } catch (error) {
    Logger.error('Failed to save customer auth to LocalStorage', error);
  }
}

/**
 * Load customer authentication credentials from LocalStorage
 */
export function loadCustomerAuth(): {
  tableNumber: number;
  password: string;
  storeId: number;
} | null {
  try {
    const authJson = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!authJson) {
      return null;
    }

    const auth = JSON.parse(authJson);
    Logger.info('Customer auth loaded from LocalStorage');
    return auth;
  } catch (error) {
    Logger.error('Failed to load customer auth from LocalStorage', error);
    return null;
  }
}

/**
 * Clear customer authentication credentials from LocalStorage
 */
export function clearCustomerAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    Logger.info('Customer auth cleared from LocalStorage');
  } catch (error) {
    Logger.error('Failed to clear customer auth from LocalStorage', error);
  }
}

/**
 * Calculate cart total price
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.menu.price * item.quantity, 0);
}
