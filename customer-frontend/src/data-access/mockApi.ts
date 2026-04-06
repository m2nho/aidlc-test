import {
  CustomerApiClient,
  CustomerLoginRequest,
  CustomerLoginResponse,
  Menu,
  MenuCategory,
  Order,
  OrderItem,
  Store,
  Table,
  CreateOrderRequest,
  CreateOrderResponse,
  GetMenusParams,
} from './types';
import { UI_CONSTANTS } from '@/utility/constants';
import Logger from '@/infrastructure/Logger';

// ============================================================================
// Mock Data
// ============================================================================

const mockStore: Store = {
  id: 1,
  name: '테스트 음식점',
  table_count: 10,
  created_at: '2024-01-01T00:00:00Z',
};

const mockTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  store_id: 1,
  table_number: i + 1,
  created_at: '2024-01-01T00:00:00Z',
}));

const mockCategories: MenuCategory[] = [
  {
    id: 1,
    store_id: 1,
    name: '메인 메뉴',
    display_order: 1,
  },
  {
    id: 2,
    store_id: 1,
    name: '사이드 메뉴',
    display_order: 2,
  },
  {
    id: 3,
    store_id: 1,
    name: '음료',
    display_order: 3,
  },
];

const mockMenus: Menu[] = [
  {
    id: 1,
    store_id: 1,
    category_id: 1,
    name: '불고기',
    description: '부드러운 소고기 불고기',
    price: 15000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 2,
    store_id: 1,
    category_id: 1,
    name: '갈비찜',
    description: '푸짐한 갈비찜',
    price: 25000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 3,
    store_id: 1,
    category_id: 1,
    name: '비빔밥',
    description: '고소한 참기름 비빔밥',
    price: 10000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 4,
    store_id: 1,
    category_id: 2,
    name: '김치찌개',
    description: '얼큰한 김치찌개',
    price: 8000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[1],
  },
  {
    id: 5,
    store_id: 1,
    category_id: 2,
    name: '된장찌개',
    description: '구수한 된장찌개',
    price: 8000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[1],
  },
  {
    id: 6,
    store_id: 1,
    category_id: 2,
    name: '계란찜',
    description: '부드러운 계란찜',
    price: 5000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[1],
  },
  {
    id: 7,
    store_id: 1,
    category_id: 3,
    name: '콜라',
    description: '시원한 코카콜라',
    price: 2000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[2],
  },
  {
    id: 8,
    store_id: 1,
    category_id: 3,
    name: '사이다',
    description: '상쾌한 스프라이트',
    price: 2000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[2],
  },
  {
    id: 9,
    store_id: 1,
    category_id: 3,
    name: '오렌지주스',
    description: '프레시 오렌지주스',
    price: 3000,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category: mockCategories[2],
  },
];

// Mock orders storage (in-memory)
let mockOrders: Order[] = [];
let orderIdCounter = 1;
let orderNumberCounter = 1;

// ============================================================================
// Helper Functions
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOrderNumber(): number {
  return orderNumberCounter++;
}

// ============================================================================
// Mock API Implementation
// ============================================================================

export const mockApi: CustomerApiClient = {
  /**
   * Login Customer
   */
  async loginCustomer(
    credentials: CustomerLoginRequest
  ): Promise<CustomerLoginResponse> {
    await delay(UI_CONSTANTS.NETWORK_DELAY_MS);
    Logger.info('Mock API: loginCustomer', credentials);

    const table = mockTables.find(
      (t) => t.table_number === credentials.table_number
    );

    if (!table) {
      throw {
        error: 'AUTH_INVALID_CREDENTIALS',
        message: '테이블 번호가 올바르지 않습니다.',
      };
    }

    // Mock password validation (any password is accepted for table 1-10)
    if (!credentials.password || credentials.password.trim().length === 0) {
      throw {
        error: 'AUTH_INVALID_CREDENTIALS',
        message: '비밀번호를 입력해주세요.',
      };
    }

    return {
      message: '로그인 성공',
      store: mockStore,
    };
  },

  /**
   * Get Menus
   */
  async getMenus(params?: GetMenusParams): Promise<Menu[]> {
    await delay(UI_CONSTANTS.NETWORK_DELAY_MS);
    Logger.info('Mock API: getMenus', params);

    let filteredMenus = [...mockMenus];

    // Filter by category
    if (params?.category_id) {
      filteredMenus = filteredMenus.filter(
        (menu) => menu.category_id === params.category_id
      );
    }

    // Filter by availability
    if (params?.available !== undefined) {
      filteredMenus = filteredMenus.filter(
        (menu) => menu.is_available === params.available
      );
    }

    return filteredMenus;
  },

  /**
   * Create Order
   */
  async createOrder(
    request: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    await delay(UI_CONSTANTS.NETWORK_DELAY_MS);
    Logger.info('Mock API: createOrder', request);

    // Validate table_id
    const table = mockTables.find((t) => t.id === request.table_id);
    if (!table) {
      throw {
        error: 'TABLE_NOT_FOUND',
        message: '테이블을 찾을 수 없습니다.',
      };
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      throw {
        error: 'VALIDATION_ERROR',
        message: '주문 항목이 비어있습니다.',
      };
    }

    // Create order items
    const orderItems: OrderItem[] = request.items.map((item, index) => {
      const menu = mockMenus.find((m) => m.id === item.menu_id);
      if (!menu) {
        throw {
          error: 'MENU_NOT_FOUND',
          message: `메뉴를 찾을 수 없습니다. (ID: ${item.menu_id})`,
        };
      }

      return {
        id: orderIdCounter * 100 + index,
        order_id: orderIdCounter,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: menu.price,
        menu,
      };
    });

    // Create order
    const order: Order = {
      id: orderIdCounter++,
      store_id: mockStore.id,
      table_id: request.table_id,
      order_number: generateOrderNumber(),
      status: 'pending',
      created_at: new Date().toISOString(),
      items: orderItems,
      table,
    };

    mockOrders.push(order);

    return order;
  },

  /**
   * Get Order History
   */
  async getOrderHistory(tableId: number): Promise<Order[]> {
    await delay(UI_CONSTANTS.NETWORK_DELAY_MS);
    Logger.info('Mock API: getOrderHistory', tableId);

    // Find orders for this table
    const orders = mockOrders.filter((order) => order.table_id === tableId);

    // Sort by created_at descending (newest first)
    orders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return orders;
  },
};
