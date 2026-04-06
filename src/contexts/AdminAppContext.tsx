import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';
import {
  AdminAppState,
  AdminAppAction,
  Admin,
  Order,
  OrderStatus,
  Table,
  Menu,
  Category,
} from '../services/types';

// ============================================================================
// Initial State
// ============================================================================

const initialState: AdminAppState = {
  auth: {
    isAuthenticated: false,
    admin: null,
    token: null,
    loading: false,
    error: null,
  },
  orders: [],
  tables: [],
  menus: [],
  categories: [],
  sse: {
    isConnected: false,
    error: null,
    reconnectAttempts: 0,
  },
  selectedTableId: null,
  loading: {
    orders: false,
    tables: false,
    menus: false,
    categories: false,
  },
  error: {
    orders: null,
    tables: null,
    menus: null,
    categories: null,
  },
};

// ============================================================================
// Reducer
// ============================================================================

function adminAppReducer(
  state: AdminAppState,
  action: AdminAppAction
): AdminAppState {
  switch (action.type) {
    // Auth Actions
    case 'AUTH_LOGIN_START':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: true,
          error: null,
        },
      };

    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          admin: action.payload.admin,
          token: action.payload.token,
          loading: false,
          error: null,
        },
      };

    case 'AUTH_LOGIN_FAILURE':
      return {
        ...state,
        auth: {
          ...state.auth,
          loading: false,
          error: action.payload.error,
        },
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };

    // Orders Actions
    case 'ORDERS_FETCH_START':
      return {
        ...state,
        loading: { ...state.loading, orders: true },
        error: { ...state.error, orders: null },
      };

    case 'ORDERS_FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload.orders,
        loading: { ...state.loading, orders: false },
      };

    case 'ORDERS_FETCH_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, orders: false },
        error: { ...state.error, orders: action.payload.error },
      };

    case 'ORDER_ADD':
      return {
        ...state,
        orders: [action.payload.order, ...state.orders],
      };

    case 'ORDER_UPDATE':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.order.id ? action.payload.order : order
        ),
      };

    case 'ORDER_DELETE':
      return {
        ...state,
        orders: state.orders.filter(
          (order) => order.id !== action.payload.orderId
        ),
      };

    case 'ORDER_STATUS_UPDATE_START':
      return state; // Optimistic update handled by ORDER_UPDATE

    case 'ORDER_STATUS_UPDATE_SUCCESS':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
      };

    case 'ORDER_STATUS_UPDATE_FAILURE':
      return state; // Could revert optimistic update here

    case 'ORDER_DELETE_START':
      return state;

    case 'ORDER_DELETE_SUCCESS':
      return {
        ...state,
        orders: state.orders.filter(
          (order) => order.id !== action.payload.orderId
        ),
      };

    case 'ORDER_DELETE_FAILURE':
      return state;

    // Tables Actions
    case 'TABLES_FETCH_START':
      return {
        ...state,
        loading: { ...state.loading, tables: true },
        error: { ...state.error, tables: null },
      };

    case 'TABLES_FETCH_SUCCESS':
      return {
        ...state,
        tables: action.payload.tables,
        loading: { ...state.loading, tables: false },
      };

    case 'TABLES_FETCH_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, tables: false },
        error: { ...state.error, tables: action.payload.error },
      };

    case 'TABLE_SELECT':
      return {
        ...state,
        selectedTableId: action.payload.tableId,
      };

    case 'TABLE_SESSION_END_START':
      return state;

    case 'TABLE_SESSION_END_SUCCESS':
      return {
        ...state,
        tables: state.tables.map((table) =>
          table.id === action.payload.tableId
            ? { ...table, sessionId: null, isActive: false }
            : table
        ),
        orders: state.orders.filter(
          (order) => order.tableId !== action.payload.tableId
        ),
      };

    case 'TABLE_SESSION_END_FAILURE':
      return state;

    // Menus Actions
    case 'MENUS_FETCH_START':
      return {
        ...state,
        loading: { ...state.loading, menus: true },
        error: { ...state.error, menus: null },
      };

    case 'MENUS_FETCH_SUCCESS':
      return {
        ...state,
        menus: action.payload.menus,
        loading: { ...state.loading, menus: false },
      };

    case 'MENUS_FETCH_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, menus: false },
        error: { ...state.error, menus: action.payload.error },
      };

    case 'MENU_ADD':
      return {
        ...state,
        menus: [...state.menus, action.payload.menu],
      };

    case 'MENU_UPDATE':
      return {
        ...state,
        menus: state.menus.map((menu) =>
          menu.id === action.payload.menu.id ? action.payload.menu : menu
        ),
      };

    case 'MENU_DELETE':
      return {
        ...state,
        menus: state.menus.filter((menu) => menu.id !== action.payload.menuId),
      };

    // Categories Actions
    case 'CATEGORIES_FETCH_START':
      return {
        ...state,
        loading: { ...state.loading, categories: true },
        error: { ...state.error, categories: null },
      };

    case 'CATEGORIES_FETCH_SUCCESS':
      return {
        ...state,
        categories: action.payload.categories,
        loading: { ...state.loading, categories: false },
      };

    case 'CATEGORIES_FETCH_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, categories: false },
        error: { ...state.error, categories: action.payload.error },
      };

    // SSE Actions
    case 'SSE_CONNECTED':
      return {
        ...state,
        sse: {
          isConnected: true,
          error: null,
          reconnectAttempts: 0,
        },
      };

    case 'SSE_DISCONNECTED':
      return {
        ...state,
        sse: {
          ...state.sse,
          isConnected: false,
        },
      };

    case 'SSE_ERROR':
      return {
        ...state,
        sse: {
          ...state.sse,
          error: action.payload.error,
        },
      };

    case 'SSE_RECONNECT_ATTEMPT':
      return {
        ...state,
        sse: {
          ...state.sse,
          reconnectAttempts: action.payload.attempts,
        },
      };

    case 'SSE_RECONNECT_RESET':
      return {
        ...state,
        sse: {
          ...state.sse,
          reconnectAttempts: 0,
        },
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface AdminAppContextValue {
  state: AdminAppState;
  dispatch: React.Dispatch<AdminAppAction>;
}

const AdminAppContext = createContext<AdminAppContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface AdminAppProviderProps {
  children: ReactNode;
}

export function AdminAppProvider({ children }: AdminAppProviderProps) {
  const [state, dispatch] = useReducer(adminAppReducer, initialState);

  // Restore auth state from sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const adminData = sessionStorage.getItem('adminData');

    if (token && adminData) {
      try {
        const admin: Admin = JSON.parse(adminData);
        dispatch({
          type: 'AUTH_LOGIN_SUCCESS',
          payload: { admin, token },
        });
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('adminData');
      }
    }
  }, []);

  // Persist auth state to sessionStorage on change
  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.token && state.auth.admin) {
      sessionStorage.setItem('authToken', state.auth.token);
      sessionStorage.setItem('adminData', JSON.stringify(state.auth.admin));
    } else {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('adminData');
    }
  }, [state.auth.isAuthenticated, state.auth.token, state.auth.admin]);

  return (
    <AdminAppContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminAppContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAdminApp(): AdminAppContextValue {
  const context = useContext(AdminAppContext);
  if (!context) {
    throw new Error('useAdminApp must be used within AdminAppProvider');
  }
  return context;
}
