import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  Cart,
  CartItem,
  Menu,
  MenuCategory,
  Order,
  CreateOrderRequest,
} from '@/data-access/types';
import { api } from '@/data-access/api';
import {
  saveCart,
  loadCart,
  clearCart as clearCartStorage,
  saveCustomerAuth,
  loadCustomerAuth,
  clearCustomerAuth,
  calculateCartTotal,
} from '@/data-access/localStorageManager';
import {
  validateCartItem,
  isMenuInCart,
  validateOrderRequest,
} from '@/business-logic/validators/domainValidators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utility/constants';
import Logger from '@/infrastructure/Logger';

// ============================================================================
// Types
// ============================================================================

interface CustomerSession {
  isAuthenticated: boolean;
  tableNumber: number | null;
  storeId: number | null;
  tableId: number | null;
}

interface CustomerAppState {
  cart: Cart;
  menus: Menu[];
  categories: MenuCategory[];
  session: CustomerSession;
  loading: boolean;
  error: string | null;
}

interface CustomerAppContextValue extends CustomerAppState {
  // Auth actions
  login: (tableNumber: number, password: string) => Promise<void>;
  logout: () => void;

  // Menu actions
  loadMenus: () => Promise<void>;

  // Cart actions
  addToCart: (menu: Menu, quantity: number) => void;
  updateCartItemQuantity: (menuId: number, quantity: number) => void;
  removeFromCart: (menuId: number) => void;
  clearCart: () => void;

  // Order actions
  createOrder: () => Promise<Order>;
  loadOrderHistory: () => Promise<Order[]>;

  // UI actions
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ============================================================================
// Context
// ============================================================================

const CustomerAppContext = createContext<CustomerAppContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider
// ============================================================================

interface CustomerAppProviderProps {
  children: ReactNode;
}

export function CustomerAppProvider({ children }: CustomerAppProviderProps) {
  const [state, setState] = useState<CustomerAppState>({
    cart: { items: [], total: 0 },
    menus: [],
    categories: [],
    session: {
      isAuthenticated: false,
      tableNumber: null,
      storeId: null,
      tableId: null,
    },
    loading: false,
    error: null,
  });

  // ========================================================================
  // Initialization: Load cart from LocalStorage
  // ========================================================================

  useEffect(() => {
    const savedCart = loadCart();
    if (savedCart) {
      setState((prev) => ({ ...prev, cart: savedCart }));
      Logger.info('Cart loaded from LocalStorage on init');
    }
  }, []);

  // ========================================================================
  // Auth Actions
  // ========================================================================

  const login = useCallback(
    async (tableNumber: number, password: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await api.loginCustomer({ table_number: tableNumber, password });

        // Save auth credentials to LocalStorage
        saveCustomerAuth({
          tableNumber,
          password,
          storeId: response.store.id,
        });

        setState((prev) => ({
          ...prev,
          session: {
            isAuthenticated: true,
            tableNumber,
            storeId: response.store.id,
            tableId: tableNumber, // Simplified: tableId = tableNumber
          },
          loading: false,
        }));

        Logger.info('Login successful', { tableNumber, storeId: response.store.id });
      } catch (error: any) {
        Logger.error('Login failed', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearCustomerAuth();
    clearCartStorage();

    setState({
      cart: { items: [], total: 0 },
      menus: [],
      categories: [],
      session: {
        isAuthenticated: false,
        tableNumber: null,
        storeId: null,
        tableId: null,
      },
      loading: false,
      error: null,
    });

    Logger.info('Logout successful');
  }, []);

  // ========================================================================
  // Menu Actions
  // ========================================================================

  const loadMenus = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const menus = await api.getMenus({ available: true });

      // Extract unique categories
      const categoriesMap = new Map<number, MenuCategory>();
      menus.forEach((menu) => {
        if (menu.category) {
          categoriesMap.set(menu.category.id, menu.category);
        }
      });
      const categories = Array.from(categoriesMap.values()).sort(
        (a, b) => a.display_order - b.display_order
      );

      setState((prev) => ({
        ...prev,
        menus,
        categories,
        loading: false,
      }));

      Logger.info('Menus loaded', { count: menus.length });
    } catch (error: any) {
      Logger.error('Load menus failed', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
      }));
      throw error;
    }
  }, []);

  // ========================================================================
  // Cart Actions
  // ========================================================================

  const addToCart = useCallback(
    (menu: Menu, quantity: number) => {
      try {
        const newItem: CartItem = { menu, quantity };

        // Validate cart item
        const validation = validateCartItem(newItem);
        if (!validation.valid) {
          throw new Error(validation.message);
        }

        setState((prev) => {
          // Check for duplicates
          if (isMenuInCart(prev.cart, menu.id)) {
            throw new Error('이미 장바구니에 있는 메뉴입니다.');
          }

          const newItems = [...prev.cart.items, newItem];
          const newCart: Cart = {
            items: newItems,
            total: calculateCartTotal(newItems),
          };

          // Save to LocalStorage
          saveCart(newCart);

          Logger.info('Item added to cart', { menuId: menu.id, quantity });

          return { ...prev, cart: newCart };
        });
      } catch (error: any) {
        Logger.error('Add to cart failed', error);
        throw error;
      }
    },
    []
  );

  const updateCartItemQuantity = useCallback((menuId: number, quantity: number) => {
    try {
      setState((prev) => {
        const newItems = prev.cart.items.map((item) =>
          item.menu.id === menuId ? { ...item, quantity } : item
        );

        const newCart: Cart = {
          items: newItems,
          total: calculateCartTotal(newItems),
        };

        // Save to LocalStorage
        saveCart(newCart);

        Logger.info('Cart item quantity updated', { menuId, quantity });

        return { ...prev, cart: newCart };
      });
    } catch (error: any) {
      Logger.error('Update quantity failed', error);
      throw error;
    }
  }, []);

  const removeFromCart = useCallback((menuId: number) => {
    try {
      setState((prev) => {
        const newItems = prev.cart.items.filter((item) => item.menu.id !== menuId);

        const newCart: Cart = {
          items: newItems,
          total: calculateCartTotal(newItems),
        };

        // Save to LocalStorage
        saveCart(newCart);

        Logger.info('Item removed from cart', { menuId });

        return { ...prev, cart: newCart };
      });
    } catch (error: any) {
      Logger.error('Remove from cart failed', error);
      throw error;
    }
  }, []);

  const clearCart = useCallback(() => {
    clearCartStorage();

    setState((prev) => ({
      ...prev,
      cart: { items: [], total: 0 },
    }));

    Logger.info('Cart cleared');
  }, []);

  // ========================================================================
  // Order Actions
  // ========================================================================

  const createOrder = useCallback(async (): Promise<Order> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Validate order request
      if (!state.session.tableId) {
        throw new Error('테이블 정보가 없습니다.');
      }

      const validation = validateOrderRequest(state.cart, state.session.tableId);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Create order request
      const request: CreateOrderRequest = {
        table_id: state.session.tableId,
        items: state.cart.items.map((item) => ({
          menu_id: item.menu.id,
          quantity: item.quantity,
        })),
      };

      const order = await api.createOrder(request);

      // Clear cart after successful order
      clearCartStorage();

      setState((prev) => ({
        ...prev,
        cart: { items: [], total: 0 },
        loading: false,
      }));

      Logger.info('Order created successfully', { orderId: order.id });

      return order;
    } catch (error: any) {
      Logger.error('Create order failed', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || ERROR_MESSAGES.ORDER_CREATE_FAILED,
      }));
      throw error;
    }
  }, [state.cart, state.session.tableId]);

  const loadOrderHistory = useCallback(async (): Promise<Order[]> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (!state.session.tableId) {
        throw new Error('테이블 정보가 없습니다.');
      }

      const orders = await api.getOrderHistory(state.session.tableId);

      setState((prev) => ({ ...prev, loading: false }));

      Logger.info('Order history loaded', { count: orders.length });

      return orders;
    } catch (error: any) {
      Logger.error('Load order history failed', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
      }));
      throw error;
    }
  }, [state.session.tableId]);

  // ========================================================================
  // UI Actions
  // ========================================================================

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info') => {
      // Toast implementation will be in Toast component
      Logger.info('Toast:', { message, type });
      // This is a placeholder - actual toast will be implemented in UI layer
    },
    []
  );

  // ========================================================================
  // Context Value
  // ========================================================================

  const value: CustomerAppContextValue = {
    ...state,
    login,
    logout,
    loadMenus,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    loadOrderHistory,
    showToast,
  };

  return (
    <CustomerAppContext.Provider value={value}>
      {children}
    </CustomerAppContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useCustomerApp(): CustomerAppContextValue {
  const context = useContext(CustomerAppContext);
  if (context === undefined) {
    throw new Error('useCustomerApp must be used within CustomerAppProvider');
  }
  return context;
}
