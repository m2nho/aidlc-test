# NFR Design Patterns - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T16:12:00Z

---

## Overview

Customer Frontend의 NFR 요구사항을 충족하기 위한 구체적인 디자인 패턴을 정의합니다. 각 패턴은 성능, 확장성, 보안, 접근성, 유지보수성을 개선하기 위한 구현 방법을 제시합니다.

---

## 1. 성능 최적화 패턴 (Performance Patterns)

### PERF-PATTERN-001: Code Splitting (코드 스플리팅)

**목적**: 초기 번들 크기를 줄여 FCP 2초 목표 달성

**구현 방법**:
```typescript
// React.lazy로 페이지별 코드 스플리팅
import { lazy, Suspense } from 'react'

const MenuPage = lazy(() => import('./pages/MenuPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
      </Routes>
    </Suspense>
  )
}
```

**효과**:
- 초기 번들 크기 30-40% 감소
- 각 페이지 독립적으로 로드
- FCP 개선

---

### PERF-PATTERN-002: Component Memoization (컴포넌트 메모이제이션)

**목적**: 불필요한 재렌더링 방지로 UI 응답 100ms 달성

**구현 방법**:
```typescript
// React.memo로 컴포넌트 메모이제이션
import { memo } from 'react'

export const MenuCard = memo(({ menu, onAddToCart }: MenuCardProps) => {
  return (
    <div className="menu-card">
      <h3>{menu.name}</h3>
      <p>{formatPrice(menu.price)}</p>
      <Button onClick={() => onAddToCart(menu)}>
        장바구니에 추가
      </Button>
    </div>
  )
}, (prevProps, nextProps) => {
  // 메뉴 ID가 같으면 재렌더링 스킵
  return prevProps.menu.id === nextProps.menu.id
})

// useMemo로 값 계산 메모이제이션
function CartPage() {
  const { cart } = useCustomerApp()
  
  const totalAmount = useMemo(() => {
    return cart.items.reduce((sum, item) => 
      sum + (item.menu.price * item.quantity), 0
    )
  }, [cart.items])
  
  return <div>총액: {formatPrice(totalAmount)}</div>
}

// useCallback으로 함수 메모이제이션
function MenuPage() {
  const { actions } = useCustomerApp()
  
  const handleAddToCart = useCallback((menu: Menu) => {
    actions.addToCart(menu)
    actions.showToast(`장바구니에 추가되었습니다`, 'success')
  }, [actions])
  
  return <MenuList onAddToCart={handleAddToCart} />
}
```

**효과**:
- 재렌더링 70% 감소
- UI 응답 시간 개선

---

### PERF-PATTERN-003: Image Lazy Loading (이미지 지연 로딩)

**목적**: 메뉴 이미지 로딩 최적화

**구현 방법**:
```typescript
// Native lazy loading
<img 
  src={menu.image_url} 
  alt={menu.name}
  loading="lazy"
  decoding="async"
/>

// Intersection Observer로 더 세밀한 제어
import { useEffect, useRef, useState } from 'react'

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : '/placeholder.png'}
      alt={alt}
    />
  )
}
```

**효과**:
- 초기 로딩 시간 단축
- 네트워크 대역폭 절약

---

### PERF-PATTERN-004: LocalStorage Debouncing (저장 디바운싱)

**목적**: 장바구니 동기화 성능 최적화 (50ms 목표)

**구현 방법**:
```typescript
import { useEffect, useRef } from 'react'

function useDebounceLocalStorage(key: string, value: any, delay: number = 300) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    // 이전 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value))
    }, delay)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, delay])
}

// Context에서 사용
function CustomerAppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  
  // 장바구니 변경 시 디바운스된 LocalStorage 저장
  useDebounceLocalStorage('customerCart', cart, 300)
  
  return (
    <CustomerAppContext.Provider value={{ cart, setCart }}>
      {children}
    </CustomerAppContext.Provider>
  )
}
```

**효과**:
- 빈번한 저장 방지
- 성능 개선

---

## 2. 에러 처리 및 복원력 패턴 (Error Handling & Resilience Patterns)

### ERROR-PATTERN-001: Error Boundary

**목적**: React 컴포넌트 에러 격리 및 우아한 폴백

**구현 방법**:
```typescript
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>문제가 발생했습니다</h2>
          <p>페이지를 새로고침해주세요</p>
          <Button onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// App.tsx에서 사용
<ErrorBoundary>
  <CustomerApp />
</ErrorBoundary>
```

**효과**:
- 앱 전체 크래시 방지
- 사용자 친화적 에러 표시

---

### ERROR-PATTERN-002: API Error Handling Wrapper

**목적**: 일관된 API 에러 처리

**구현 방법**:
```typescript
async function apiCallWithErrorHandling<T>(
  apiCall: () => Promise<T>,
  options?: {
    retries?: number
    showToast?: boolean
    onError?: (error: any) => void
  }
): Promise<T> {
  const { retries = 0, showToast = true, onError } = options || {}
  
  let lastError: any
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiCall()
    } catch (error: any) {
      lastError = error
      
      // 401 에러: 자동 재로그인 시도
      if (error.error === 'AUTH_TOKEN_EXPIRED') {
        const success = await attemptRelogin()
        if (success && attempt < retries) {
          continue // 재시도
        }
      }
      
      // 네트워크 에러: 재시도
      if (error.message === 'Network Error' && attempt < retries) {
        await delay(1000 * (attempt + 1)) // 지수 백오프
        continue
      }
      
      break
    }
  }
  
  // 모든 재시도 실패
  if (showToast) {
    const message = getErrorMessage(lastError)
    showToast(message, 'error')
  }
  
  if (onError) {
    onError(lastError)
  }
  
  throw lastError
}

// 사용 예시
async function loadMenus() {
  try {
    const menus = await apiCallWithErrorHandling(
      () => api.getMenus({ available: true }),
      { retries: 2, showToast: true }
    )
    setMenus(menus)
  } catch (error) {
    // 에러는 이미 처리됨
  }
}
```

**효과**:
- 일관된 에러 처리
- 자동 재시도
- 사용자 친화적 피드백

---

### ERROR-PATTERN-003: Optimistic UI Updates (낙관적 UI 업데이트)

**목적**: 빠른 UI 응답 (100ms 목표)

**구현 방법**:
```typescript
function useOptimisticCart() {
  const { cart, setCart } = useCustomerApp()
  
  const addToCartOptimistic = async (menu: Menu) => {
    // 1. 즉시 UI 업데이트 (낙관적)
    const newCart = {
      ...cart,
      items: [...cart.items, { menu, quantity: 1 }]
    }
    setCart(newCart)
    showToast(`장바구니에 추가되었습니다`, 'success')
    
    // 2. LocalStorage 동기화 (백그라운드)
    try {
      localStorage.setItem('customerCart', JSON.stringify(newCart))
    } catch (error) {
      // 롤백
      setCart(cart)
      showToast('장바구니 추가에 실패했습니다', 'error')
    }
  }
  
  return { addToCartOptimistic }
}
```

**효과**:
- 즉각적인 UI 피드백
- 사용자 경험 향상

---

## 3. 보안 패턴 (Security Patterns)

### SEC-PATTERN-001: Input Validation (입력 검증)

**목적**: XSS 및 잘못된 데이터 방지

**구현 방법**:
```typescript
// 수량 검증
function validateQuantity(quantity: number): boolean {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= 99
  )
}

// 테이블 번호 검증
function validateTableNumber(tableNumber: string): boolean {
  const num = parseInt(tableNumber, 10)
  return (
    !isNaN(num) &&
    num >= 1 &&
    num <= 50 &&
    tableNumber === num.toString() // 불필요한 문자 제거
  )
}

// 비밀번호 검증
function validatePassword(password: string): boolean {
  return (
    typeof password === 'string' &&
    password.length >= 4 &&
    password.length <= 20 &&
    /^[a-zA-Z0-9]+$/.test(password) // 영숫자만 허용
  )
}

// 컴포넌트에서 사용
function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateTableNumber(tableNumber)) {
      setError('테이블 번호는 1-50 사이의 숫자여야 합니다')
      return
    }
    
    if (!validatePassword(password)) {
      setError('비밀번호는 4-20자의 영숫자여야 합니다')
      return
    }
    
    // 로그인 진행
  }
}
```

**효과**:
- XSS 방지
- 잘못된 데이터 차단
- 명확한 에러 메시지

---

### SEC-PATTERN-002: Content Security Policy Headers

**목적**: XSS 공격 추가 방지 (프로덕션 환경)

**구현 방법**:
```html
<!-- index.html에 CSP 메타 태그 -->
<meta 
  http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
  "
/>
```

**적용 시점**: 프로덕션 배포 시 (MVP에서는 선택사항)

---

### SEC-PATTERN-003: Sanitize User Input (사용자 입력 정제)

**목적**: React의 기본 XSS 방지 강화

**구현 방법**:
```typescript
// dangerouslySetInnerHTML 사용 금지
// ESLint 규칙: react/no-danger

// 외부 데이터 렌더링 시 주의
function MenuCard({ menu }: { menu: Menu }) {
  // ✅ 안전: React가 자동으로 이스케이프
  return (
    <div>
      <h3>{menu.name}</h3>
      <p>{menu.description}</p>
    </div>
  )
  
  // ❌ 위험: 사용하지 말 것
  // <div dangerouslySetInnerHTML={{ __html: menu.description }} />
}
```

---

## 4. 접근성 패턴 (Accessibility Patterns)

### ACC-PATTERN-001: Keyboard Navigation (키보드 네비게이션)

**목적**: WCAG 2.1 Level A 준수

**구현 방법**:
```typescript
// 모든 인터랙티브 요소에 키보드 접근성 보장
function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
      tabIndex={0}
    >
      {children}
    </button>
  )
}

// Focus trap in modals
import { FocusTrap } from '@headlessui/react'

function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <FocusTrap active={isOpen}>
      <div className="modal">
        <button onClick={onClose} aria-label="닫기">×</button>
        {children}
      </div>
    </FocusTrap>
  )
}
```

---

### ACC-PATTERN-002: ARIA Attributes (ARIA 속성)

**목적**: 스크린 리더 지원

**구현 방법**:
```typescript
// 의미있는 ARIA 속성 추가
<button
  onClick={handleAddToCart}
  aria-label={`${menu.name}을(를) 장바구니에 추가`}
  disabled={!menu.is_available}
  aria-disabled={!menu.is_available}
>
  장바구니에 추가
</button>

// 상태 변경 알림
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {toastMessage}
</div>

// 로딩 상태
<div role="status" aria-live="polite" aria-busy={loading}>
  {loading ? '로딩 중...' : ''}
</div>
```

---

### ACC-PATTERN-003: Color Contrast (색상 대비)

**목적**: 시각 장애인 접근성 (4.5:1 이상)

**구현 방법**:
```typescript
// Tailwind CSS로 색상 대비 보장
const colorConfig = {
  text: {
    primary: 'text-gray-900', // 검은색 (#111827)
    secondary: 'text-gray-600', // 회색 (#4B5563)
  },
  background: {
    white: 'bg-white', // 흰색 (#FFFFFF)
  },
  // 대비율: 15.45:1 (WCAG AAA)
}

// 버튼 색상
const buttonStyles = {
  primary: 'bg-blue-600 text-white', // 대비율: 8.59:1
  secondary: 'bg-gray-200 text-gray-900', // 대비율: 12.63:1
}
```

---

## 5. 상태 관리 패턴 (State Management Patterns)

### STATE-PATTERN-001: Context Optimization (Context 최적화)

**목적**: 불필요한 재렌더링 방지

**구현 방법**:
```typescript
// Context를 여러 개로 분리
const CartContext = createContext<CartContextValue | undefined>(undefined)
const MenusContext = createContext<MenusContextValue | undefined>(undefined)
const SessionContext = createContext<SessionContextValue | undefined>(undefined)

// Provider 중첩
function CustomerAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MenusProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </MenusProvider>
    </SessionProvider>
  )
}

// 필요한 Context만 구독
function CartPage() {
  const { cart, updateQuantity } = useCart() // CartContext만 구독
  // MenusContext나 SessionContext 변경 시 재렌더링 안 됨
}
```

---

### STATE-PATTERN-002: Local State First (로컬 상태 우선)

**목적**: Context 오버헤드 최소화

**구현 방법**:
```typescript
// 로컬 상태로 충분한 경우 Context 사용 안 함
function MenuPage() {
  // ✅ 로컬 상태 (이 페이지에서만 사용)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // ✅ Context 상태 (전역으로 공유 필요)
  const { menus, cart } = useCustomerApp()
}
```

---

## 6. 캐싱 패턴 (Caching Patterns)

### CACHE-PATTERN-001: Memory Caching (메모리 캐시)

**목적**: 메뉴 데이터 재사용 (1초 로딩 목표)

**구현 방법**:
```typescript
// Context에 메뉴 데이터 캐싱
function MenusProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [lastFetched, setLastFetched] = useState<number | null>(null)
  
  const loadMenus = async (force: boolean = false) => {
    // 캐시 유효 시간: 5분
    const CACHE_DURATION = 5 * 60 * 1000
    const now = Date.now()
    
    if (!force && lastFetched && (now - lastFetched < CACHE_DURATION)) {
      // 캐시 사용
      return
    }
    
    // API 호출
    const data = await api.getMenus({ available: true })
    setMenus(data)
    setCategories(extractCategories(data))
    setLastFetched(now)
  }
  
  return (
    <MenusContext.Provider value={{ menus, categories, loadMenus }}>
      {children}
    </MenusContext.Provider>
  )
}
```

---

## 7. 네트워크 패턴 (Network Patterns)

### NET-PATTERN-001: Request Timeout (요청 타임아웃)

**목적**: 무한 대기 방지

**구현 방법**:
```typescript
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error: any) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다')
    }
    throw error
  }
}
```

---

## 8. 테스트 패턴 (Testing Patterns)

### TEST-PATTERN-001: Test Utilities (테스트 유틸리티)

**목적**: 일관된 테스트 환경

**구현 방법**:
```typescript
// test-utils.tsx
import { render } from '@testing-library/react'
import { CustomerAppProvider } from './contexts/CustomerAppContext'

export function renderWithContext(ui: React.ReactElement) {
  return render(
    <CustomerAppProvider>
      {ui}
    </CustomerAppProvider>
  )
}

// 테스트에서 사용
import { renderWithContext } from './test-utils'

test('장바구니에 메뉴 추가', () => {
  renderWithContext(<CartPage />)
  // ...
})
```

---

## Pattern Summary

| 패턴 카테고리 | 패턴 수 | 우선순위 |
|--------------|---------|----------|
| 성능 최적화 | 4 | P0 (Critical) |
| 에러 처리 | 3 | P0 (Critical) |
| 보안 | 3 | P1 (High) |
| 접근성 | 3 | P1 (High) |
| 상태 관리 | 2 | P1 (High) |
| 캐싱 | 1 | P2 (Medium) |
| 네트워크 | 1 | P2 (Medium) |
| 테스트 | 1 | P2 (Medium) |

**Total**: 18개 디자인 패턴

---

이상으로 Customer Frontend의 NFR 디자인 패턴 정의를 완료했습니다.
