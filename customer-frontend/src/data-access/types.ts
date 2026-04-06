// TypeScript Type Definitions - Day 0 Contract
// 테이블오더 서비스 Frontend용 타입 정의

// ============================================================================
// Domain Entities
// ============================================================================

export interface Store {
  id: number;
  name: string;
  table_count: number;
  created_at: string; // ISO 8601
}

export interface Admin {
  id: number;
  store_id: number;
  username: string;
  created_at: string; // ISO 8601
}

export interface Table {
  id: number;
  store_id: number;
  table_number: number;
  created_at: string; // ISO 8601
}

export interface TableSession {
  id: number;
  table_id: number;
  started_at: string; // ISO 8601
  ended_at: string | null; // ISO 8601 or null
}

export interface TableWithSession {
  id: number;
  table_number: number;
  session: TableSession;
  pending_orders_count: number;
}

export interface MenuCategory {
  id: number;
  store_id: number;
  name: string;
  display_order: number;
}

export interface Menu {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  category?: MenuCategory; // 조인된 경우에만 포함
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface Order {
  id: number;
  store_id: number;
  table_id: number;
  order_number: number;
  status: OrderStatus;
  created_at: string; // ISO 8601
  items: OrderItem[];
  table?: Table; // 조인된 경우에만 포함
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  price: number;
  menu?: Menu; // 조인된 경우에만 포함
}

export interface OrderHistory {
  id: number;
  session_id: number;
  order_number: number;
  status: OrderStatus;
  total_amount: number;
  completed_at: string; // ISO 8601
  order_data_json: string; // JSON string
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// --- Auth API ---

export interface CustomerLoginRequest {
  table_number: number;
  password: string;
}

export interface CustomerLoginResponse {
  message: string;
  store: Store;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  admin: Admin;
}

export interface LogoutResponse {
  message: string;
}

// --- Orders API ---

export interface CreateOrderRequest {
  table_id: number;
  items: {
    menu_id: number;
    quantity: number;
  }[];
}

export interface CreateOrderResponse extends Order {}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse extends Order {}

export interface GetOrdersParams {
  status?: OrderStatus;
  table_id?: number;
}

// --- Tables API ---

export interface GetTableSessionResponse extends TableSession {}

export interface CompleteTableSessionRequest {
  table_id: number;
}

export interface CompleteTableSessionResponse {
  message: string;
  archived_orders_count: number;
}

export interface GetActiveTablesResponse extends Array<TableWithSession> {}

export interface GetTableHistoryResponse extends Array<OrderHistory> {}

// --- Menus API ---

export interface GetMenusParams {
  category_id?: number;
  available?: boolean;
}

export interface CreateMenuRequest {
  name: string;
  price: number;
  description?: string;
  category_id: number;
  is_available?: boolean;
}

export interface CreateMenuResponse extends Menu {}

export interface UpdateMenuRequest {
  name?: string;
  price?: number;
  description?: string;
  is_available?: boolean;
}

export interface UpdateMenuResponse extends Menu {}

// ============================================================================
// SSE Event Types
// ============================================================================

export type SSEEventType = 'order_created' | 'order_status_updated' | 'order_deleted';

export interface SSEOrderCreatedEvent {
  type: 'order_created';
  order: {
    id: number;
    order_number: number;
    table_number: number;
    status: OrderStatus;
    items: {
      menu_name: string;
      quantity: number;
    }[];
  };
}

export interface SSEOrderStatusUpdatedEvent {
  type: 'order_status_updated';
  order: {
    id: number;
    order_number: number;
    status: OrderStatus;
    previous_status: OrderStatus;
  };
}

export interface SSEOrderDeletedEvent {
  type: 'order_deleted';
  order_id: number;
}

export type SSEEvent = SSEOrderCreatedEvent | SSEOrderStatusUpdatedEvent | SSEOrderDeletedEvent;

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string; // Error code (e.g., "ORDER_NOT_FOUND")
  message: string; // Human-readable message
  details?: Record<string, any>; // Additional error details
}

export type ErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_INSUFFICIENT_PERMISSION'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_STATUS_CONFLICT'
  | 'MENU_NOT_FOUND'
  | 'TABLE_NOT_FOUND'
  | 'SESSION_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR';

// ============================================================================
// Utility Types
// ============================================================================

// API Response wrapper (optional, if needed)
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

// Pagination (for future use)
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ============================================================================
// Cart Types (Customer Frontend)
// ============================================================================

export interface CartItem {
  menu: Menu;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// ============================================================================
// Authentication Context Types
// ============================================================================

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  role: UserRole;
  store_id: number;
  sub: string; // store_id or admin_id
}

// ============================================================================
// Component Props Types (Example)
// ============================================================================

// Customer Frontend
export interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
}

export interface CartProps {
  cart: Cart;
  onUpdateQuantity: (menuId: number, quantity: number) => void;
  onRemoveItem: (menuId: number) => void;
  onCheckout: () => void;
}

export interface OrderStatusProps {
  orders: Order[];
}

// Admin Frontend
export interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
  onDeleteOrder: (orderId: number) => void;
}

export interface ActiveTableCardProps {
  table: TableWithSession;
  onCompleteSession: (tableId: number) => void;
}

export interface MenuManagementProps {
  menus: Menu[];
  categories: MenuCategory[];
  onCreateMenu: (menu: CreateMenuRequest) => void;
  onUpdateMenu: (menuId: number, menu: UpdateMenuRequest) => void;
  onDeleteMenu: (menuId: number) => void;
}

// ============================================================================
// API Client Types
// ============================================================================

export interface ApiClient {
  // Auth
  loginCustomer: (credentials: CustomerLoginRequest) => Promise<CustomerLoginResponse>;
  loginAdmin: (credentials: AdminLoginRequest) => Promise<AdminLoginResponse>;
  logout: () => Promise<LogoutResponse>;

  // Orders
  getOrders: (params?: GetOrdersParams) => Promise<Order[]>;
  getOrder: (orderId: number) => Promise<Order>;
  createOrder: (order: CreateOrderRequest) => Promise<CreateOrderResponse>;
  updateOrderStatus: (orderId: number, request: UpdateOrderStatusRequest) => Promise<UpdateOrderStatusResponse>;
  deleteOrder: (orderId: number) => Promise<void>;

  // Tables
  getTableSession: () => Promise<GetTableSessionResponse>;
  completeTableSession: (request: CompleteTableSessionRequest) => Promise<CompleteTableSessionResponse>;
  getActiveTables: () => Promise<GetActiveTablesResponse>;
  getTableHistory: (tableId: number) => Promise<GetTableHistoryResponse>;

  // Menus
  getMenus: (params?: GetMenusParams) => Promise<Menu[]>;
  createMenu: (menu: CreateMenuRequest) => Promise<CreateMenuResponse>;
  updateMenu: (menuId: number, menu: UpdateMenuRequest) => Promise<UpdateMenuResponse>;
  deleteMenu: (menuId: number) => Promise<void>;

  // SSE
  subscribeToOrders: (onEvent: (event: SSEEvent) => void) => () => void; // Returns unsubscribe function
}

// ============================================================================
// Mock API Types (for Mock Implementation)
// ============================================================================

export interface MockApiConfig {
  baseUrl: string;
  delay?: number; // Simulate network delay (ms)
  errorRate?: number; // Simulate errors (0-1)
}

export interface MockDatabase {
  stores: Store[];
  admins: Admin[];
  tables: Table[];
  table_sessions: TableSession[];
  menu_categories: MenuCategory[];
  menus: Menu[];
  orders: Order[];
  order_items: OrderItem[];
  order_histories: OrderHistory[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isOrderCreatedEvent(event: SSEEvent): event is SSEOrderCreatedEvent {
  return event.type === 'order_created';
}

export function isOrderStatusUpdatedEvent(event: SSEEvent): event is SSEOrderStatusUpdatedEvent {
  return event.type === 'order_status_updated';
}

export function isOrderDeletedEvent(event: SSEEvent): event is SSEOrderDeletedEvent {
  return event.type === 'order_deleted';
}

export function isApiError(error: any): error is ApiError {
  return error && typeof error.error === 'string' && typeof error.message === 'string';
}

// ============================================================================
// Constants
// ============================================================================

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'preparing', 'completed'];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: '잘못된 자격 증명입니다.',
  AUTH_TOKEN_EXPIRED: '토큰이 만료되었습니다. 다시 로그인하세요.',
  AUTH_INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  AUTH_INSUFFICIENT_PERMISSION: '권한이 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  ORDER_STATUS_CONFLICT: '주문 상태를 변경할 수 없습니다.',
  MENU_NOT_FOUND: '메뉴를 찾을 수 없습니다.',
  TABLE_NOT_FOUND: '테이블을 찾을 수 없습니다.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력값이 유효하지 않습니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.'
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const SSE_URL = `${API_BASE_URL}/api/sse/orders`;
