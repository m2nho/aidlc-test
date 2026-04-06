import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { realApi } from '@/data-access/realApi';

// Mock global fetch
global.fetch = vi.fn();

// Mock Logger
vi.mock('@/infrastructure/Logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('realApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loginCustomer', () => {
    it('should call fetch with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: '로그인 성공',
          store: { id: 1, name: 'Test Store' },
        }),
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await realApi.loginCustomer({
        table_number: 1,
        password: 'test123',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customer/login'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      );

      expect(result.message).toBe('로그인 성공');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          error: 'AUTH_INVALID_CREDENTIALS',
          message: '잘못된 자격 증명입니다.',
        }),
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      await expect(
        realApi.loginCustomer({
          table_number: 1,
          password: 'wrong',
        })
      ).rejects.toMatchObject({
        error: 'AUTH_INVALID_CREDENTIALS',
      });
    });
  });

  describe('getMenus', () => {
    it('should fetch menus', async () => {
      const mockMenus = [{ id: 1, name: 'Test Menu', price: 10000 }];
      const mockResponse = {
        ok: true,
        json: async () => mockMenus,
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await realApi.getMenus();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customer/menus'),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockMenus);
    });
  });

  describe('createOrder', () => {
    it('should create order', async () => {
      const mockOrder = {
        id: 1,
        order_number: 1,
        status: 'pending',
      };
      const mockResponse = {
        ok: true,
        json: async () => mockOrder,
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await realApi.createOrder({
        table_id: 1,
        items: [{ menu_id: 1, quantity: 2 }],
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customer/orders'),
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result).toEqual(mockOrder);
    });
  });

  describe('getOrderHistory', () => {
    it('should fetch order history', async () => {
      const mockOrders = [{ id: 1, status: 'completed' }];
      const mockResponse = {
        ok: true,
        json: async () => mockOrders,
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await realApi.getOrderHistory(1);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/customer/orders?table_id=1'),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockOrders);
    });
  });
});
