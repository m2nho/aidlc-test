import { CartItem, Cart } from '@/data-access/types';
import { validateQuantity } from '@/utility/validators';
import { ValidationResult } from '@/utility/validators';
import { UI_CONSTANTS, ERROR_MESSAGES } from '@/utility/constants';

/**
 * Validate a single cart item
 * BR-CART-001: Quantity must be 1-99
 */
export function validateCartItem(item: CartItem): ValidationResult {
  // Validate quantity
  const quantityValidation = validateQuantity(item.quantity);
  if (!quantityValidation.valid) {
    return quantityValidation;
  }

  // Validate menu exists
  if (!item.menu || !item.menu.id) {
    return {
      valid: false,
      message: '유효하지 않은 메뉴입니다.',
    };
  }

  // Validate menu price
  if (item.menu.price <= 0) {
    return {
      valid: false,
      message: '메뉴 가격이 유효하지 않습니다.',
    };
  }

  return { valid: true };
}

/**
 * Validate entire cart
 * BR-CART-002: No duplicate menus in cart
 * BR-CART-003: Cart expiry check (handled in localStorageManager)
 */
export function validateCart(cart: Cart): ValidationResult {
  // Validate cart is not empty
  if (!cart.items || cart.items.length === 0) {
    return {
      valid: false,
      message: ERROR_MESSAGES.CART_EMPTY,
    };
  }

  // Validate each cart item
  for (const item of cart.items) {
    const itemValidation = validateCartItem(item);
    if (!itemValidation.valid) {
      return itemValidation;
    }
  }

  // Check for duplicate menus (BR-CART-002)
  const menuIds = cart.items.map((item) => item.menu.id);
  const uniqueMenuIds = new Set(menuIds);
  if (menuIds.length !== uniqueMenuIds.size) {
    return {
      valid: false,
      message: '장바구니에 중복된 메뉴가 있습니다.',
    };
  }

  // Validate total price
  const calculatedTotal = cart.items.reduce(
    (sum, item) => sum + item.menu.price * item.quantity,
    0
  );
  if (Math.abs(calculatedTotal - cart.total) > 0.01) {
    return {
      valid: false,
      message: '장바구니 총액이 일치하지 않습니다.',
    };
  }

  return { valid: true };
}

/**
 * Check if menu already exists in cart
 * Used to prevent duplicate menus (BR-CART-002)
 */
export function isMenuInCart(cart: Cart, menuId: number): boolean {
  return cart.items.some((item) => item.menu.id === menuId);
}

/**
 * Find cart item by menu ID
 */
export function findCartItem(
  cart: Cart,
  menuId: number
): CartItem | undefined {
  return cart.items.find((item) => item.menu.id === menuId);
}

/**
 * Validate order creation request
 */
export function validateOrderRequest(cart: Cart, tableId: number): ValidationResult {
  // Validate cart
  const cartValidation = validateCart(cart);
  if (!cartValidation.valid) {
    return cartValidation;
  }

  // Validate table ID
  if (!tableId || tableId <= 0) {
    return {
      valid: false,
      message: '유효하지 않은 테이블 ID입니다.',
    };
  }

  return { valid: true };
}
