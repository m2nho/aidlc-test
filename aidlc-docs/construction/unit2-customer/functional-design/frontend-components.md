# Frontend Components - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T15:54:00Z

---

## Overview

Customer Frontend의 모든 React 컴포넌트를 상세하게 설계합니다. 각 컴포넌트의 역할, Props/State, 사용자 상호작용, API 통합 포인트를 명시합니다.

---

## Component Hierarchy (컴포넌트 계층 구조)

```
CustomerApp (Root)
├── CustomerAppContext.Provider
│   │
│   ├── Router
│   │   │
│   │   ├── /login → LoginPage
│   │   │
│   │   ├── /menu → MenuPage
│   │   │   ├── MenuCategoryList
│   │   │   └── MenuCard (multiple)
│   │   │       └── Button
│   │   │
│   │   ├── /cart → CartPage
│   │   │   ├── CartItem (multiple)
│   │   │   │   └── Button (multiple)
│   │   │   ├── Button ("주문하기")
│   │   │   └── Modal (주문 확인)
│   │   │       └── Button (multiple)
│   │   │
│   │   └── /orders → OrderHistoryPage
│   │       ├── OrderCard (multiple)
│   │       └── EmptyState
│   │
│   ├── BottomNavigation
│   │   └── Button (multiple)
│   │
│   └── ToastContainer
│       └── LoadingSpinner (when loading)
```

---

## 1. CustomerApp (Root Component)

### 목적
Customer Frontend의 루트 컴포넌트입니다. 전역 상태 관리, 라우팅, 자동 로그인을 담당합니다.

### Props
```typescript
// Props 없음 (Root Component)
```

### State (Context)
```typescript
interface CustomerAppState {
  cart: Cart;                    // 장바구니 상태
  menus: Menu[];                 // 전체 메뉴 목록
  categories: MenuCategory[];    // 카테고리 목록
  session: {                     // 세션 정보
    isAuthenticated: boolean;
    tableNumber: number | null;
    storeId: number | null;
  };
  loading: boolean;              // 전역 로딩 상태
}
```

### 라이프사이클
```typescript
function CustomerApp() {
  const [state, setState] = useState<CustomerAppState>(initialState)
  
  useEffect(() => {
    // 1. 앱 초기화
    initializeApp()
  }, [])
  
  async function initializeApp() {
    // 2. 장바구니 복원 (LocalStorage)
    const savedCart = restoreCart()
    setState(prev => ({ ...prev, cart: savedCart }))
    
    // 3. 자동 로그인 시도
    const success = await attemptAutoLogin()
    
    if (success) {
      // 4. 메뉴 목록 로드
      await loadMenus()
    }
  }
  
  return (
    <CustomerAppContext.Provider value={{ state, actions }}>
      <Router>
        {/* Routes */}
      </Router>
      <ToastContainer />
    </CustomerAppContext.Provider>
  )
}
```

### Actions (Context Methods)
```typescript
interface CustomerAppActions {
  // 장바구니 액션
  addToCart: (menu: Menu) => void;
  updateCartQuantity: (menuId: number, quantity: number) => void;
  removeFromCart: (menuId: number) => void;
  clearCart: () => void;
  
  // 메뉴 액션
  loadMenus: () => Promise<void>;
  
  // 세션 액션
  login: (tableNumber: number, password: string) => Promise<void>;
  logout: () => void;
  
  // UI 액션
  showToast: (message: string, type: ToastType) => void;
  setLoading: (loading: boolean) => void;
}
```

---

## 2. LoginPage

### 목적
테이블 번호와 비밀번호를 입력받아 로그인하는 화면입니다 (관리자가 초기 설정용).

### Props
```typescript
interface LoginPageProps {
  // Props 없음 (Context 사용)
}
```

### State
```typescript
interface LoginPageState {
  tableNumber: string;     // 입력값 (문자열로 관리)
  password: string;
  loading: boolean;
  error: string | null;
}
```

### UI 구조
```tsx
<div className="login-page">
  <h1>테이블 로그인</h1>
  
  <form onSubmit={handleSubmit}>
    <input
      type="number"
      placeholder="테이블 번호"
      value={tableNumber}
      onChange={(e) => setTableNumber(e.target.value)}
    />
    
    <input
      type="password"
      placeholder="비밀번호"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    
    {error && <div className="error">{error}</div>}
    
    <Button
      type="submit"
      disabled={loading || !tableNumber || !password}
    >
      {loading ? '로그인 중...' : '로그인'}
    </Button>
  </form>
</div>
```

### 사용자 상호작용
1. 테이블 번호 입력 (숫자)
2. 비밀번호 입력
3. "로그인" 버튼 클릭
4. 로딩 중 표시
5. 성공 시 → `/menu`로 이동
6. 실패 시 → 에러 메시지 표시

### API 통합
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
    await actions.login(Number(tableNumber), password)
    // Context의 login 메서드가 자동으로 세션 저장 및 페이지 이동
  } catch (error) {
    setError('로그인에 실패했습니다')
  } finally {
    setLoading(false)
  }
}
```

### Validation
- 테이블 번호: 1 이상의 숫자
- 비밀번호: 4자 이상

---

## 3. MenuPage

### 목적
메뉴 목록을 카테고리별로 표시하고, 장바구니에 메뉴를 추가하는 화면입니다.

### Props
```typescript
interface MenuPageProps {
  // Props 없음 (Context 사용)
}
```

### State
```typescript
interface MenuPageState {
  selectedCategoryId: number | null;  // 선택된 카테고리 ID
  filteredMenus: Menu[];              // 필터링된 메뉴 목록
}
```

### UI 구조
```tsx
<div className="menu-page">
  <h1>메뉴</h1>
  
  <MenuCategoryList
    categories={categories}
    selectedCategoryId={selectedCategoryId}
    onSelectCategory={handleSelectCategory}
  />
  
  <div className="menu-grid">
    {filteredMenus.map(menu => (
      <MenuCard
        key={menu.id}
        menu={menu}
        onAddToCart={handleAddToCart}
      />
    ))}
  </div>
  
  {filteredMenus.length === 0 && (
    <EmptyState message="메뉴가 없습니다" />
  )}
</div>
```

### 사용자 상호작용
1. 페이지 진입 시 메뉴 로드 (useEffect)
2. 카테고리 선택 → 필터링된 메뉴 표시
3. 메뉴 카드에서 "장바구니에 추가" 클릭 → Toast 알림

### 비즈니스 로직
```typescript
function handleSelectCategory(categoryId: number | null) {
  setSelectedCategoryId(categoryId)
  
  if (categoryId === null) {
    // 전체 보기
    setFilteredMenus(menus)
  } else {
    // 카테고리 필터링
    setFilteredMenus(menus.filter(menu => menu.category_id === categoryId))
  }
}

function handleAddToCart(menu: Menu) {
  actions.addToCart(menu)
  actions.showToast(`"${menu.name}"을(를) 장바구니에 추가했습니다`, 'success')
}
```

### 초기화
```typescript
useEffect(() => {
  // 첫 번째 카테고리를 기본 선택
  if (categories.length > 0) {
    handleSelectCategory(categories[0].id)
  }
}, [categories])
```

---

## 4. MenuCategoryList

### 목적
카테고리 버튼 목록을 표시하고, 선택된 카테고리를 강조합니다.

### Props
```typescript
interface MenuCategoryListProps {
  categories: MenuCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}
```

### State
```typescript
// State 없음 (Stateless Component)
```

### UI 구조
```tsx
<div className="category-list">
  <button
    className={selectedCategoryId === null ? 'active' : ''}
    onClick={() => onSelectCategory(null)}
  >
    전체
  </button>
  
  {categories.map(category => (
    <button
      key={category.id}
      className={selectedCategoryId === category.id ? 'active' : ''}
      onClick={() => onSelectCategory(category.id)}
    >
      {category.name}
    </button>
  ))}
</div>
```

### 스타일
- 활성 카테고리: 배경색 강조, 굵은 글씨
- 비활성 카테고리: 기본 스타일
- 최소 버튼 크기: 44x44px (터치 친화적)

---

## 5. MenuCard

### 목적
개별 메뉴의 정보를 카드 형태로 표시하고, 장바구니 추가 버튼을 제공합니다.

### Props
```typescript
interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
}
```

### State
```typescript
// State 없음 (Stateless Component)
```

### UI 구조
```tsx
<div className="menu-card">
  {menu.image_url && (
    <img src={menu.image_url} alt={menu.name} />
  )}
  
  <div className="menu-info">
    <h3>{menu.name}</h3>
    {menu.description && <p>{menu.description}</p>}
    <span className="price">{formatPrice(menu.price)}</span>
  </div>
  
  {!menu.is_available && (
    <div className="sold-out-badge">품절</div>
  )}
  
  <Button
    onClick={() => onAddToCart(menu)}
    disabled={!menu.is_available}
  >
    장바구니에 추가
  </Button>
</div>
```

### 조건부 렌더링
- 이미지 없음: Placeholder 이미지 또는 이미지 영역 숨김
- 설명 없음: 설명 영역 숨김
- 품절: "품절" 배지 표시, 버튼 비활성화

---

## 6. CartPage

### 목적
장바구니 아이템 목록과 총액을 표시하고, 주문을 생성합니다.

### Props
```typescript
interface CartPageProps {
  // Props 없음 (Context 사용)
}
```

### State
```typescript
interface CartPageState {
  showConfirmModal: boolean;   // 주문 확인 모달 표시 여부
  loading: boolean;             // 주문 생성 중
}
```

### UI 구조
```tsx
<div className="cart-page">
  <h1>장바구니</h1>
  
  {cart.items.length === 0 ? (
    <EmptyState
      icon="🛒"
      message="장바구니가 비어있습니다"
      action={
        <Button onClick={() => navigate('/menu')}>
          메뉴 보러가기
        </Button>
      }
    />
  ) : (
    <>
      <div className="cart-items">
        {cart.items.map(item => (
          <CartItem
            key={item.menu.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="total">
          <span>총액</span>
          <span className="amount">{formatPrice(getCartTotal(cart))}</span>
        </div>
        
        <Button
          onClick={handleCheckout}
          disabled={loading}
          fullWidth
        >
          {loading ? '주문 중...' : '주문하기'}
        </Button>
      </div>
    </>
  )}
  
  {showConfirmModal && (
    <Modal
      title="주문 확인"
      onClose={() => setShowConfirmModal(false)}
    >
      <div className="confirm-content">
        <p>총 {cart.items.length}개 메뉴, {formatPrice(getCartTotal(cart))}을(를) 주문하시겠습니까?</p>
        
        <ul>
          {cart.items.map(item => (
            <li key={item.menu.id}>
              {item.menu.name} x {item.quantity}
            </li>
          ))}
        </ul>
        
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            취소
          </Button>
          <Button onClick={handleConfirmOrder}>
            확인
          </Button>
        </div>
      </div>
    </Modal>
  )}
</div>
```

### 사용자 상호작용
1. 수량 조절: CartItem 컴포넌트의 +/- 버튼
2. 아이템 삭제: CartItem의 삭제 버튼 (확인 모달)
3. 주문하기 클릭 → 주문 확인 모달 표시
4. 모달에서 "확인" → API 호출 → 장바구니 비우기 → 주문 내역 페이지로 이동

### API 통합
```typescript
async function handleCheckout() {
  setShowConfirmModal(true)
}

async function handleConfirmOrder() {
  setLoading(true)
  
  try {
    const orderRequest: CreateOrderRequest = {
      table_id: session.tableId,
      items: cart.items.map(item => ({
        menu_id: item.menu.id,
        quantity: item.quantity
      }))
    }
    
    const response = await api.createOrder(orderRequest)
    
    actions.clearCart()
    actions.showToast(`주문이 접수되었습니다 (주문번호: #${response.order_number})`, 'success')
    navigate('/orders')
    
  } catch (error) {
    actions.showToast('주문 생성에 실패했습니다', 'error')
  } finally {
    setLoading(false)
    setShowConfirmModal(false)
  }
}
```

---

## 7. CartItem

### 목적
장바구니의 개별 아이템을 표시하고, 수량 조절 및 삭제 기능을 제공합니다.

### Props
```typescript
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (menuId: number, quantity: number) => void;
  onRemove: (menuId: number) => void;
}
```

### State
```typescript
// State 없음 (Stateless Component)
```

### UI 구조
```tsx
<div className="cart-item">
  <div className="item-info">
    <h4>{item.menu.name}</h4>
    <span className="price">{formatPrice(item.menu.price)}</span>
  </div>
  
  <div className="quantity-controls">
    <Button
      variant="icon"
      onClick={() => handleDecrease()}
      disabled={item.quantity <= 1}
    >
      -
    </Button>
    
    <span className="quantity">{item.quantity}</span>
    
    <Button
      variant="icon"
      onClick={() => handleIncrease()}
      disabled={item.quantity >= 99}
    >
      +
    </Button>
  </div>
  
  <div className="item-total">
    {formatPrice(item.menu.price * item.quantity)}
  </div>
  
  <Button
    variant="icon"
    onClick={() => handleRemove()}
  >
    ×
  </Button>
</div>
```

### 사용자 상호작용
```typescript
function handleDecrease() {
  if (item.quantity === 1) {
    // 수량이 1일 때 감소 버튼 클릭 → 삭제 확인
    if (confirm(`"${item.menu.name}"을(를) 삭제하시겠습니까?`)) {
      onRemove(item.menu.id)
    }
  } else {
    onUpdateQuantity(item.menu.id, item.quantity - 1)
  }
}

function handleIncrease() {
  if (item.quantity < 99) {
    onUpdateQuantity(item.menu.id, item.quantity + 1)
  }
}

function handleRemove() {
  if (confirm(`"${item.menu.name}"을(를) 삭제하시겠습니까?`)) {
    onRemove(item.menu.id)
  }
}
```

---

## 8. OrderHistoryPage

### 목적
고객의 주문 내역을 조회하고 표시합니다.

### Props
```typescript
interface OrderHistoryPageProps {
  // Props 없음 (Context 사용)
}
```

### State
```typescript
interface OrderHistoryPageState {
  orders: Order[];
  loading: boolean;
}
```

### UI 구조
```tsx
<div className="order-history-page">
  <h1>주문 내역</h1>
  
  {loading ? (
    <LoadingSpinner />
  ) : orders.length === 0 ? (
    <EmptyState
      icon="📋"
      message="주문 내역이 없습니다"
      action={
        <Button onClick={() => navigate('/menu')}>
          메뉴 보러가기
        </Button>
      }
    />
  ) : (
    <div className="orders-list">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )}
</div>
```

### 라이프사이클
```typescript
useEffect(() => {
  loadOrders()
}, [])

async function loadOrders() {
  setLoading(true)
  
  try {
    const orders = await api.getOrders()
    setOrders(orders)
  } catch (error) {
    actions.showToast('주문 내역을 불러오지 못했습니다', 'error')
  } finally {
    setLoading(false)
  }
}
```

### API 통합
- **Endpoint**: `GET /api/customer/orders`
- **Response**: `Order[]` (현재 세션의 주문 목록)
- **정렬**: `created_at DESC` (최신 주문 먼저)

---

## 9. OrderCard

### 목적
개별 주문 정보를 카드 형태로 표시합니다.

### Props
```typescript
interface OrderCardProps {
  order: Order;
}
```

### State
```typescript
// State 없음 (Stateless Component)
```

### UI 구조
```tsx
<div className="order-card">
  <div className="order-header">
    <span className="order-number">주문 #{formatOrderNumber(order.order_number)}</span>
    <span className="order-time">{formatOrderTime(order.created_at)}</span>
  </div>
  
  <div className="order-status">
    <span className={`status-badge ${order.status}`}>
      {statusLabels[order.status]}
    </span>
  </div>
  
  <div className="order-items">
    {order.items.map(item => (
      <div key={item.id} className="order-item">
        <span>{item.menu?.name}</span>
        <span>x {item.quantity}</span>
      </div>
    ))}
  </div>
  
  <div className="order-total">
    <span>총액</span>
    <span className="amount">{formatPrice(getOrderTotal(order))}</span>
  </div>
</div>
```

### 상태 배지 스타일
```typescript
const statusLabels = {
  pending: '주문 접수',
  preparing: '조리 중',
  completed: '완료'
}

const statusColors = {
  pending: 'yellow',
  preparing: 'blue',
  completed: 'green'
}
```

---

## 10. Button (Common Component)

### 목적
재사용 가능한 버튼 컴포넌트입니다.

### Props
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'icon';
  disabled?: boolean;
  fullWidth?: boolean;
}
```

### UI 구조
```tsx
<button
  type={type}
  className={`button ${variant} ${fullWidth ? 'full-width' : ''}`}
  onClick={onClick}
  disabled={disabled}
>
  {children}
</button>
```

### 스타일
- **primary**: 파란색 배경, 흰색 텍스트
- **secondary**: 회색 배경, 검은색 텍스트
- **icon**: 아이콘 전용 (작은 크기)
- **최소 크기**: 44x44px (터치 친화적)

---

## 11. Modal (Common Component)

### 목적
모달 다이얼로그를 표시합니다.

### Props
```typescript
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
}
```

### UI 구조
```tsx
<div className="modal-overlay" onClick={onClose}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <div className="modal-header">
      <h2>{title}</h2>
      {showCloseButton && (
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
    
    <div className="modal-body">
      {children}
    </div>
  </div>
</div>
```

### 기능
- 오버레이 클릭 시 모달 닫기
- ESC 키 누르면 모달 닫기
- 스크롤 방지 (body overflow: hidden)

---

## 12. LoadingSpinner (Common Component)

### 목적
로딩 상태를 시각적으로 표시합니다.

### Props
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

### UI 구조
```tsx
<div className={`loading-spinner ${size}`}>
  <div className="spinner" style={{ borderColor: color }} />
</div>
```

---

## 13. EmptyState (Common Component)

### 목적
데이터가 없을 때 빈 상태 메시지를 표시합니다.

### Props
```typescript
interface EmptyStateProps {
  icon?: string;
  message: string;
  action?: React.ReactNode;
}
```

### UI 구조
```tsx
<div className="empty-state">
  {icon && <div className="icon">{icon}</div>}
  <p className="message">{message}</p>
  {action && <div className="action">{action}</div>}
</div>
```

---

## Context Provider 상세

### CustomerAppContext

```typescript
interface CustomerAppContextValue {
  // State
  cart: Cart;
  menus: Menu[];
  categories: MenuCategory[];
  session: {
    isAuthenticated: boolean;
    tableNumber: number | null;
    storeId: number | null;
  };
  loading: boolean;
  
  // Actions
  actions: {
    addToCart: (menu: Menu) => void;
    updateCartQuantity: (menuId: number, quantity: number) => void;
    removeFromCart: (menuId: number) => void;
    clearCart: () => void;
    loadMenus: () => Promise<void>;
    login: (tableNumber: number, password: string) => Promise<void>;
    logout: () => void;
    showToast: (message: string, type: ToastType) => void;
    setLoading: (loading: boolean) => void;
  };
}

const CustomerAppContext = createContext<CustomerAppContextValue | undefined>(undefined)

export function useCustomerApp() {
  const context = useContext(CustomerAppContext)
  if (!context) {
    throw new Error('useCustomerApp must be used within CustomerAppProvider')
  }
  return context
}
```

---

## API Integration Points

### 각 컴포넌트의 API 호출

| 컴포넌트 | API 엔드포인트 | 메서드 | 시점 |
|---------|--------------|--------|------|
| LoginPage | `/api/customer/login` | POST | 로그인 버튼 클릭 |
| MenuPage | `/api/menus?available=true` | GET | 페이지 마운트 |
| CartPage | `/api/orders` | POST | 주문 확인 클릭 |
| OrderHistoryPage | `/api/customer/orders` | GET | 페이지 마운트 |

---

## Component Data Flow

```
User Action (UI)
      ↓
Component Handler
      ↓
Context Action
      ↓
API Call (if needed)
      ↓
Update Context State
      ↓
Sync to LocalStorage (for cart)
      ↓
Re-render Components
      ↓
User Feedback (Toast)
```

---

이상으로 Customer Frontend의 모든 컴포넌트 상세 설계를 완료했습니다.
