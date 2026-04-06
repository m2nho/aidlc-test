# Unit 3: Admin Frontend - NFR Design Patterns

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Design  
**Date**: 2026-04-06

---

## NFR Design Patterns Overview

NFR Requirements를 구현하기 위한 구체적인 설계 패턴을 정의합니다.

---

## 1. Error Handling Patterns

### 1.1 Error Boundary Pattern

**Purpose**: 컴포넌트 렌더링 에러 catch 및 Fallback UI 표시

**Pattern**: React Error Boundary

**Implementation**:
```tsx
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    // TODO: Log to error tracking service (Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; // Navigate to home
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-gray-700 mb-4">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-4">
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage**:
```tsx
// App.tsx
<ErrorBoundary>
  <AdminAppProvider>
    <Router>
      <Routes>
        {/* ... */}
      </Routes>
    </Router>
  </AdminAppProvider>
</ErrorBoundary>
```

**Scope**: 전체 애플리케이션 (Full page error)

---

### 1.2 API Error Handling Pattern

**Purpose**: API 요청 에러 처리 및 사용자 피드백

**Pattern**: Try-Catch with Toast Notification

**Implementation**:
```tsx
// src/utils/errorHandling.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        return '인증이 만료되었습니다. 다시 로그인해주세요.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '리소스를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
  }

  if (error instanceof Error) {
    // Network error
    if (error.message === 'Failed to fetch') {
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    }
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 401;
}
```

**Usage**:
```tsx
// Example: LoginPage
try {
  const response = await fetch('/api/auth/login/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(response.status, data.message || 'Login failed', data);
  }

  const admin = await response.json();
  dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { admin } });
  navigate('/');
} catch (error) {
  if (isAuthError(error)) {
    dispatch({ type: 'AUTH_LOGOUT' });
    navigate('/login');
  }
  const errorMessage = handleApiError(error);
  showToast(errorMessage, 'error');
}
```

---

### 1.3 Environment-Specific Error Messages

**Purpose**: 개발 환경에서는 상세 에러, 프로덕션에서는 일반 메시지

**Pattern**: 환경별 에러 메시지 분리

**Implementation**:
```tsx
// src/utils/errorHandling.ts
export function getErrorMessage(error: Error, userMessage: string): string {
  if (import.meta.env.DEV) {
    // Development: Show detailed error
    return `${userMessage}\n\nDetails: ${error.message}\n${error.stack}`;
  } else {
    // Production: Show generic message only
    return userMessage;
  }
}

// Usage
const errorMessage = getErrorMessage(
  error,
  '서버 오류가 발생했습니다.'
);
```

---

## 2. Loading Patterns

### 2.1 Page-Level Loading (Suspense Fallback)

**Purpose**: 페이지 전환 시 로딩 표시

**Pattern**: React Suspense + Lazy Loading

**Implementation**:
```tsx
// App.tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/menus" element={<MenuManagementPage />} />
      </Routes>
    </Suspense>
  );
}
```

```tsx
// LoadingSpinner.tsx
interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

function LoadingSpinner({ fullScreen, size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${sizeClasses[size]}`} />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}
```

---

### 2.2 Button-Level Loading (Action Feedback)

**Purpose**: API 요청 중 버튼 로딩 표시

**Pattern**: Button with Loading State

**Implementation**:
```tsx
// Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
}

function Button({ label, onClick, variant = 'primary', isLoading, disabled }: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || loading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {(isLoading || loading) ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="small" />
          <span>처리 중...</span>
        </div>
      ) : (
        label
      )}
    </button>
  );
}
```

---

## 3. Caching & Data Management Patterns

### 3.1 Memory Caching (Context-Based)

**Purpose**: API 응답을 메모리에 캐싱하여 불필요한 요청 방지

**Pattern**: Context State as Cache

**Implementation**:
```tsx
// AdminAppContext.tsx
// 이미 Context에 orders, tables, menus 저장 중 = 메모리 캐싱
const [state, dispatch] = useReducer(adminAppReducer, initialState);

// Cache는 페이지 새로고침 시 초기화
// useEffect에서 데이터 로드
useEffect(() => {
  if (state.auth.isAuthenticated) {
    fetchOrders(); // 인증 후 초기 로드
  }
}, [state.auth.isAuthenticated]);
```

**Cache Invalidation**:
- SSE 이벤트 수신 시: 자동 업데이트 (Direct state update)
- 사용자 액션 (생성/수정/삭제): 즉시 Context 업데이트
- 페이지 새로고침: 초기화 후 재로드

---

### 3.2 SSE Reconnection with Full Sync

**Purpose**: SSE 연결 끊김 후 재연결 시 데이터 동기화

**Pattern**: Reconnect + Fetch

**Implementation**:
```tsx
// useSSE.ts
const connect = () => {
  const eventSource = createSSEConnection(options.url);

  eventSource.onopen = async () => {
    console.log('SSE connected');
    dispatch({ type: 'SSE_CONNECT' });

    // Reconnection 시 전체 데이터 동기화 (놓친 이벤트 보완)
    if (reconnectAttemptsRef.current > 0) {
      await syncData(); // GET /api/orders 호출
    }

    reconnectAttemptsRef.current = 0;
  };

  // ...
};

const syncData = async () => {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();
    dispatch({ type: 'ORDERS_FETCH_SUCCESS', payload: { orders } });
  } catch (error) {
    console.error('Failed to sync data after SSE reconnection:', error);
  }
};
```

---

## 4. Performance Optimization Patterns

### 4.1 Selective Memoization

**Purpose**: 성능 문제 발생 시에만 메모이제이션 적용

**Pattern**: React.memo, useMemo, useCallback (필요 시)

**Guidelines**:
- ❌ 조기 최적화 금지 (Premature optimization)
- ✅ 성능 측정 후 병목 지점에만 적용
- ✅ Expensive computation에 useMemo
- ✅ Props로 전달되는 함수에 useCallback

**Implementation**:
```tsx
// Example: Expensive computation
const sortedOrders = useMemo(() => {
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}, [orders]);

// Example: Callback prop
const handleOrderStatusChange = useCallback((orderId: number, status: OrderStatus) => {
  // ... implementation
}, []);

// Example: Heavy component
const TableCard = React.memo(({ table, orders, onClick }: TableCardProps) => {
  // ... component
});
```

---

### 4.2 Code Splitting (Route-Based)

**Purpose**: 번들 크기 최소화, 초기 로딩 속도 향상

**Pattern**: React.lazy + Suspense

**Implementation**:
```tsx
// App.tsx
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TableManagementPage = lazy(() => import('./pages/TableManagementPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));

<Suspense fallback={<LoadingSpinner fullScreen />}>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    <Route path="/tables" element={<PrivateRoute><TableManagementPage /></PrivateRoute>} />
    <Route path="/menus" element={<PrivateRoute><MenuManagementPage /></PrivateRoute>} />
  </Routes>
</Suspense>
```

**Result**: 각 페이지는 별도 chunk로 분리, on-demand 로딩

---

### 4.3 Tree Shaking

**Purpose**: 사용하지 않는 코드 제거

**Pattern**: Vite 자동 Tree Shaking

**Configuration**: 자동 (Vite + ES Modules)

**Best Practices**:
- Named imports 사용 (`import { Button } from './components'`)
- Default exports 최소화
- Side effects 없는 모듈

---

## 5. Security Patterns

### 5.1 JWT Token Validation

**Purpose**: API 요청 전 토큰 존재 여부 체크

**Pattern**: API Client with Token Check

**Implementation**:
```tsx
// src/services/apiClient.ts
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  // JWT 토큰 존재 체크 (프론트엔드)
  const cookies = document.cookie;
  const hasToken = cookies.includes('access_token=');

  if (!hasToken && !url.includes('/login')) {
    throw new ApiError(401, 'No authentication token found');
  }

  // API 요청
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(response.status, data.message || 'Request failed', data);
  }

  return response.json();
}
```

---

### 5.2 XSS Protection

**Purpose**: Cross-Site Scripting 공격 방어

**Pattern**: React 기본 Escaping + dangerouslySetInnerHTML 금지

**Guidelines**:
- ✅ React는 기본적으로 모든 값을 escape
- ❌ `dangerouslySetInnerHTML` 절대 사용 금지
- ❌ 사용자 입력을 직접 DOM 조작 금지 (`innerHTML`, `outerHTML`)

---

### 5.3 CSRF Protection

**Purpose**: Cross-Site Request Forgery 공격 방어

**Pattern**: SameSite Cookie + CORS

**Implementation**: Backend에서 처리
```python
# Backend (FastAPI)
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    samesite="lax",  # or "strict"
    secure=True      # HTTPS only
)
```

**Frontend**: 자동 (Cookie가 SameSite로 설정되어 자동 방어)

---

### 5.4 Sensitive Data Protection

**Purpose**: 민감한 데이터 로깅 방지

**Pattern**: Production 빌드에서 console.log 제거

**Configuration**:
```js
// vite.config.ts
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

---

## 6. Resilience Patterns

### 6.1 SSE Exponential Backoff Reconnection

**Purpose**: SSE 연결 실패 시 안정적 재연결

**Pattern**: Exponential Backoff (1s, 2s, 4s, 8s, 16s)

**Implementation**: (useSSE Hook에 이미 구현됨 - state-management.md 참조)

```tsx
// useSSE.ts
const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // 1s, 2s, 4s, 8s, 16s
reconnectTimeoutRef.current = window.setTimeout(() => {
  connect();
}, delay);
```

**Max Attempts**: 5회

---

### 6.2 API Timeout

**Purpose**: 무한 대기 방지

**Pattern**: AbortController with Timeout

**Implementation**:
```tsx
// apiClient.ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

try {
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  return await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('요청 시간 초과 (10초)');
  }
  throw error;
} finally {
  clearTimeout(timeoutId);
}
```

---

## 7. Toast Notification Pattern

**Purpose**: 사용자에게 피드백 메시지 표시

**Pattern**: Toast Manager (상단 우측)

**Implementation**:
```tsx
// src/components/Toast.tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5s

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        ×
      </button>
    </div>
  );
}

// ToastContainer.tsx
function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  // Position: 상단 우측 (top-right)
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
```

**Usage**:
```tsx
showToast('주문이 삭제되었습니다', 'success');
showToast('서버 오류가 발생했습니다', 'error');
```

---

## Pattern Summary

| Pattern | Purpose | Implementation |
|---|---|---|
| **Error Boundary** | 렌더링 에러 처리 | React ErrorBoundary (전체 화면) |
| **API Error Handling** | API 에러 처리 | Try-Catch + Toast (상단 우측) |
| **Environment Error Messages** | 환경별 에러 메시지 | Dev: 상세, Prod: 일반 |
| **Page Loading** | 페이지 전환 로딩 | Suspense Fallback |
| **Button Loading** | 액션 피드백 | 버튼 내 Spinner |
| **Memory Caching** | API 응답 캐싱 | Context State |
| **SSE Sync** | 재연결 시 동기화 | Reconnect + Fetch |
| **Selective Memoization** | 성능 최적화 | 필요 시에만 적용 |
| **Code Splitting** | 번들 최적화 | Route-based lazy loading |
| **JWT Validation** | 토큰 체크 | API 요청 전 검증 |
| **XSS Protection** | XSS 방어 | React 기본 escaping |
| **CSRF Protection** | CSRF 방어 | SameSite Cookie |
| **Console Removal** | 민감 데이터 보호 | Production console.log 제거 |
| **SSE Reconnection** | 재연결 안정성 | Exponential Backoff |
| **API Timeout** | 무한 대기 방지 | AbortController (10s) |
| **Toast Notification** | 사용자 피드백 | 상단 우측, 5초 자동 닫힘 |

---

## Next Steps

이 패턴들은 `logical-components.md`에서 논리적 컴포넌트로 구체화됩니다.
