import { Order, Menu, Category, Table, Admin, OrderStatus } from './types';

// ============================================================================
// Mock Data
// ============================================================================

const mockAdmin: Admin = {
  id: 'admin-1',
  username: 'admin',
  storeId: 'store-1',
};

const mockCategories: Category[] = [
  { id: 'cat-1', name: '메인 요리', displayOrder: 1 },
  { id: 'cat-2', name: '음료', displayOrder: 2 },
  { id: 'cat-3', name: '디저트', displayOrder: 3 },
];

const mockMenus: Menu[] = [
  {
    id: 'menu-1',
    name: '파스타',
    categoryId: 'cat-1',
    price: 15000,
    description: '크림 파스타',
    imageUrl: 'https://via.placeholder.com/150',
    isAvailable: true,
    displayOrder: 1,
  },
  {
    id: 'menu-2',
    name: '피자',
    categoryId: 'cat-1',
    price: 20000,
    description: '마르게리타 피자',
    imageUrl: 'https://via.placeholder.com/150',
    isAvailable: true,
    displayOrder: 2,
  },
  {
    id: 'menu-3',
    name: '콜라',
    categoryId: 'cat-2',
    price: 3000,
    description: '탄산음료',
    imageUrl: 'https://via.placeholder.com/150',
    isAvailable: true,
    displayOrder: 1,
  },
];

const mockTables: Table[] = [
  { id: 'table-1', tableNumber: '1', sessionId: 'session-1', isActive: true },
  { id: 'table-2', tableNumber: '2', sessionId: 'session-2', isActive: true },
  { id: 'table-3', tableNumber: '3', sessionId: null, isActive: false },
];

let mockOrders: Order[] = [
  {
    id: 'order-1',
    tableId: 'table-1',
    items: [
      { menuId: 'menu-1', menuName: '파스타', quantity: 2, price: 15000 },
      { menuId: 'menu-3', menuName: '콜라', quantity: 1, price: 3000 },
    ],
    totalAmount: 33000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    tableId: 'table-2',
    items: [{ menuId: 'menu-2', menuName: '피자', quantity: 1, price: 20000 }],
    totalAmount: 20000,
    status: 'preparing',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = () => delay(200 + Math.random() * 300);

// ============================================================================
// Mock API Functions
// ============================================================================

export const mockApi = {
  // Auth
  login: async (username: string, password: string) => {
    await randomDelay();
    if (username === 'admin' && password === 'password') {
      return {
        token: 'mock-jwt-token',
        admin: mockAdmin,
      };
    }
    throw new Error('Invalid credentials');
  },

  // Orders
  getOrders: async () => {
    await randomDelay();
    return { orders: mockOrders };
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await randomDelay();
    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    return { order: mockOrders[orderIndex] };
  },

  deleteOrder: async (orderId: string) => {
    await randomDelay();
    mockOrders = mockOrders.filter((o) => o.id !== orderId);
    return { success: true };
  },

  // Tables
  getTables: async () => {
    await randomDelay();
    return { tables: mockTables };
  },

  completeTableSession: async (tableId: string) => {
    await randomDelay();
    const tableIndex = mockTables.findIndex((t) => t.id === tableId);
    if (tableIndex === -1) throw new Error('Table not found');
    mockTables[tableIndex] = {
      ...mockTables[tableIndex],
      sessionId: null,
      isActive: false,
    };
    mockOrders = mockOrders.filter((o) => o.tableId !== tableId);
    return { success: true };
  },

  // Menus
  getMenus: async () => {
    await randomDelay();
    return { menus: mockMenus };
  },

  createMenu: async (menuData: Partial<Menu>) => {
    await randomDelay();
    const newMenu: Menu = {
      id: `menu-${Date.now()}`,
      name: menuData.name || '',
      categoryId: menuData.categoryId || '',
      price: menuData.price || 0,
      description: menuData.description,
      imageUrl: menuData.imageUrl,
      isAvailable: menuData.isAvailable ?? true,
      displayOrder: menuData.displayOrder || mockMenus.length + 1,
    };
    mockMenus.push(newMenu);
    return { menu: newMenu };
  },

  updateMenu: async (menuId: string, menuData: Partial<Menu>) => {
    await randomDelay();
    const menuIndex = mockMenus.findIndex((m) => m.id === menuId);
    if (menuIndex === -1) throw new Error('Menu not found');
    mockMenus[menuIndex] = { ...mockMenus[menuIndex], ...menuData };
    return { menu: mockMenus[menuIndex] };
  },

  deleteMenu: async (menuId: string) => {
    await randomDelay();
    const menuIndex = mockMenus.findIndex((m) => m.id === menuId);
    if (menuIndex === -1) throw new Error('Menu not found');
    mockMenus.splice(menuIndex, 1);
    return { success: true };
  },

  // Categories
  getCategories: async () => {
    await randomDelay();
    return { categories: mockCategories };
  },
};
