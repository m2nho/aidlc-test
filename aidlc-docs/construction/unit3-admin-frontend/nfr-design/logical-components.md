# Unit 3: Admin Frontend - Logical Components

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Design  
**Date**: 2026-04-06

---

## Purpose

NFR Design Patterns에서 정의한 비기능적 설계 패턴을 구현하기 위해 필요한 논리적 컴포넌트를 정의합니다.

---

## Overview

이 문서는 Admin Frontend의 NFR 요구사항을 충족하기 위해 필요한 논리적(infrastructure) 컴포넌트를 정의합니다. 각 컴포넌트는 nfr-design-patterns.md에서 정의한 패턴을 구현합니다.

**NFR Patterns → Logical Components Mapping**:
- Error Handling Patterns → ErrorBoundary, Toast System, ApiError utilities
- Loading Patterns → LoadingSpinner, Button with loading state, Suspense
- Caching & Data Management → Context State Manager, SSE Manager
- Performance Optimization → Code Splitting utilities, Selective Memoization
- Security Patterns → API Client with JWT, PrivateRoute wrapper
- Reliability Patterns → SSE Reconnection Manager, API Timeout utilities

---

## 1. Error Management Components

### 1.1. ErrorBoundary Component

**Purpose**: Catch React rendering errors and display full-screen error fallback UI

**Component Type**: Class Component (React Error Boundary)

**Location**: `src/common/ErrorBoundary.tsx`

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
}
```

**State**:
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

**Methods**:
- `static getDerivedStateFromError(error: Error): State`
- `componentDidCatch(error: Error, errorInfo: ErrorInfo): void`
- `handleReset(): void`

**Responsibilities**:
- Catch unhandled errors in component tree
- Display full-screen error UI with error message (dev mode only)
- Provide "Reload" button to reset error state
- Log errors to console in development mode
- Show generic error message in production mode

**Usage**:
```tsx
<ErrorBoundary>
  <AdminApp />
</ErrorBoundary>
```

**NFR Requirements**:
- Reliability: Prevent entire app crash from component errors
- Usability: Provide user-friendly error recovery mechanism
- Security: Hide sensitive error details in production (환경별 에러 메시지)

---

### 1.2. Toast Notification System

**Purpose**: Display non-blocking toast messages for API errors and notifications

**Components**:
- `ToastContainer` (parent container)
- `Toast` (individual toast item)
- `useToast` Hook (state management)

#### 1.2.1. ToastContainer Component

**Location**: `src/common/ToastContainer.tsx`

**Props**: None (uses internal context)

**Responsibilities**:
- Render toast messages in top-right corner
- Auto-remove toasts after 5 seconds
- Support multiple toasts (stack vertically)
- Provide close button for manual dismissal

**CSS Position**: `fixed top-4 right-4 z-50`

---

#### 1.2.2. Toast Component

**Location**: `src/common/Toast.tsx`

**Props**:
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // default: 5000ms
  onClose: () => void;
}
```

**Responsibilities**:
- Display single toast with icon and message
- Auto-close after duration expires
- Animate slide-in from right
- Color-coded by type (error: red, success: green, etc.)

**UI Elements**:
- Icon (based on type)
- Message text
- Close button (X)

---

#### 1.2.3. useToast Hook

**Location**: `src/hooks/useToast.ts`

**State**:
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

const [toasts, setToasts] = useState<Toast[]>([]);
```

**Methods**:
```typescript
function showToast(type: Toast['type'], message: string, duration?: number): void;
function removeToast(id: string): void;
```

**Responsibilities**:
- Manage toast state (add, remove)
- Generate unique toast IDs
- Auto-remove toasts after duration

**Usage**:
```typescript
const { showToast } = useToast();
showToast('error', 'Failed to update order status');
```

**NFR Requirements**:
- Usability: Non-blocking error display (상단 우측)
- Performance: Minimal re-renders with optimized state management

---

### 1.3. ApiError Utilities

**Purpose**: Standardized API error handling and error object creation

**Location**: `src/services/apiError.ts`

**Classes**:
```typescript
class ApiError extends Error {
  statusCode: number;
  endpoint: string;
  method: string;
  
  constructor(message: string, statusCode: number, endpoint: string, method: string);
}
```

**Utilities**:
```typescript
function handleApiError(error: unknown, endpoint: string, method: string): ApiError;
function isApiError(error: unknown): error is ApiError;
function getErrorMessage(error: unknown): string;
function getProductionErrorMessage(error: ApiError): string;
```

**Responsibilities**:
- Create structured error objects from API failures
- Determine error messages based on status code and environment
- Handle network errors vs API errors
- Provide type-safe error checking

**NFR Requirements**:
- Reliability: Consistent error handling across all API calls
- Security: Environment-specific error messages (dev vs prod)
- Maintainability: Centralized error logic

---

## 2. Loading & Performance Components

### 2.1. LoadingSpinner Component

**Purpose**: Reusable loading indicator with multiple variants

**Location**: `src/common/LoadingSpinner.tsx`

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  fullScreen?: boolean; // default: false
  message?: string;
}
```

**Variants**:
- **Inline Spinner**: Small spinner for buttons or inline sections
- **Full Screen Overlay**: Full-screen overlay with centered spinner (used in Suspense Fallback)

**Responsibilities**:
- Render animated spinner (CSS animation)
- Support multiple sizes (sm: 16px, md: 24px, lg: 48px)
- Full-screen overlay with semi-transparent background (optional)
- Optional loading message

**Usage**:
```tsx
// Button loading
<Button loading={isLoading}>Save</Button>

// Full-screen loading (Suspense Fallback)
<Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
  <LazyComponent />
</Suspense>
```

**NFR Requirements**:
- Performance: Lightweight CSS animation (no images)
- Usability: Clear visual feedback during loading states

---

### 2.2. Button Component with Loading State

**Purpose**: Reusable button with built-in loading spinner

**Location**: `src/common/Button.tsx`

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: ReactNode;
}
```

**Responsibilities**:
- Render button with Tailwind CSS styles
- Show inline spinner when `loading=true`
- Disable button during loading state
- Support multiple visual variants

**UI Behavior**:
- When loading: Show spinner, disable button, maintain button size
- When not loading: Show children text

**Usage**:
```tsx
<Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
  Submit
</Button>
```

**NFR Requirements**:
- Performance: Inline loading indicator without layout shift
- Usability: Prevent double-submission with disabled state

---

### 2.3. Code Splitting Utilities

**Purpose**: Lazy load route components to reduce initial bundle size

**Location**: `src/App.tsx` (routing setup)

**Implementation**:
```tsx
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TableManagementPage = lazy(() => import('./pages/TableManagementPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner fullScreen />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    {/* ... */}
  </Routes>
</Suspense>
```

**Responsibilities**:
- Split code by route
- Show loading fallback during chunk loading
- Handle chunk loading failures (ErrorBoundary catches)

**NFR Requirements**:
- Performance: Initial bundle <200KB gzipped
- Performance: Route transition <3s loading time

---

## 3. State Management Components

### 3.1. AdminAppProvider (Context Provider)

**Purpose**: Provide global state and actions to all components

**Location**: `src/contexts/AdminAppContext.tsx`

**Provider Props**:
```typescript
interface AdminAppProviderProps {
  children: ReactNode;
}
```

**Context Value**:
```typescript
interface AdminAppContextValue {
  state: AdminAppState;
  dispatch: React.Dispatch<AdminAppAction>;
  // Convenience methods
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  // ... other action creators
}
```

**Responsibilities**:
- Initialize state with default values
- Provide reducer dispatch to all consumers
- Provide action creator methods for common operations
- Restore auth state from sessionStorage on mount

**Usage**:
```tsx
// App.tsx
<AdminAppProvider>
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
</AdminAppProvider>

// Component
const { state, updateOrderStatus } = useContext(AdminAppContext);
```

**NFR Requirements**:
- Scalability: Single Context sufficient for 1-5 concurrent users
- Maintainability: Centralized state management
- Reliability: State persistence (auth only)

---

### 3.2. useAdminApp Hook

**Purpose**: Type-safe hook to access AdminAppContext

**Location**: `src/contexts/AdminAppContext.tsx`

**Implementation**:
```typescript
function useAdminApp(): AdminAppContextValue {
  const context = useContext(AdminAppContext);
  if (!context) {
    throw new Error('useAdminApp must be used within AdminAppProvider');
  }
  return context;
}
```

**Responsibilities**:
- Ensure context is available
- Provide type-safe context access
- Throw error if used outside provider

**Usage**:
```typescript
const { state, login, logout } = useAdminApp();
```

---

## 4. API & Network Components

### 4.1. API Client Utilities

**Purpose**: Centralized HTTP request handling with JWT validation and timeout

**Location**: `src/services/apiClient.ts`

**Main Function**:
```typescript
async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<T>;
```

**Responsibilities**:
- Check JWT token presence before request (from sessionStorage)
- Set default headers (Content-Type, Authorization if token exists)
- Implement 10-second timeout with AbortController
- Handle response parsing (JSON)
- Throw ApiError on failure
- Redirect to /login if 401 Unauthorized

**Timeout Implementation**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

try {
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  // ...
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    throw new ApiError('Request timeout', 408, endpoint, method);
  }
  // ...
}
```

**Usage**:
```typescript
import { apiRequest } from './apiClient';

const orders = await apiRequest<Order[]>('/api/orders', { method: 'GET' });
```

**NFR Requirements**:
- Performance: API response timeout <2s (enforced at 10s with error)
- Security: JWT token validation before request
- Reliability: Timeout prevents hanging requests

---

### 4.2. Mock API Service (Optional)

**Purpose**: Mock API for development and testing without backend

**Location**: `src/services/mockApi.ts`

**Environment Variable**: `VITE_USE_MOCK_API=true`

**Responsibilities**:
- Provide same interface as real API client
- Return mock data with realistic delays (200-500ms)
- Support all API endpoints (/api/login, /api/orders, etc.)

**Usage**:
```typescript
// src/services/apiClient.ts
import { mockApiRequest } from './mockApi';
import { realApiRequest } from './realApi';

export const apiRequest = import.meta.env.VITE_USE_MOCK_API === 'true'
  ? mockApiRequest
  : realApiRequest;
```

**NFR Requirements**:
- Maintainability: Enable frontend development without backend dependency
- Testing: Support unit testing with predictable mock data

---

## 5. SSE Management Components

### 5.1. useSSE Hook (SSE Connection Manager)

**Purpose**: Manage SSE connection with Exponential Backoff reconnection

**Location**: `src/hooks/useSSE.ts`

**Parameters**:
```typescript
interface UseSSEOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  maxReconnectAttempts?: number; // default: 5
}

function useSSE(options: UseSSEOptions): {
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
};
```

**State**:
```typescript
const [isConnected, setIsConnected] = useState(false);
const [error, setError] = useState<string | null>(null);
const reconnectAttemptsRef = useRef(0);
const reconnectTimeoutRef = useRef<number | null>(null);
const eventSourceRef = useRef<EventSource | null>(null);
```

**Reconnection Logic (Exponential Backoff)**:
```typescript
const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // 1s, 2s, 4s, 8s, 16s
reconnectTimeoutRef.current = window.setTimeout(() => {
  connect();
}, delay);
```

**Responsibilities**:
- Establish SSE connection to backend
- Handle SSE events (order.created, order.updated, order.deleted)
- Reconnect on connection loss with Exponential Backoff
- Stop reconnection after max attempts (5)
- Cleanup EventSource on unmount
- **Full Data Sync on Reconnect**: Call GET /api/orders to sync missed events

**Full Sync Implementation**:
```typescript
eventSource.addEventListener('open', () => {
  setIsConnected(true);
  reconnectAttemptsRef.current = 0; // Reset counter
  
  // Full data sync on reconnect
  if (wasPreviouslyConnected) {
    syncAllOrders(); // Calls GET /api/orders and updates Context
  }
  wasPreviouslyConnected = true;
});
```

**Usage**:
```tsx
// AdminApp.tsx
const { state, dispatch } = useAdminApp();

useSSE({
  url: '/api/orders/events',
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    if (event.type === 'order.created') {
      dispatch({ type: 'ORDER_ADD', payload: data.order });
    }
    // ...
  },
  maxReconnectAttempts: 5,
});
```

**NFR Requirements**:
- Reliability: Exponential Backoff prevents server overload during reconnection
- Reliability: Full data sync ensures no missed events during disconnection
- Performance: SSE latency <2s for real-time updates

---

## 6. Routing & Security Components

### 6.1. PrivateRoute Component

**Purpose**: Protect routes that require authentication

**Location**: `src/common/PrivateRoute.tsx`

**Props**:
```typescript
interface PrivateRouteProps {
  children: ReactNode;
}
```

**Logic**:
```typescript
function PrivateRoute({ children }: PrivateRouteProps) {
  const { state } = useAdminApp();
  const isAuthenticated = state.auth.isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Usage**:
```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/dashboard" element={
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  } />
  {/* ... */}
</Routes>
```

**Responsibilities**:
- Check authentication state from Context
- Redirect to /login if not authenticated
- Render protected route if authenticated

**NFR Requirements**:
- Security: Prevent unauthorized access to admin pages
- Usability: Automatic redirect to login page

---

### 6.2. Router Configuration

**Purpose**: Define all application routes with lazy loading and protection

**Location**: `src/App.tsx`

**Routes**:
```tsx
<BrowserRouter>
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
      <Route path="/tables" element={
        <PrivateRoute><TableManagementPage /></PrivateRoute>
      } />
      <Route path="/menus" element={
        <PrivateRoute><MenuManagementPage /></PrivateRoute>
      } />
      
      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
</BrowserRouter>
```

**Responsibilities**:
- Define all application routes
- Apply PrivateRoute wrapper to protected routes
- Provide Suspense fallback for lazy-loaded components
- Redirect root and unknown routes to /dashboard

**NFR Requirements**:
- Security: Route-level authentication enforcement
- Performance: Code splitting via lazy loading

---

## 7. Form Utilities

### 7.1. useFormValidation Hook

**Purpose**: Reusable form validation with debounced onChange and onBlur support

**Location**: `src/hooks/useFormValidation.ts`

**Parameters**:
```typescript
interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void>;
}

function useFormValidation<T>(options: UseFormValidationOptions<T>): {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
};
```

**Validation Timing**:
- **onChange**: Debounced 300ms (only for touched fields)
- **onBlur**: Immediate validation
- **onSubmit**: Full validation before submission

**Debounce Implementation**:
```typescript
const debouncedValidation = useCallback(
  debounce((field: keyof T, value: any) => {
    const error = validationRules[field](value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, 300),
  [validationRules]
);
```

**Responsibilities**:
- Manage form values, errors, touched state
- Execute validation rules with debouncing
- Prevent submission if validation fails
- Provide reset functionality
- Display inline errors for touched fields

**Usage**:
```tsx
const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
} = useFormValidation({
  initialValues: { username: '', password: '' },
  validationRules: {
    username: validateUsername,
    password: validatePassword,
  },
  onSubmit: async (values) => {
    await login(values.username, values.password);
  },
});

<form onSubmit={handleSubmit}>
  <input
    value={values.username}
    onChange={(e) => handleChange('username', e.target.value)}
    onBlur={() => handleBlur('username')}
  />
  {touched.username && errors.username && (
    <span className="error">{errors.username}</span>
  )}
  {/* ... */}
</form>
```

**NFR Requirements**:
- Usability: Real-time validation feedback (debounced to avoid excessive re-renders)
- Performance: Debouncing reduces validation calls
- Maintainability: Reusable validation logic

---

### 7.2. Validation Rule Functions

**Purpose**: Individual validation functions for each field type

**Location**: `src/utils/validation.ts`

**Functions**:
```typescript
function validateUsername(value: string): string | null;
function validatePassword(value: string): string | null;
function validateMenuName(value: string): string | null;
function validateMenuPrice(value: number): string | null;
function validateCategoryId(value: string): string | null;
function validateTableNumber(value: string): string | null;
```

**Responsibilities**:
- Check required fields
- Validate length constraints
- Validate format (e.g., price range 0-1,000,000)
- Return error message or null

**Example**:
```typescript
function validateUsername(value: string): string | null {
  if (!value || value.trim() === '') {
    return '사용자명을 입력하세요';
  }
  if (value.length < 3) {
    return '사용자명은 최소 3자 이상이어야 합니다';
  }
  if (value.length > 50) {
    return '사용자명은 최대 50자까지 가능합니다';
  }
  return null;
}
```

**NFR Requirements**:
- Maintainability: Centralized validation logic
- Testability: Pure functions, easy to unit test

---

## 8. Environment Configuration

### 8.1. Environment Variables

**Purpose**: Configure application behavior based on environment

**Location**: `.env` (development), `.env.production` (production)

**Variables**:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false

# Build Configuration
VITE_NODE_ENV=development
```

**Usage**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
```

**Responsibilities**:
- Configure API endpoint (real vs mock)
- Control build behavior (dev vs prod)
- Enable/disable logging, debugging features

**NFR Requirements**:
- Security: Prevent hardcoded credentials or sensitive data
- Maintainability: Easy environment-specific configuration

---

### 8.2. Vite Configuration for Console.log Removal

**Purpose**: Remove console.log statements in production builds

**Location**: `vite.config.ts`

**Configuration**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
});
```

**Responsibilities**:
- Remove all console.log, console.warn, console.error in production build
- Keep console statements in development for debugging
- Reduce bundle size

**NFR Requirements**:
- Security: Prevent sensitive data leakage via console.log in production
- Performance: Reduce bundle size by removing debug code

---

## Component Dependency Graph

```
AdminApp (Root)
├── ErrorBoundary
│   └── [catches all errors]
├── AdminAppProvider
│   ├── useAdminApp Hook (consumed by all components)
│   └── useSSE Hook (connects to Context state)
├── ToastContainer
│   ├── Toast (multiple instances)
│   └── useToast Hook
├── Router
│   ├── PrivateRoute (wraps protected routes)
│   ├── Suspense (wraps lazy routes)
│   │   └── LoadingSpinner (fullScreen)
│   └── Routes
│       ├── LoginPage
│       ├── DashboardPage
│       ├── TableManagementPage
│       └── MenuManagementPage
└── [All pages and features]
    ├── useAdminApp (for state)
    ├── useToast (for notifications)
    ├── useFormValidation (for forms)
    ├── apiClient (for HTTP requests)
    ├── Button (with loading state)
    └── LoadingSpinner (inline)
```

---

## Logical Component Summary

| Component | Type | Purpose | NFR Category |
|---|---|---|---|
| ErrorBoundary | Class Component | Catch rendering errors | Reliability |
| ToastContainer | Function Component | Display notifications | Usability |
| Toast | Function Component | Individual toast item | Usability |
| useToast | Hook | Manage toast state | Usability |
| ApiError | Class | Structured error object | Reliability |
| handleApiError | Utility | Error handling logic | Reliability |
| LoadingSpinner | Function Component | Loading indicator | Performance, Usability |
| Button | Function Component | Button with loading state | Performance, Usability |
| AdminAppProvider | Context Provider | Global state management | Scalability, Maintainability |
| useAdminApp | Hook | Context access | Maintainability |
| apiRequest | Utility | HTTP client with timeout | Performance, Security |
| useSSE | Hook | SSE connection manager | Reliability, Performance |
| PrivateRoute | Function Component | Route protection | Security |
| Router Configuration | Configuration | Route setup | Security, Performance |
| useFormValidation | Hook | Form validation | Usability, Performance |
| Validation Rules | Utilities | Field validators | Maintainability |
| Environment Variables | Configuration | Environment setup | Security, Maintainability |
| Vite Config | Configuration | Build optimization | Security, Performance |

**Total**: 18 logical components

---

## NFR Requirements Coverage

| NFR Requirement | Logical Components |
|---|---|
| **Scalability** (1-5 users) | AdminAppProvider (Single Context) |
| **Performance** (<3s load) | Code Splitting, LoadingSpinner, Suspense |
| **Performance** (<2s API) | apiRequest with 10s timeout, AbortController |
| **Performance** (<2s SSE) | useSSE Hook with real-time updates |
| **Security** (XSS) | React default escaping (no special component) |
| **Security** (CSRF) | SameSite Cookie (backend config, no frontend component) |
| **Security** (JWT) | apiRequest validates token before request |
| **Security** (Console.log) | Vite config removes console.log in production |
| **Reliability** (Error Handling) | ErrorBoundary, ApiError, handleApiError, Toast |
| **Reliability** (SSE Reconnect) | useSSE Hook with Exponential Backoff |
| **Usability** (Loading) | LoadingSpinner, Button with loading state |
| **Usability** (Error Display) | Toast (top-right), inline error messages |
| **Usability** (Validation) | useFormValidation Hook, Validation Rules |
| **Maintainability** (Code Quality) | TypeScript Strict, ESLint, Prettier |
| **Maintainability** (Testing) | Testable utilities (pure functions) |

---

## Implementation Notes

1. **Directory Structure**:
   ```
   src/
   ├── common/
   │   ├── ErrorBoundary.tsx
   │   ├── ToastContainer.tsx
   │   ├── Toast.tsx
   │   ├── LoadingSpinner.tsx
   │   ├── Button.tsx
   │   ├── Modal.tsx
   │   ├── PrivateRoute.tsx
   │   └── EmptyState.tsx
   ├── contexts/
   │   └── AdminAppContext.tsx
   ├── hooks/
   │   ├── useSSE.ts
   │   ├── useAuth.ts
   │   ├── useApi.ts
   │   ├── useToast.ts
   │   └── useFormValidation.ts
   ├── services/
   │   ├── apiClient.ts
   │   ├── apiError.ts
   │   └── mockApi.ts
   ├── utils/
   │   └── validation.ts
   ├── pages/
   ├── features/
   └── App.tsx
   ```

2. **Initialization Order**:
   ```tsx
   // index.tsx
   root.render(
     <AdminAppProvider>            {/* 1. Global state */}
       <ErrorBoundary>             {/* 2. Error handling */}
         <ToastContainer />        {/* 3. Notifications */}
         <BrowserRouter>           {/* 4. Routing */}
           <Suspense fallback={<LoadingSpinner fullScreen />}>
             <AdminApp />          {/* 5. App component */}
           </Suspense>
         </BrowserRouter>
       </ErrorBoundary>
     </AdminAppProvider>
   );
   ```

3. **Component Testing**:
   - Each logical component should have unit tests
   - Test utilities (validation rules, error handlers) with pure function tests
   - Test Hooks with React Testing Library's `renderHook`
   - Test Components with React Testing Library
   - Mock apiClient and useSSE in tests

4. **Performance Monitoring**:
   - Monitor bundle size after build (target: <200KB gzipped)
   - Measure initial load time (target: <3s)
   - Measure API response time (target: <2s)
   - Measure SSE latency (target: <2s)

---

## Completion Checklist

- [x] ErrorBoundary and error management components defined
- [x] Toast notification system components defined
- [x] Loading and performance components defined
- [x] State management components defined
- [x] API and network components defined
- [x] SSE management components defined
- [x] Routing and security components defined
- [x] Form utilities defined
- [x] Environment configuration defined
- [x] Component dependency graph created
- [x] NFR requirements coverage documented
- [x] Implementation notes provided

---

## References

- **NFR Design Patterns**: `nfr-design-patterns.md`
- **Functional Design**: `../functional-design/frontend-components.md`
- **NFR Requirements**: `../nfr-requirements/nfr-requirements.md`
- **Tech Stack Decisions**: `../nfr-requirements/tech-stack-decisions.md`

---
