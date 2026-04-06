# Logical Components - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T16:14:00Z

---

## Overview

Customer Frontend의 논리적 컴포넌트 구조를 정의합니다. 프론트엔드 애플리케이션이므로 인프라스트럭처 컴포넌트(서버, 큐, 캐시 등)는 해당하지 않으며, 대신 아키텍처 레이어와 모듈 구조를 정의합니다.

---

## Architecture Layers (아키텍처 레이어)

Customer Frontend는 **Layered Architecture** 패턴을 사용합니다:

```
┌─────────────────────────────────────────────┐
│     Presentation Layer (UI Components)      │
│  - Pages, Features, Common Components       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Business Logic Layer (State & Logic)      │
│  - Context API, Hooks, Business Rules       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    Data Access Layer (API & Storage)        │
│  - API Client, LocalStorage, Mock API       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       Utility Layer (Helpers & Utils)       │
│  - Formatters, Validators, Constants        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Infrastructure Layer (Routing & Error)    │
│  - React Router, Error Boundary, Logging    │
└─────────────────────────────────────────────┘
```

---

## 1. Presentation Layer (프레젠테이션 레이어)

### 목적
사용자 인터페이스를 담당하며, 비즈니스 로직은 포함하지 않습니다.

### 구성 요소

#### 1.1 Pages (페이지 컴포넌트)
- **LoginPage**: 로그인 폼
- **MenuPage**: 메뉴 목록 및 카테고리 필터
- **CartPage**: 장바구니 및 주문 확인
- **OrderHistoryPage**: 주문 내역

**책임**:
- UI 렌더링
- 사용자 이벤트 핸들링 (Business Logic Layer로 위임)
- Context에서 상태 구독

**의존성**:
- Business Logic Layer (Context Hooks)

#### 1.2 Features (기능별 컴포넌트)
- **MenuCategoryList**: 카테고리 버튼 목록
- **MenuCard**: 메뉴 카드
- **CartItem**: 장바구니 아이템
- **OrderCard**: 주문 카드

**책임**:
- 특정 기능 UI 렌더링
- Props로 데이터 및 핸들러 받기

**의존성**:
- Common Components

#### 1.3 Common (공통 컴포넌트)
- **Button**: 재사용 가능한 버튼
- **Modal**: 모달 다이얼로그
- **LoadingSpinner**: 로딩 인디케이터
- **EmptyState**: 빈 상태 표시

**책임**:
- 재사용 가능한 UI 컴포넌트 제공
- Props로 커스터마이징 가능

**의존성**: 없음 (독립적)

---

## 2. Business Logic Layer (비즈니스 로직 레이어)

### 목적
애플리케이션의 상태 관리 및 비즈니스 로직을 담당합니다.

### 구성 요소

#### 2.1 Context Providers (상태 관리)

**CustomerAppContext**
```typescript
// 전역 상태 관리
interface CustomerAppState {
  cart: Cart
  menus: Menu[]
  categories: MenuCategory[]
  session: SessionInfo
  loading: boolean
}

interface CustomerAppActions {
  // 장바구니 액션
  addToCart: (menu: Menu) => void
  updateCartQuantity: (menuId: number, quantity: number) => void
  removeFromCart: (menuId: number) => void
  clearCart: () => void
  
  // 메뉴 액션
  loadMenus: () => Promise<void>
  
  // 세션 액션
  login: (tableNumber: number, password: string) => Promise<void>
  logout: () => void
  
  // UI 액션
  showToast: (message: string, type: ToastType) => void
  setLoading: (loading: boolean) => void
}
```

**책임**:
- 전역 상태 관리
- 비즈니스 로직 실행
- Data Access Layer 호출

**의존성**:
- Data Access Layer (API Client, LocalStorage)
- Utility Layer (검증, 포맷팅)

#### 2.2 Custom Hooks (커스텀 훅)

**useCustomerApp**
```typescript
// CustomerAppContext 구독
function useCustomerApp() {
  const context = useContext(CustomerAppContext)
  if (!context) {
    throw new Error('useCustomerApp must be used within CustomerAppProvider')
  }
  return context
}
```

**useAutoLogin**
```typescript
// 자동 로그인 로직
function useAutoLogin() {
  const { actions } = useCustomerApp()
  
  useEffect(() => {
    const savedAuth = localStorage.getItem('customerAuth')
    if (savedAuth) {
      const session = JSON.parse(savedAuth)
      actions.login(session.tableNumber, session.password)
    }
  }, [])
}
```

**useCart**
```typescript
// 장바구니 관련 로직
function useCart() {
  const { cart, actions } = useCustomerApp()
  
  const totalAmount = useMemo(() => {
    return cart.items.reduce((sum, item) => 
      sum + (item.menu.price * item.quantity), 0
    )
  }, [cart.items])
  
  return {
    cart,
    totalAmount,
    addToCart: actions.addToCart,
    updateQuantity: actions.updateCartQuantity,
    removeItem: actions.removeFromCart,
    clearCart: actions.clearCart
  }
}
```

**책임**:
- Context 데이터 가공 및 제공
- 파생 상태 계산 (메모이제이션)
- 비즈니스 로직 캡슐화

**의존성**:
- Business Logic Layer (Context)

#### 2.3 Business Rules (비즈니스 규칙)

**validators.ts**
```typescript
// 입력 검증 규칙
export function validateQuantity(quantity: number): ValidationResult
export function validateTableNumber(tableNumber: string): ValidationResult
export function validatePassword(password: string): ValidationResult
export function validateCart(cart: Cart): ValidationResult
```

**책임**:
- 비즈니스 규칙 검증
- 일관된 검증 로직 제공

**의존성**:
- Utility Layer (상수)

---

## 3. Data Access Layer (데이터 액세스 레이어)

### 목적
외부 데이터 소스(API, LocalStorage)와의 통신을 담당합니다.

### 구성 요소

#### 3.1 API Client (API 클라이언트)

**api.ts**
```typescript
// API Client Interface
interface ApiClient {
  // Auth
  loginCustomer: (credentials: CustomerLoginRequest) => Promise<CustomerLoginResponse>
  logout: () => Promise<LogoutResponse>
  
  // Menus
  getMenus: (params?: GetMenusParams) => Promise<Menu[]>
  
  // Orders
  getOrders: (params?: GetOrdersParams) => Promise<Order[]>
  createOrder: (order: CreateOrderRequest) => Promise<CreateOrderResponse>
  
  // Tables
  getTableSession: () => Promise<GetTableSessionResponse>
}

// Mock vs Real API 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'
export const api: ApiClient = USE_MOCK ? mockApi : realApi
```

**책임**:
- HTTP 요청 실행
- 요청/응답 직렬화
- 에러 처리 (기본)

**의존성**:
- Utility Layer (에러 매핑)

#### 3.2 Mock API (Mock API)

**mockApi.ts**
```typescript
// Mock API 구현 (Backend 없이 독립 개발)
export const mockApi: ApiClient = {
  loginCustomer: async (credentials) => {
    await delay(500)
    return mockData.loginResponse
  },
  getMenus: async (params) => {
    await delay(500)
    return mockData.menus.filter(/* ... */)
  },
  // ...
}
```

**mockData.ts**
```typescript
// Mock 시드 데이터
export const mockData = {
  stores: [/* ... */],
  menus: [/* ... */],
  categories: [/* ... */],
  orders: [/* ... */]
}
```

**책임**:
- 실제 API와 동일한 인터페이스 제공
- 네트워크 지연 시뮬레이션
- 독립 개발 지원

**의존성**: 없음

#### 3.3 LocalStorage Manager (LocalStorage 관리자)

**localStorage.ts**
```typescript
// LocalStorage 유틸리티
export const localStorageManager = {
  // 장바구니
  getCart: (): Cart => {
    const saved = localStorage.getItem('customerCart')
    return saved ? JSON.parse(saved) : { items: [], updatedAt: new Date().toISOString() }
  },
  
  setCart: (cart: Cart): void => {
    localStorage.setItem('customerCart', JSON.stringify(cart))
  },
  
  clearCart: (): void => {
    localStorage.removeItem('customerCart')
  },
  
  // 세션
  getSession: (): CustomerSession | null => {
    const saved = localStorage.getItem('customerAuth')
    return saved ? JSON.parse(saved) : null
  },
  
  setSession: (session: CustomerSession): void => {
    localStorage.setItem('customerAuth', JSON.stringify(session))
  },
  
  clearSession: (): void => {
    localStorage.removeItem('customerAuth')
  }
}
```

**책임**:
- LocalStorage 읽기/쓰기
- 데이터 직렬화/역직렬화
- 에러 처리

**의존성**: 없음

---

## 4. Utility Layer (유틸리티 레이어)

### 목적
재사용 가능한 유틸리티 함수를 제공합니다.

### 구성 요소

#### 4.1 Formatters (포맷터)

**formatters.ts**
```typescript
// 가격 포맷팅
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

// 주문 번호 포맷팅
export function formatOrderNumber(orderNumber: number): string {
  return `#${orderNumber.toString().padStart(3, '0')}`
}

// 날짜 포맷팅
export function formatOrderTime(createdAt: string): string {
  const date = new Date(createdAt)
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
```

**책임**:
- 데이터 포맷팅
- 일관된 표시 형식 제공

**의존성**: 없음

#### 4.2 Validators (검증자)

**validators.ts**
```typescript
// 수량 검증
export function validateQuantity(quantity: number): ValidationResult

// 장바구니 검증
export function validateCart(cart: Cart): ValidationResult

// 세션 검증
export function validateSession(session: CustomerSession): ValidationResult
```

**책임**:
- 입력 검증
- 비즈니스 규칙 검증

**의존성**:
- constants.ts (상수)

#### 4.3 Constants (상수)

**constants.ts**
```typescript
// 수량 제약
export const QUANTITY_MIN = 1
export const QUANTITY_MAX = 99

// 테이블 제약
export const TABLE_NUMBER_MIN = 1
export const TABLE_NUMBER_MAX = 50

// 에러 메시지
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: '테이블 번호 또는 비밀번호가 올바르지 않습니다',
  // ...
}

// 상태 레이블
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '주문 접수',
  preparing: '조리 중',
  completed: '완료'
}
```

**책임**:
- 전역 상수 정의
- 매직 넘버 방지

**의존성**: 없음

---

## 5. Infrastructure Layer (인프라스트럭처 레이어)

### 목적
애플리케이션의 인프라스트럭처 관심사를 담당합니다.

### 구성 요소

#### 5.1 Router (라우터)

**App.tsx**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <CustomerAppProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          </Routes>
        </CustomerAppProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
```

**ProtectedRoute.tsx**
```typescript
// 인증 보호 라우트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useCustomerApp()
  
  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
```

**책임**:
- 페이지 라우팅
- 인증 보호
- 네비게이션 관리

**의존성**:
- Business Logic Layer (Context)

#### 5.2 Error Boundary (에러 경계)

**ErrorBoundary.tsx**
```typescript
// React 에러 캐치 및 폴백 UI
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

**책임**:
- React 컴포넌트 에러 캐치
- 폴백 UI 표시
- 에러 로깅

**의존성**: 없음

#### 5.3 Logger (로거)

**logger.ts**
```typescript
// 로깅 유틸리티
export const logger = {
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
    // 향후 Sentry 연동
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`)
  },
  
  info: (message: string) => {
    console.log(`[INFO] ${message}`)
  }
}
```

**책임**:
- 일관된 로깅 인터페이스
- 향후 외부 로깅 서비스 통합 준비

**의존성**: 없음

---

## Component Dependency Graph (컴포넌트 의존성 그래프)

```
Presentation Layer
    ↓ (사용)
Business Logic Layer
    ↓ (사용)
Data Access Layer
    ↓ (사용)
Utility Layer

Infrastructure Layer → 모든 레이어 감싸기
```

**의존성 규칙**:
- 상위 레이어는 하위 레이어에만 의존
- 하위 레이어는 상위 레이어를 알지 못함
- 각 레이어는 인터페이스를 통해 통신

---

## Directory Structure (디렉토리 구조)

```
frontend/customer/src/
├── App.tsx                          # [Infrastructure] Root component
├── main.tsx                         # [Infrastructure] Entry point
│
├── pages/                           # [Presentation] Page components
│   ├── LoginPage.tsx
│   ├── MenuPage.tsx
│   ├── CartPage.tsx
│   └── OrderHistoryPage.tsx
│
├── features/                        # [Presentation] Feature components
│   ├── menu/
│   │   ├── MenuCategoryList.tsx
│   │   └── MenuCard.tsx
│   ├── cart/
│   │   └── CartItem.tsx
│   └── orders/
│       └── OrderCard.tsx
│
├── common/                          # [Presentation] Common components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
│
├── contexts/                        # [Business Logic] State management
│   ├── CustomerAppContext.tsx
│   └── index.ts
│
├── hooks/                           # [Business Logic] Custom hooks
│   ├── useCustomerApp.ts
│   ├── useAutoLogin.ts
│   ├── useCart.ts
│   └── index.ts
│
├── services/                        # [Data Access] API & Storage
│   ├── api.ts                       # API client selector
│   ├── realApi.ts                   # Real API implementation
│   ├── mockApi.ts                   # Mock API implementation
│   ├── mockData.ts                  # Mock seed data
│   ├── localStorage.ts              # LocalStorage manager
│   └── index.ts
│
├── utils/                           # [Utility] Helpers & utils
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── index.ts
│
├── infrastructure/                  # [Infrastructure] Router, Error, etc.
│   ├── ErrorBoundary.tsx
│   ├── ProtectedRoute.tsx
│   ├── logger.ts
│   └── index.ts
│
├── types/                           # [All Layers] TypeScript types
│   └── index.ts                     # Day 0 contract types
│
└── styles/                          # [Presentation] Global styles
    └── index.css                    # Tailwind CSS
```

---

## Component Interaction Example (컴포넌트 상호작용 예시)

### 예시: 장바구니에 메뉴 추가

```
[User Action]
    ↓
MenuCard (Presentation)
    ↓ onClick handler
useCustomerApp().actions.addToCart() (Business Logic)
    ↓
CustomerAppContext.addToCart() (Business Logic)
    ↓
validateQuantity() (Utility)
    ↓
Context state update (Business Logic)
    ↓
localStorageManager.setCart() (Data Access)
    ↓
Toast notification (Presentation)
    ↓
Re-render components subscribed to Context
```

---

## Scalability Considerations (확장성 고려사항)

### 현재 구조의 확장 포인트

**상태 관리 복잡도 증가 시**:
- Context를 더 세분화 (CartContext, MenusContext 분리)
- 또는 Zustand로 전환

**API 복잡도 증가 시**:
- React Query 추가 (캐싱, 자동 재시도)
- API 클라이언트에 인터셉터 추가

**컴포넌트 수 증가 시**:
- 컴포넌트 더 세분화
- Lazy loading 추가

**비즈니스 로직 복잡도 증가 시**:
- 비즈니스 로직을 별도 서비스 클래스로 분리
- 도메인 모델 도입

---

## Summary

| 레이어 | 컴포넌트 수 | 책임 | 의존성 |
|--------|------------|------|--------|
| **Presentation** | 13 | UI 렌더링 | Business Logic |
| **Business Logic** | 4 | 상태 관리, 비즈니스 로직 | Data Access, Utility |
| **Data Access** | 3 | API, LocalStorage | Utility |
| **Utility** | 3 | 포맷팅, 검증, 상수 | 없음 |
| **Infrastructure** | 3 | 라우팅, 에러, 로깅 | 모든 레이어 |

**Total**: 26개 논리적 컴포넌트

---

이상으로 Customer Frontend의 논리적 컴포넌트 구조 정의를 완료했습니다.
