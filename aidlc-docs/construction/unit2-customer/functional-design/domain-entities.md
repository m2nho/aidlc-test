# Domain Entities - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T15:50:00Z

---

## Overview

Customer Frontend에서 사용하는 도메인 엔티티를 정의합니다. 이 엔티티들은 Day 0 계약(TypeScript 타입)을 기반으로 하되, Frontend의 관점에서 필요한 추가 속성과 메서드를 정의합니다.

---

## 1. CartItem (장바구니 아이템)

### 목적
고객이 장바구니에 담은 메뉴 아이템을 표현합니다.

### 구조

```typescript
interface CartItem {
  menu: Menu;           // 메뉴 전체 객체 (Day 0 계약)
  quantity: number;     // 수량 (1-99)
}
```

### 속성

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `menu` | `Menu` | Yes | 메뉴 정보 (id, name, price, description, category_id 등) |
| `quantity` | `number` | Yes | 주문 수량 (최소 1, 최대 99) |

### 비즈니스 규칙

1. **수량 제약**:
   - 최소: 1
   - 최대: 99
   - 0 이하 또는 100 이상 불가

2. **중복 방지**:
   - 동일 메뉴(`menu.id`)는 장바구니에 1개만 존재
   - 중복 추가 시 수량만 증가

3. **메뉴 정합성**:
   - `menu.id`가 유효해야 함
   - `menu.is_available`이 true여야 함 (추가 시점 기준)

### 계산 메서드

```typescript
// 아이템 총액 계산
function getItemTotal(item: CartItem): number {
  return item.menu.price * item.quantity
}

// 수량 검증
function isValidQuantity(quantity: number): boolean {
  return quantity >= 1 && quantity <= 99
}
```

### 예시

```typescript
const cartItem: CartItem = {
  menu: {
    id: 1,
    store_id: 1,
    category_id: 1,
    name: "마르게리따 피자",
    description: "토마토, 모짜렐라, 바질",
    price: 15000,
    is_available: true,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z"
  },
  quantity: 2
}

// 아이템 총액: 15000 * 2 = 30000원
```

---

## 2. Cart (장바구니)

### 목적
고객의 장바구니 전체 상태를 표현합니다.

### 구조

```typescript
interface Cart {
  items: CartItem[];      // 장바구니 아이템 목록
  updatedAt: string;      // 마지막 업데이트 시각 (ISO 8601)
}
```

### 속성

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `items` | `CartItem[]` | Yes | 장바구니 아이템 배열 (빈 배열 가능) |
| `updatedAt` | `string` | Yes | 마지막 수정 시각 (ISO 8601) |

### 계산 메서드

```typescript
// 장바구니 총액 계산
function getCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => {
    return sum + (item.menu.price * item.quantity)
  }, 0)
}

// 장바구니 총 아이템 수 계산
function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

// 장바구니가 비어있는지 확인
function isCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0
}
```

### LocalStorage 저장 형식

```typescript
// LocalStorage 키: "customerCart"
const savedCart = {
  items: [
    {
      menu: { /* 메뉴 객체 */ },
      quantity: 2
    }
  ],
  updatedAt: "2026-04-06T15:30:00Z"
}

localStorage.setItem('customerCart', JSON.stringify(savedCart))
```

### 비즈니스 규칙

1. **아이템 중복 방지**:
   - 동일 `menu.id`를 가진 아이템은 1개만 존재

2. **빈 장바구니 처리**:
   - `items.length === 0`일 때 주문 불가
   - UI에서 "주문하기" 버튼 비활성화

3. **최대 아이템 수**:
   - MVP에서는 제한 없음 (일반적으로 10-20개 이내)

### 예시

```typescript
const cart: Cart = {
  items: [
    {
      menu: { id: 1, name: "피자", price: 15000, /* ... */ },
      quantity: 2
    },
    {
      menu: { id: 2, name: "파스타", price: 12000, /* ... */ },
      quantity: 1
    }
  ],
  updatedAt: "2026-04-06T15:30:00Z"
}

// 총액: (15000 * 2) + (12000 * 1) = 42000원
// 총 아이템 수: 2 + 1 = 3개
```

---

## 3. CustomerSession (고객 세션)

### 목적
고객의 자동 로그인 정보를 LocalStorage에 저장하는 구조입니다.

### 구조

```typescript
interface CustomerSession {
  tableNumber: number;    // 테이블 번호
  password: string;       // 테이블 비밀번호 (평문 저장 - 로컬 환경)
  lastLoginAt: string;    // 마지막 로그인 시각 (ISO 8601)
}
```

### 속성

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `tableNumber` | `number` | Yes | 테이블 번호 (1-50) |
| `password` | `string` | Yes | 테이블 비밀번호 (관리자가 설정) |
| `lastLoginAt` | `string` | Yes | 마지막 로그인 시각 (ISO 8601) |

### LocalStorage 저장 형식

```typescript
// LocalStorage 키: "customerAuth"
const session: CustomerSession = {
  tableNumber: 5,
  password: "table123",
  lastLoginAt: "2026-04-06T15:00:00Z"
}

localStorage.setItem('customerAuth', JSON.stringify(session))
```

### 비즈니스 규칙

1. **보안 고려사항**:
   - 로컬 환경에서만 사용 (공개 인터넷 노출 금지)
   - 비밀번호를 평문으로 저장 (LocalStorage)
   - 실제 프로덕션 환경에서는 재고려 필요

2. **세션 유효성**:
   - 세션 만료 시 자동 재로그인 시도
   - 재로그인 실패 시 `customerAuth` 삭제

3. **초기 설정**:
   - 관리자가 테이블 태블릿에 1회 로그인 수행
   - 이후 자동 로그인 활성화

### 예시

```typescript
const session: CustomerSession = {
  tableNumber: 5,
  password: "table123",
  lastLoginAt: "2026-04-06T15:00:00Z"
}

// 자동 로그인 시 사용
const credentials: CustomerLoginRequest = {
  table_number: session.tableNumber,
  password: session.password
}
```

---

## 4. Menu (메뉴) - Frontend 관점

### 목적
메뉴 정보를 표현합니다. (Day 0 계약 기반, 추가 UI 속성 포함)

### 구조

```typescript
interface Menu {
  // Day 0 계약
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: MenuCategory;  // 조인된 경우만

  // Frontend 추가 속성 (옵션)
  image_url?: string;       // 메뉴 이미지 URL (향후 확장)
  is_popular?: boolean;     // 인기 메뉴 여부 (향후 확장)
}
```

### UI 표시 규칙

1. **가격 포맷팅**:
   ```typescript
   function formatPrice(price: number): string {
     return price.toLocaleString('ko-KR') + '원'
   }
   // 예: 15000 → "15,000원"
   ```

2. **품절 처리**:
   - `is_available: false` → "품절" 배지 표시
   - 장바구니 추가 버튼 비활성화

3. **이미지 처리**:
   - `image_url`이 없으면 기본 이미지 표시
   - 이미지 로딩 실패 시 Placeholder 이미지

4. **설명 표시**:
   - `description`이 null이면 "설명 없음" 또는 숨김

### 예시

```typescript
const menu: Menu = {
  id: 1,
  store_id: 1,
  category_id: 1,
  name: "마르게리따 피자",
  description: "신선한 토마토, 모짜렐라 치즈, 바질",
  price: 15000,
  is_available: true,
  created_at: "2026-04-06T10:00:00Z",
  updated_at: "2026-04-06T10:00:00Z",
  category: {
    id: 1,
    store_id: 1,
    name: "메인 요리",
    display_order: 1
  }
}
```

---

## 5. Order (주문) - 고객 관점

### 목적
고객이 생성한 주문 정보를 표현합니다. (Day 0 계약 기반)

### 구조

```typescript
interface Order {
  // Day 0 계약
  id: number;
  store_id: number;
  table_id: number;
  order_number: number;
  status: OrderStatus;    // 'pending' | 'preparing' | 'completed'
  created_at: string;     // ISO 8601
  items: OrderItem[];
  table?: Table;          // 조인된 경우만 (고객 화면에서는 불필요)
}

interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  price: number;          // 주문 당시 가격 (스냅샷)
  menu?: Menu;            // 조인된 경우 (메뉴 정보 표시용)
}
```

### UI 표시 규칙

1. **주문 번호 포맷**:
   ```typescript
   function formatOrderNumber(orderNumber: number): string {
     return `#${orderNumber.toString().padStart(3, '0')}`
   }
   // 예: 5 → "#005"
   ```

2. **주문 시각 포맷**:
   ```typescript
   function formatOrderTime(createdAt: string): string {
     const date = new Date(createdAt)
     return date.toLocaleTimeString('ko-KR', { 
       hour: '2-digit', 
       minute: '2-digit' 
     })
   }
   // 예: "오후 3:24"
   ```

3. **상태 배지**:
   ```typescript
   const statusConfig = {
     pending: { label: '주문 접수', color: 'yellow' },
     preparing: { label: '조리 중', color: 'blue' },
     completed: { label: '완료', color: 'green' }
   }
   ```

4. **총액 계산**:
   ```typescript
   function getOrderTotal(order: Order): number {
     return order.items.reduce((sum, item) => {
       return sum + (item.price * item.quantity)
     }, 0)
   }
   ```

### 예시

```typescript
const order: Order = {
  id: 1,
  store_id: 1,
  table_id: 5,
  order_number: 5,
  status: 'pending',
  created_at: "2026-04-06T15:24:00Z",
  items: [
    {
      id: 1,
      order_id: 1,
      menu_id: 1,
      quantity: 2,
      price: 15000,
      menu: {
        id: 1,
        name: "마르게리따 피자",
        // ...
      }
    },
    {
      id: 2,
      order_id: 1,
      menu_id: 2,
      quantity: 1,
      price: 12000,
      menu: {
        id: 2,
        name: "까르보나라",
        // ...
      }
    }
  ]
}

// UI 표시:
// 주문 번호: "#005"
// 주문 시각: "오후 3:24"
// 상태: "주문 접수" (노란색 배지)
// 메뉴: 
//   - 마르게리따 피자 x 2
//   - 까르보나라 x 1
// 총액: 42,000원
```

---

## 6. MenuCategory (메뉴 카테고리)

### 목적
메뉴를 그룹화하기 위한 카테고리입니다. (Day 0 계약)

### 구조

```typescript
interface MenuCategory {
  id: number;
  store_id: number;
  name: string;
  display_order: number;  // 카테고리 정렬 순서
}
```

### UI 표시 규칙

1. **카테고리 정렬**:
   - `display_order` 기준 오름차순
   - 예: 1. 메인 요리, 2. 음료, 3. 디저트

2. **카테고리 선택**:
   - 활성 카테고리 강조 (배경색 변경)
   - 첫 번째 카테고리가 기본 선택

### 예시

```typescript
const categories: MenuCategory[] = [
  { id: 1, store_id: 1, name: "메인 요리", display_order: 1 },
  { id: 2, store_id: 1, name: "음료", display_order: 2 },
  { id: 3, store_id: 1, name: "디저트", display_order: 3 }
]

// 정렬 후: 메인 요리 → 음료 → 디저트
```

---

## 7. ApiError (에러 응답)

### 목적
API 호출 실패 시 받는 에러 응답입니다. (Day 0 계약)

### 구조

```typescript
interface ApiError {
  error: string;          // 에러 코드 (예: "ORDER_NOT_FOUND")
  message: string;        // 사용자 친화적 메시지
  details?: Record<string, any>;  // 추가 상세 정보
}
```

### 에러 코드 매핑

```typescript
const errorMessages: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: '테이블 번호 또는 비밀번호가 올바르지 않습니다',
  AUTH_TOKEN_EXPIRED: '세션이 만료되었습니다',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다',
  MENU_NOT_FOUND: '메뉴 정보를 불러올 수 없습니다',
  VALIDATION_ERROR: '입력값이 올바르지 않습니다',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다'
}
```

### 예시

```typescript
const error: ApiError = {
  error: "AUTH_INVALID_CREDENTIALS",
  message: "테이블 번호 또는 비밀번호가 올바르지 않습니다",
  details: {
    table_number: 5
  }
}
```

---

## 8. 엔티티 관계도

```
Cart (1) ──────────────> (*) CartItem
                              ↓
                          (1) Menu ←───── (*) Order
                              ↓                ↓
                          (1) MenuCategory (1) OrderItem
                                              ↓
                                          (1) Menu
```

**설명**:
- 1개의 Cart는 여러 CartItem을 포함
- 1개의 CartItem은 1개의 Menu를 참조
- 1개의 Order는 여러 OrderItem을 포함
- 1개의 OrderItem은 1개의 Menu를 참조 (스냅샷)
- 1개의 Menu는 1개의 MenuCategory에 속함

---

## 9. 엔티티 검증 규칙

### CartItem 검증
```typescript
function validateCartItem(item: CartItem): boolean {
  return (
    item.menu != null &&
    item.menu.id > 0 &&
    item.quantity >= 1 &&
    item.quantity <= 99 &&
    item.menu.price > 0 &&
    item.menu.is_available === true
  )
}
```

### Cart 검증
```typescript
function validateCart(cart: Cart): boolean {
  return (
    Array.isArray(cart.items) &&
    cart.items.every(validateCartItem) &&
    new Date(cart.updatedAt).toString() !== 'Invalid Date'
  )
}
```

### CustomerSession 검증
```typescript
function validateSession(session: CustomerSession): boolean {
  return (
    session.tableNumber >= 1 &&
    session.tableNumber <= 50 &&
    session.password.length >= 4 &&
    new Date(session.lastLoginAt).toString() !== 'Invalid Date'
  )
}
```

---

이상으로 Customer Frontend의 도메인 엔티티 정의를 완료했습니다.
