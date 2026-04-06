import { UI_CONSTANTS, ERROR_MESSAGES } from './constants';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate quantity range (1-99)
 */
export function validateQuantity(quantity: number): ValidationResult {
  if (quantity < UI_CONSTANTS.MIN_QUANTITY) {
    return {
      valid: false,
      message: ERROR_MESSAGES.VALIDATION_QUANTITY_MIN,
    };
  }

  if (quantity > UI_CONSTANTS.MAX_QUANTITY) {
    return {
      valid: false,
      message: ERROR_MESSAGES.VALIDATION_QUANTITY_MAX,
    };
  }

  return { valid: true };
}

/**
 * Validate table number (positive integer)
 */
export function validateTableNumber(tableNumber: number): ValidationResult {
  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    return {
      valid: false,
      message: ERROR_MESSAGES.VALIDATION_TABLE_NUMBER,
    };
  }

  return { valid: true };
}

/**
 * Validate password (non-empty string)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      message: ERROR_MESSAGES.VALIDATION_PASSWORD,
    };
  }

  return { valid: true };
}

/**
 * Validate all login credentials
 */
export function validateLoginCredentials(
  tableNumber: number,
  password: string
): ValidationResult {
  const tableValidation = validateTableNumber(tableNumber);
  if (!tableValidation.valid) {
    return tableValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  return { valid: true };
}
