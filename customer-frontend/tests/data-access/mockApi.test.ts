import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi } from '@/data-access/mockApi';

describe('mockApi', () => {
  describe('loginCustomer', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await mockApi.loginCustomer({
        table_number: 1,
        password: 'test123',
      });

      expect(result.message).toBe('로그인 성공');
      expect(result.store).toBeDefined();
      expect(result.store.name).toBe('테스트 음식점');
    });

    it('should reject invalid table number', async () => {
      await expect(
        mockApi.loginCustomer({
          table_number: 999,
          password: 'test123',
        })
      ).rejects.toMatchObject({
        error: 'AUTH_INVALID_CREDENTIALS',
      });
    });

    it('should reject empty password', async () => {
      await expect(
        mockApi.loginCustomer({
          table_number: 1,
          password: '',
        })
      ).rejects.toMatchObject({
        error: 'AUTH_INVALID_CREDENTIALS',
      });
    });
  });

  describe('getMenus', () => {
    it('should return all menus', async () => {
      const menus = await mockApi.getMenus();
      expect(menus.length).toBeGreaterThan(0);
      expect(menus[0].name).toBeDefined();
      expect(menus[0].price).toBeGreaterThan(0);
    });

    it('should filter menus by category', async () => {
      const menus = await mockApi.getMenus({ category_id: 1 });
      expect(menus.every((m) => m.category_id === 1)).toBe(true);
    });

    it('should filter menus by availability', async () => {
      const menus = await mockApi.getMenus({ available: true });
      expect(menus.every((m) => m.is_available === true)).toBe(true);
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const order = await mockApi.createOrder({
        table_id: 1,
        items: [
          { menu_id: 1, quantity: 2 },
          { menu_id: 2, quantity: 1 },
        ],
      });

      expect(order.id).toBeDefined();
      expect(order.order_number).toBeGreaterThan(0);
      expect(order.status).toBe('pending');
      expect(order.items.length).toBe(2);
    });

    it('should reject empty order items', async () => {
      await expect(
        mockApi.createOrder({
          table_id: 1,
          items: [],
        })
      ).rejects.toMatchObject({
        error: 'VALIDATION_ERROR',
      });
    });

    it('should reject invalid menu ID', async () => {
      await expect(
        mockApi.createOrder({
          table_id: 1,
          items: [{ menu_id: 999, quantity: 1 }],
        })
      ).rejects.toMatchObject({
        error: 'MENU_NOT_FOUND',
      });
    });
  });

  describe('getOrderHistory', () => {
    beforeEach(async () => {
      // Create a test order
      await mockApi.createOrder({
        table_id: 1,
        items: [{ menu_id: 1, quantity: 1 }],
      });
    });

    it('should return order history for table', async () => {
      const orders = await mockApi.getOrderHistory(1);
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0].table_id).toBe(1);
    });

    it('should return empty array for table with no orders', async () => {
      const orders = await mockApi.getOrderHistory(999);
      expect(orders).toEqual([]);
    });
  });
});
