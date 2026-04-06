import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  formatDateShort,
  formatOrderStatus,
  formatTableNumber,
  formatQuantity,
  truncateText,
} from '@/utility/formatters';
import { ORDER_STATUS } from '@/utility/constants';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format price with comma separator', () => {
      expect(formatPrice(10000)).toBe('₩10,000');
      expect(formatPrice(1000)).toBe('₩1,000');
      expect(formatPrice(500)).toBe('₩500');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date to Korean locale', () => {
      const result = formatDate('2024-01-01T15:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('1월');
    });
  });

  describe('formatDateShort', () => {
    it('should format ISO date to short format', () => {
      const result = formatDateShort('2024-01-01T15:00:00Z');
      expect(result).toContain('2024');
    });
  });

  describe('formatOrderStatus', () => {
    it('should format order status to Korean', () => {
      expect(formatOrderStatus(ORDER_STATUS.PENDING)).toBe('대기 중');
      expect(formatOrderStatus(ORDER_STATUS.ACCEPTED)).toBe('접수됨');
      expect(formatOrderStatus(ORDER_STATUS.COMPLETED)).toBe('완료');
    });
  });

  describe('formatTableNumber', () => {
    it('should format table number with prefix', () => {
      expect(formatTableNumber(1)).toBe('테이블 1번');
      expect(formatTableNumber(10)).toBe('테이블 10번');
    });
  });

  describe('formatQuantity', () => {
    it('should format quantity with unit', () => {
      expect(formatQuantity(1)).toBe('1개');
      expect(formatQuantity(10)).toBe('10개');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });
});
