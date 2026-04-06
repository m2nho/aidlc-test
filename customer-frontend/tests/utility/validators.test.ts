import { describe, it, expect } from 'vitest';
import {
  validateQuantity,
  validateTableNumber,
  validatePassword,
  validateLoginCredentials,
} from '@/utility/validators';

describe('validators', () => {
  describe('validateQuantity', () => {
    it('should accept valid quantities', () => {
      expect(validateQuantity(1).valid).toBe(true);
      expect(validateQuantity(50).valid).toBe(true);
      expect(validateQuantity(99).valid).toBe(true);
    });

    it('should reject quantities below minimum', () => {
      const result = validateQuantity(0);
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject quantities above maximum', () => {
      const result = validateQuantity(100);
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('validateTableNumber', () => {
    it('should accept valid table numbers', () => {
      expect(validateTableNumber(1).valid).toBe(true);
      expect(validateTableNumber(10).valid).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(validateTableNumber(0).valid).toBe(false);
      expect(validateTableNumber(-1).valid).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(validateTableNumber(1.5).valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('password123').valid).toBe(true);
      expect(validatePassword('a').valid).toBe(true);
    });

    it('should reject empty passwords', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword('   ').valid).toBe(false);
    });
  });

  describe('validateLoginCredentials', () => {
    it('should accept valid credentials', () => {
      expect(validateLoginCredentials(1, 'password').valid).toBe(true);
    });

    it('should reject invalid table number', () => {
      const result = validateLoginCredentials(0, 'password');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid password', () => {
      const result = validateLoginCredentials(1, '');
      expect(result.valid).toBe(false);
    });
  });
});
