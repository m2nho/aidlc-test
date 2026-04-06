// ============================================================================
// Domain Models
// ============================================================================

export interface Admin {
  id: string;
  username: string;
  storeId: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  menuId: string;
  menuName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Table {
  id: string;
  tableNumber: string;
  sessionId: string | null;
  isActive: boolean;
}

// ============================================================================
// Auth
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  storeId: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

// ============================================================================
// SSE State
// ============================================================================

export interface SSEState {
  isConnected: boolean;
  error: string | null;
  reconnectAttempts: number;
}

// ============================================================================
// Admin App State
// ============================================================================

export interface AdminAppState {
  auth: AuthState;
  orders: Order[];
  tables: Table[];
  menus: Menu[];
  categories: Category[];
  sse: SSEState;
  selectedTableId: string | null;
  loading: {
    orders: boolean;
    tables: boolean;
    menus: boolean;
    categories: boolean;
  };
  error: {
    orders: string | null;
    tables: string | null;
    menus: string | null;
    categories: string | null;
  };
}

// ============================================================================
// Actions
// ============================================================================

// Auth Actions
export type AuthAction =
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { admin: Admin; token: string } }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' };

// Orders Actions
export type OrdersAction =
  | { type: 'ORDERS_FETCH_START' }
  | { type: 'ORDERS_FETCH_SUCCESS'; payload: { orders: Order[] } }
  | { type: 'ORDERS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'ORDER_ADD'; payload: { order: Order } }
  | { type: 'ORDER_UPDATE'; payload: { order: Order } }
  | { type: 'ORDER_DELETE'; payload: { orderId: string } }
  | {
      type: 'ORDER_STATUS_UPDATE_START';
      payload: { orderId: string; status: OrderStatus };
    }
  | {
      type: 'ORDER_STATUS_UPDATE_SUCCESS';
      payload: { orderId: string; status: OrderStatus };
    }
  | {
      type: 'ORDER_STATUS_UPDATE_FAILURE';
      payload: { orderId: string; error: string };
    }
  | { type: 'ORDER_DELETE_START'; payload: { orderId: string } }
  | { type: 'ORDER_DELETE_SUCCESS'; payload: { orderId: string } }
  | { type: 'ORDER_DELETE_FAILURE'; payload: { orderId: string; error: string } };

// Tables Actions
export type TablesAction =
  | { type: 'TABLES_FETCH_START' }
  | { type: 'TABLES_FETCH_SUCCESS'; payload: { tables: Table[] } }
  | { type: 'TABLES_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'TABLE_SELECT'; payload: { tableId: string | null } }
  | { type: 'TABLE_SESSION_END_START'; payload: { tableId: string } }
  | { type: 'TABLE_SESSION_END_SUCCESS'; payload: { tableId: string } }
  | { type: 'TABLE_SESSION_END_FAILURE'; payload: { tableId: string; error: string } };

// Menus Actions
export type MenusAction =
  | { type: 'MENUS_FETCH_START' }
  | { type: 'MENUS_FETCH_SUCCESS'; payload: { menus: Menu[] } }
  | { type: 'MENUS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'MENU_ADD'; payload: { menu: Menu } }
  | { type: 'MENU_UPDATE'; payload: { menu: Menu } }
  | { type: 'MENU_DELETE'; payload: { menuId: string } };

// Categories Actions
export type CategoriesAction =
  | { type: 'CATEGORIES_FETCH_START' }
  | { type: 'CATEGORIES_FETCH_SUCCESS'; payload: { categories: Category[] } }
  | { type: 'CATEGORIES_FETCH_FAILURE'; payload: { error: string } };

// SSE Actions
export type SSEAction =
  | { type: 'SSE_CONNECTED' }
  | { type: 'SSE_DISCONNECTED' }
  | { type: 'SSE_ERROR'; payload: { error: string } }
  | { type: 'SSE_RECONNECT_ATTEMPT'; payload: { attempts: number } }
  | { type: 'SSE_RECONNECT_RESET' };

// Combined Action Type
export type AdminAppAction =
  | AuthAction
  | OrdersAction
  | TablesAction
  | MenusAction
  | CategoriesAction
  | SSEAction;

// ============================================================================
// API Types
// ============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  endpoint: string;
  method: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

// API Response Types
export interface OrdersResponse {
  orders: Order[];
}

export interface TablesResponse {
  tables: Table[];
}

export interface MenusResponse {
  menus: Menu[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CreateMenuRequest {
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
  id: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormValues {
  storeId: string;
  username: string;
  password: string;
}

export interface MenuFormValues {
  name: string;
  categoryId: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface TableSetupFormValues {
  tableNumber: string;
  password: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationRule<T> = (value: T) => string | null;

export type ValidationRules<T> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

// ============================================================================
// Toast Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

// ============================================================================
// SSE Event Types
// ============================================================================

export interface SSEOrderEvent {
  type: 'order.created' | 'order.updated' | 'order.deleted';
  data: {
    order?: Order;
    orderId?: string;
  };
}
