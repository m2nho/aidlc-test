# Unit 3: Admin Frontend - State Management Design

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## State Management Strategy

답변: **A) Single Context** - 모든 상태를 하나의 AdminAppContext에 통합

---

## AdminAppContext Design

### Context Structure

```tsx
interface AdminAppState {
  // Authentication
  auth: {
    isAuthenticated: boolean;
    admin: Admin | null;
    isLoading: boolean;
  };
  
  // Orders (for Dashboard)
  orders: {
    data: Order[];
    isLoading: boolean;
    error: string | null;
    newOrderIds: Set<number>; // 신규 주문 강조용
  };
  
  // Tables (for Table Management)
  tables: {
    data: Table[];
    isLoading: boolean;
    error: string | null;
  };
  
  // Menus (for Menu Management)
  menus: {
    data: Menu[];
    categories: MenuCategory[];
    isLoading: boolean;
    error: string | null;
  };
  
  // SSE Connection
  sse: {
    isConnected: boolean;
    reconnectAttempts: number;
    lastError: string | null;
  };
}
```

### Context Actions

```tsx
type AdminAppAction =
  // Auth actions
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { admin: Admin } }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CHECK_SESSION' }
  
  // Orders actions
  | { type: 'ORDERS_FETCH_START' }
  | { type: 'ORDERS_FETCH_SUCCESS'; payload: { orders: Order[] } }
  | { type: 'ORDERS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'ORDER_ADD'; payload: { order: Order } }
  | { type: 'ORDER_UPDATE'; payload: { orderId: number; updates: Partial<Order> } }
  | { type: 'ORDER_DELETE'; payload: { orderId: number } }
  | { type: 'ORDER_MARK_NEW'; payload: { orderId: number } }
  | { type: 'ORDER_CLEAR_NEW'; payload: { orderId: number } }
  
  // Tables actions
  | { type: 'TABLES_FETCH_START' }
  | { type: 'TABLES_FETCH_SUCCESS'; payload: { tables: Table[] } }
  | { type: 'TABLES_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'TABLE_UPDATE'; payload: { tableId: number; updates: Partial<Table> } }
  
  // Menus actions
  | { type: 'MENUS_FETCH_START' }
  | { type: 'MENUS_FETCH_SUCCESS'; payload: { menus: Menu[]; categories: MenuCategory[] } }
  | { type: 'MENUS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'MENU_ADD'; payload: { menu: Menu } }
  | { type: 'MENU_UPDATE'; payload: { menuId: number; updates: Partial<Menu> } }
  | { type: 'MENU_DELETE'; payload: { menuId: number } }
  
  // SSE actions
  | { type: 'SSE_CONNECT' }
  | { type: 'SSE_DISCONNECT' }
  | { type: 'SSE_RECONNECT_ATTEMPT'; payload: { attempt: number } }
  | { type: 'SSE_ERROR'; payload: { error: string } };
```

### Context Reducer

```tsx
function adminAppReducer(state: AdminAppState, action: AdminAppAction): AdminAppState {
  switch (action.type) {
    // Auth reducers
    case 'AUTH_LOGIN_START':
      return {
        ...state,
        auth: { ...state.auth, isLoading: true }
      };
    
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          admin: action.payload.admin,
          isLoading: false
        }
      };
    
    case 'AUTH_LOGIN_FAILURE':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          admin: null,
          isLoading: false
        }
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState, // Reset to initial state
        auth: { isAuthenticated: false, admin: null, isLoading: false }
      };
    
    // Orders reducers
    case 'ORDERS_FETCH_START':
      return {
        ...state,
        orders: { ...state.orders, isLoading: true, error: null }
      };
    
    case 'ORDERS_FETCH_SUCCESS':
      return {
        ...state,
        orders: {
          data: action.payload.orders,
          isLoading: false,
          error: null,
          newOrderIds: state.orders.newOrderIds
        }
      };
    
    case 'ORDER_ADD':
      return {
        ...state,
        orders: {
          ...state.orders,
          data: [action.payload.order, ...state.orders.data],
          newOrderIds: new Set([...state.orders.newOrderIds, action.payload.order.id])
        }
      };
    
    case 'ORDER_UPDATE':
      return {
        ...state,
        orders: {
          ...state.orders,
          data: state.orders.data.map(order =>
            order.id === action.payload.orderId
              ? { ...order, ...action.payload.updates }
              : order
          )
        }
      };
    
    case 'ORDER_DELETE':
      return {
        ...state,
        orders: {
          ...state.orders,
          data: state.orders.data.filter(order => order.id !== action.payload.orderId)
        }
      };
    
    case 'ORDER_MARK_NEW':
      return {
        ...state,
        orders: {
          ...state.orders,
          newOrderIds: new Set([...state.orders.newOrderIds, action.payload.orderId])
        }
      };
    
    case 'ORDER_CLEAR_NEW':
      const newIds = new Set(state.orders.newOrderIds);
      newIds.delete(action.payload.orderId);
      return {
        ...state,
        orders: { ...state.orders, newOrderIds: newIds }
      };
    
    // Tables, Menus, SSE reducers (similar pattern)
    // ... (생략 - 동일한 패턴)
    
    default:
      return state;
  }
}
```

### Context Provider Implementation

```tsx
// src/contexts/AdminAppContext.tsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AdminAppContext = createContext<{
  state: AdminAppState;
  dispatch: React.Dispatch<AdminAppAction>;
} | undefined>(undefined);

export function AdminAppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminAppReducer, initialState);
  
  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);
  
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies
      });
      if (response.ok) {
        const admin = await response.json();
        dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { admin } });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };
  
  return (
    <AdminAppContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminAppContext.Provider>
  );
}

export function useAdminAppContext() {
  const context = useContext(AdminAppContext);
  if (!context) {
    throw new Error('useAdminAppContext must be used within AdminAppProvider');
  }
  return context;
}
```

---

## SSE State Management

답변: **C) Custom Hook (useSSE)** - SSE 연결을 Custom Hook으로 캡슐화

### useSSE Hook Design

```tsx
// src/hooks/useSSE.ts

import { useEffect, useRef } from 'react';
import { useAdminAppContext } from '../contexts/AdminAppContext';
import { createSSEConnection } from '../services/sse';

interface UseSSEOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

export function useSSE(options: UseSSEOptions) {
  const { dispatch } = useAdminAppContext();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    dispatch({ type: 'SSE_CONNECT' });
    
    const eventSource = createSSEConnection(options.url);
    
    eventSource.onmessage = (event) => {
      reconnectAttemptsRef.current = 0; // Reset on successful message
      options.onMessage(event);
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      dispatch({ type: 'SSE_ERROR', payload: { error: 'SSE connection error' } });
      
      if (options.onError) {
        options.onError(error);
      }
      
      // Reconnect with exponential backoff
      if (options.reconnect && reconnectAttemptsRef.current < (options.maxReconnectAttempts || 5)) {
        const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // 1s, 2s, 4s, 8s, 16s
        reconnectAttemptsRef.current += 1;
        
        dispatch({
          type: 'SSE_RECONNECT_ATTEMPT',
          payload: { attempt: reconnectAttemptsRef.current }
        });
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      } else {
        dispatch({ type: 'SSE_DISCONNECT' });
      }
    };
    
    eventSource.onopen = () => {
      console.log('SSE connected');
      dispatch({ type: 'SSE_CONNECT' });
    };
    
    eventSourceRef.current = eventSource;
  };
  
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    dispatch({ type: 'SSE_DISCONNECT' });
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [options.url]);
  
  return { disconnect, reconnect: connect };
}
```

### useSSE Usage in DashboardPage

```tsx
// src/pages/DashboardPage.tsx

import { useSSE } from '../hooks/useSSE';
import { useAdminAppContext } from '../contexts/AdminAppContext';

function DashboardPage() {
  const { state, dispatch } = useAdminAppContext();
  
  // SSE connection
  useSSE({
    url: '/api/events/orders',
    reconnect: true,
    maxReconnectAttempts: 5,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'order.created':
          dispatch({ type: 'ORDER_ADD', payload: { order: data.data } });
          dispatch({ type: 'ORDER_MARK_NEW', payload: { orderId: data.data.id } });
          
          // 3초 후 신규 표시 제거
          setTimeout(() => {
            dispatch({ type: 'ORDER_CLEAR_NEW', payload: { orderId: data.data.id } });
          }, 3000);
          break;
        
        case 'order.updated':
          dispatch({
            type: 'ORDER_UPDATE',
            payload: { orderId: data.data.id, updates: data.data }
          });
          break;
        
        case 'order.deleted':
          dispatch({ type: 'ORDER_DELETE', payload: { orderId: data.data.id } });
          break;
      }
    },
    onError: (error) => {
      console.error('SSE connection failed:', error);
    }
  });
  
  // ... rest of component
}
```

---

## Local State vs Context State

### When to Use Context State:
- **Auth**: 모든 페이지에서 필요
- **Orders**: Dashboard + TableManagement에서 공유
- **Tables**: TableManagement에서 주로 사용, Dashboard에서도 참조 가능
- **Menus**: MenuManagement에서 주로 사용
- **SSE**: Dashboard에서 사용, 전역 상태로 연결 상태 추적

### When to Use Local State:
- **UI State**: 모달 열림/닫힘, 폼 입력값, 로딩 상태 (해당 컴포넌트에만 영향)
- **Temporary State**: 검색 필터, 정렬 옵션, 페이지네이션
- **Form State**: MenuForm, TableSetupForm의 입력 필드

### Examples:

**Context State**:
```tsx
// Dashboard에서 주문 목록 조회
const { state } = useAdminAppContext();
const orders = state.orders.data;
```

**Local State**:
```tsx
// LoginPage의 폼 입력
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
```

---

## State Update Patterns

### Pattern 1: API Call → Context Update

```tsx
// LoginPage.tsx
const handleLogin = async () => {
  dispatch({ type: 'AUTH_LOGIN_START' });
  
  try {
    const response = await fetch('/api/auth/login/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (response.ok) {
      const admin = await response.json();
      dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { admin } });
      navigate('/');
    } else {
      dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: { error: 'Login failed' } });
    }
  } catch (error) {
    dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: { error: error.message } });
  }
};
```

### Pattern 2: SSE Event → Context Update (Direct)

답변: **A) Direct State Update** - SSE 이벤트 수신 시 즉시 상태 업데이트

```tsx
// useSSE hook handles this automatically
// DashboardPage just needs to setup the hook

useSSE({
  url: '/api/events/orders',
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    // Direct dispatch to context
    dispatch({ type: 'ORDER_ADD', payload: { order: data.data } });
  }
});
```

### Pattern 3: Optimistic Update (Not Used in MVP)

- MVP에서는 사용하지 않음
- 모든 변경은 서버 응답 후 상태 업데이트

---

## State Persistence

### Session Storage:
- **auth.admin**: 페이지 새로고침 시 세션 유지 (sessionStorage)
- 구현:
  ```tsx
  // AdminAppProvider에서
  useEffect(() => {
    if (state.auth.admin) {
      sessionStorage.setItem('admin', JSON.stringify(state.auth.admin));
    } else {
      sessionStorage.removeItem('admin');
    }
  }, [state.auth.admin]);
  ```

### No Persistence:
- **orders, tables, menus**: 페이지 새로고침 시 API 재호출
- SSE 연결도 재연결

---

## Error State Management

### Error Handling Strategy

답변: **E) Hybrid** - Try-Catch + Error Boundary

1. **API Errors**: Try-Catch로 잡아서 Context에 error 저장
2. **Rendering Errors**: Error Boundary로 처리

```tsx
// API Error Example
try {
  const response = await fetch('/api/orders');
  if (!response.ok) throw new Error('Failed to fetch orders');
  const orders = await response.json();
  dispatch({ type: 'ORDERS_FETCH_SUCCESS', payload: { orders } });
} catch (error) {
  dispatch({ type: 'ORDERS_FETCH_FAILURE', payload: { error: error.message } });
}

// Error Boundary (App.tsx)
<ErrorBoundary fallback={<ErrorFallback />}>
  <AdminAppProvider>
    {/* app content */}
  </AdminAppProvider>
</ErrorBoundary>
```

---

## State Visualization

### Initial State
```tsx
const initialState: AdminAppState = {
  auth: {
    isAuthenticated: false,
    admin: null,
    isLoading: true // true during session check
  },
  orders: {
    data: [],
    isLoading: false,
    error: null,
    newOrderIds: new Set()
  },
  tables: {
    data: [],
    isLoading: false,
    error: null
  },
  menus: {
    data: [],
    categories: [],
    isLoading: false,
    error: null
  },
  sse: {
    isConnected: false,
    reconnectAttempts: 0,
    lastError: null
  }
};
```

### State After Login
```tsx
{
  auth: {
    isAuthenticated: true,
    admin: { id: 1, username: 'admin', store_id: 1 },
    isLoading: false
  },
  // ... rest unchanged
}
```

### State After Fetching Orders
```tsx
{
  // ... auth
  orders: {
    data: [
      { id: 1, table_id: 5, order_number: 123, status: 'pending', items: [...] },
      { id: 2, table_id: 3, order_number: 124, status: 'preparing', items: [...] }
    ],
    isLoading: false,
    error: null,
    newOrderIds: new Set()
  },
  // ... rest
}
```

### State After SSE New Order
```tsx
{
  // ... auth
  orders: {
    data: [
      { id: 3, table_id: 7, order_number: 125, status: 'pending', items: [...] }, // NEW
      { id: 1, table_id: 5, order_number: 123, status: 'pending', items: [...] },
      { id: 2, table_id: 3, order_number: 124, status: 'preparing', items: [...] }
    ],
    isLoading: false,
    error: null,
    newOrderIds: new Set([3]) // Highlighted for 3 seconds
  },
  sse: {
    isConnected: true,
    reconnectAttempts: 0,
    lastError: null
  }
}
```

---

## Performance Considerations

### Memoization:
- Context value를 useMemo로 메모이제이션
- 불필요한 리렌더링 방지

```tsx
const contextValue = useMemo(
  () => ({ state, dispatch }),
  [state]
);

return (
  <AdminAppContext.Provider value={contextValue}>
    {children}
  </AdminAppContext.Provider>
);
```

### Selective Subscription:
- 컴포넌트가 필요한 상태만 구독
- 예: MenuManagementPage는 menus만 구독, orders는 무시

```tsx
// MenuManagementPage
const { state } = useAdminAppContext();
const menus = state.menus.data; // Only this triggers re-render
```

---

## Summary

- **Strategy**: Single Context (AdminAppContext)
- **SSE**: Custom Hook (useSSE) with Exponential Backoff
- **SSE Update**: Direct State Update
- **Error Handling**: Try-Catch + Error Boundary
- **Persistence**: Session storage for auth only
- **Performance**: Memoization + Selective subscription
