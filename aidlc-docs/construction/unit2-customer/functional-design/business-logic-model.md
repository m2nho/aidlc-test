# Business Logic Model - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T15:48:00Z

---

## Overview

Customer Frontend의 핵심 비즈니스 로직을 모델링합니다. 이 모델은 기술 스택에 독립적이며, 순수한 비즈니스 로직에 집중합니다.

---

## 1. 자동 로그인 메커니즘

### 목적
관리자가 테이블 태블릿을 1회 초기 설정하면, 이후 고객은 로그인 절차 없이 자동으로 해당 테이블로 인증됩니다.

### 비즈니스 플로우

```
[앱 시작]
    ↓
[LocalStorage에서 테이블 정보 확인]
    ↓
정보 있음? ──No──> [로그인 화면 표시 (관리자 초기 설정)]
    ↓ Yes                ↓
[저장된 정보로 자동 로그인 시도]   [테이블 번호 + 비밀번호 입력]
    ↓                              ↓
로그인 성공? ──No──> [에러 Toast + 로그인 화면]
    ↓ Yes                         ↓
[세션 토큰 저장 (Cookie)]     [로그인 성공 → 정보 저장]
    ↓                              ↓
[메뉴 페이지로 이동] <────────────┘
```

### 핵심 로직

**LocalStorage 데이터 구조**:
```typescript
{
  tableNumber: number,
  password: string,
  lastLoginAt: string (ISO 8601)
}
```

**자동 로그인 알고리즘**:
1. 앱 시작 시 LocalStorage에서 `customerAuth` 키 확인
2. 데이터가 있으면 `POST /api/customer/login` 호출
3. 성공 시 세션 토큰을 HTTP-only Cookie에 저장 (자동)
4. 실패 시 LocalStorage 데이터 삭제 후 로그인 화면 표시

**세션 만료 처리**:
- API 호출 시 401 에러 발생 → 자동으로 재로그인 시도
- 재로그인 실패 시 → Toast 알림 + 로그인 화면으로 리다이렉트

---

## 2. 메뉴 조회 및 필터링 로직

### 목적
고객이 메뉴를 카테고리별로 빠르게 탐색할 수 있도록 합니다.

### 비즈니스 플로우

```
[메뉴 페이지 진입]
    ↓
[API: GET /api/menus?available=true]
    ↓
[모든 카테고리 + 메뉴 로드 (1회)]
    ↓
[카테고리 목록 표시]
    ↓
[고객이 카테고리 선택] ──────> [클라이언트 사이드 필터링]
    ↓                              ↓
[선택된 카테고리의 메뉴만 표시] <──┘
    ↓
[메뉴 카드 렌더링]
```

### 핵심 로직

**메뉴 로딩 알고리즘**:
1. 페이지 마운트 시 모든 메뉴를 한 번에 로드 (`available=true`)
2. Context에 저장: `{ menus: Menu[], categories: MenuCategory[] }`
3. 카테고리 선택 시 클라이언트에서 필터링:
   ```typescript
   filteredMenus = menus.filter(menu => menu.category_id === selectedCategoryId)
   ```

**품절 메뉴 처리**:
- 품절 메뉴(`is_available: false`)는 API에서 제외 (쿼리: `available=true`)
- 실시간으로 품절되는 경우는 MVP에서 고려하지 않음 (페이지 새로고침 필요)

**성능 최적화**:
- 메뉴 수가 적으므로(50-100개) 클라이언트 필터링이 더 빠름
- NFR 목표: 1초 이내 로딩 (네트워크 지연 포함)

---

## 3. 장바구니 관리 로직

### 목적
고객이 여러 메뉴를 장바구니에 담고, 수량을 조절하며, 총액을 확인할 수 있습니다.

### 비즈니스 플로우

```
[메뉴 카드에서 "장바구니에 추가" 클릭]
    ↓
[장바구니에 해당 메뉴 추가/수량 증가]
    ↓
[Context 상태 업데이트]
    ↓
[LocalStorage 동기화]
    ↓
[Toast 알림: "장바구니에 추가됨"]

---

[장바구니 페이지 진입]
    ↓
[장바구니 아이템 목록 표시]
    ↓
[고객이 수량 조절 (+/-)]
    ↓
수량 = 0? ──Yes──> [아이템 삭제 확인 모달]
    ↓ No                  ↓
[수량 업데이트]      [확인 → 아이템 삭제]
    ↓                      ↓
[Context + LocalStorage 업데이트] <──┘
    ↓
[총액 재계산]
```

### 핵심 로직

**장바구니 데이터 구조**:
```typescript
{
  items: [
    {
      menu: Menu, // 전체 메뉴 객체
      quantity: number
    }
  ],
  updatedAt: string (ISO 8601)
}
```

**메뉴 추가 알고리즘**:
```typescript
function addToCart(menu: Menu) {
  const existingItem = cart.items.find(item => item.menu.id === menu.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.items.push({ menu, quantity: 1 })
  }
  
  saveToLocalStorage(cart)
  showToast("장바구니에 추가되었습니다")
}
```

**수량 조절 알고리즘**:
```typescript
function updateQuantity(menuId: number, newQuantity: number) {
  if (newQuantity === 0) {
    showConfirmModal("삭제하시겠습니까?", () => {
      cart.items = cart.items.filter(item => item.menu.id !== menuId)
      saveToLocalStorage(cart)
    })
  } else if (newQuantity > 0 && newQuantity <= 99) {
    const item = cart.items.find(item => item.menu.id === menuId)
    item.quantity = newQuantity
    saveToLocalStorage(cart)
  }
}
```

**총액 계산 알고리즘**:
```typescript
function calculateTotal(): number {
  return cart.items.reduce((sum, item) => {
    return sum + (item.menu.price * item.quantity)
  }, 0)
}
```

**LocalStorage 동기화**:
- Context가 변경될 때마다 LocalStorage에 저장
- 앱 시작 시 LocalStorage에서 복원
- 키: `customerCart`

---

## 4. 주문 생성 플로우

### 목적
고객이 장바구니의 메뉴를 확정하여 주문을 생성합니다.

### 비즈니스 플로우

```
[장바구니 페이지에서 "주문하기" 버튼 클릭]
    ↓
장바구니 비어있음? ──Yes──> [버튼 비활성화 + 도움말]
    ↓ No
[주문 확인 모달 표시]
    ↓
    [총액 표시]
    [메뉴 목록 표시]
    [확인 / 취소 버튼]
    ↓
고객이 "확인" 클릭? ──No──> [모달 닫기]
    ↓ Yes
[API: POST /api/orders]
    {
      table_id: number,
      items: [
        { menu_id: number, quantity: number }
      ]
    }
    ↓
API 성공? ──No──> [에러 Toast + 재시도 옵션]
    ↓ Yes
[성공 Toast: "주문이 접수되었습니다 (주문번호: #X)"]
    ↓
[장바구니 비우기]
    ↓
[주문 내역 페이지로 리다이렉트]
```

### 핵심 로직

**주문 생성 요청 변환**:
```typescript
function prepareOrderRequest(cart: Cart, tableId: number): CreateOrderRequest {
  return {
    table_id: tableId,
    items: cart.items.map(item => ({
      menu_id: item.menu.id,
      quantity: item.quantity
    }))
  }
}
```

**주문 검증 규칙**:
1. 장바구니가 비어있지 않아야 함
2. 모든 메뉴가 유효해야 함 (메뉴 ID 존재)
3. 수량이 1 이상이어야 함
4. 테이블 세션이 활성화되어 있어야 함 (로그인 상태)

**주문 성공 후 처리**:
1. 장바구니 Context 초기화: `cart.items = []`
2. LocalStorage 장바구니 삭제: `localStorage.removeItem('customerCart')`
3. 성공 Toast 표시 (3초 자동 사라짐)
4. 주문 내역 페이지로 리다이렉트 (`/orders`)

---

## 5. 주문 내역 조회 로직

### 목적
고객이 현재 세션에서 생성한 주문 내역을 조회합니다.

### 비즈니스 플로우

```
[주문 내역 페이지 진입]
    ↓
[API: GET /api/customer/orders]
    ↓
[현재 세션의 주문 목록 표시]
    ↓
    [주문 번호]
    [주문 시각]
    [주문 상태 (pending/preparing/completed)]
    [메뉴 목록 + 수량]
    [총액]
    ↓
주문 없음? ──Yes──> [EmptyState 표시: "주문 내역이 없습니다"]
    ↓ No
[주문 카드 목록 렌더링]
```

### 핵심 로직

**주문 내역 표시**:
- 최신 주문이 위에 표시 (created_at DESC)
- 각 주문 카드:
  - 주문 번호 (`#001`)
  - 주문 시각 (예: "오후 3:24")
  - 주문 상태 배지 (pending: 노란색, preparing: 파란색, completed: 초록색)
  - 메뉴 목록 (메뉴명 x 수량)
  - 총액 (원화 포맷: "15,000원")

**실시간 업데이트**:
- MVP에서는 수동 새로고침만 지원
- 페이지 진입 시마다 API 호출
- 폴링이나 SSE는 구현하지 않음 (Admin만 SSE 사용)

**상태 표시 매핑**:
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

## 6. 에러 처리 및 사용자 피드백

### 목적
API 호출 실패 시 사용자에게 명확한 피드백을 제공합니다.

### 에러 처리 전략

**Toast 알림 사용**:
- 위치: 화면 하단 중앙
- 지속 시간: 3초 (에러는 5초)
- 유형: 성공(초록), 에러(빨강), 정보(파랑)

**에러 메시지 매핑**:
```typescript
const errorMessages: Record<ErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: '테이블 번호 또는 비밀번호가 올바르지 않습니다',
  AUTH_TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인합니다...',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다',
  MENU_NOT_FOUND: '메뉴 정보를 불러올 수 없습니다',
  VALIDATION_ERROR: '입력값이 올바르지 않습니다',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
}
```

**API 호출 에러 처리 흐름**:
```
[API 호출]
    ↓
에러 발생? ──No──> [정상 처리]
    ↓ Yes
[에러 타입 확인]
    ↓
401 (Unauthorized)? ──Yes──> [자동 재로그인 시도]
    ↓ No                          ↓
[에러 메시지 매핑]            성공? ──No──> [로그인 페이지]
    ↓                              ↓ Yes
[Toast 알림 표시]            [원래 API 재호출]
    ↓
[로그 기록 (console.error)]
```

---

## 7. 세션 관리 로직

### 목적
고객의 테이블 세션을 투명하게 관리하고, 만료 시 자동 복구합니다.

### 세션 라이프사이클

```
[자동 로그인]
    ↓
[세션 토큰 저장 (HTTP-only Cookie, 16시간 유효)]
    ↓
[정상 사용]
    ↓
세션 만료? ──No──> [계속 사용]
    ↓ Yes
[API 401 에러 발생]
    ↓
[자동 재로그인 시도]
    ↓
재로그인 성공? ──Yes──> [원래 작업 계속]
    ↓ No
[Toast: "다시 로그인해주세요"]
    ↓
[로그인 페이지로 리다이렉트]
```

### 핵심 로직

**세션 유효성 확인**:
- 모든 API 호출 시 자동으로 세션 토큰 포함 (Cookie)
- 401 에러 발생 시 세션 만료로 간주

**자동 재로그인 알고리즘**:
```typescript
async function handleUnauthorized() {
  const savedAuth = localStorage.getItem('customerAuth')
  
  if (savedAuth) {
    try {
      const credentials = JSON.parse(savedAuth)
      await api.loginCustomer(credentials)
      // 재로그인 성공 - 원래 요청 재시도
      return true
    } catch (error) {
      // 재로그인 실패 - LocalStorage 삭제
      localStorage.removeItem('customerAuth')
      showToast('다시 로그인해주세요', 'error')
      redirectToLogin()
      return false
    }
  } else {
    redirectToLogin()
    return false
  }
}
```

---

## 8. 페이지 라우팅 구조

### 라우팅 맵

```
/                 → 루트 (자동 로그인 체크)
                      ↓
                  로그인 상태?
                      ↓
                  Yes → /menu
                  No → /login

/login            → 로그인 화면 (관리자 초기 설정)
/menu             → 메뉴 페이지 (기본 랜딩)
/cart             → 장바구니 페이지
/orders           → 주문 내역 페이지
```

### 네비게이션 규칙

**보호된 라우트**:
- `/menu`, `/cart`, `/orders`는 로그인 필요
- 미로그인 시 `/login`으로 리다이렉트

**네비게이션 바**:
- 위치: 화면 하단 (탭 바)
- 탭: 메뉴 / 장바구니 / 주문
- 장바구니 탭에 아이템 수 배지 표시

**뒤로가기 동작**:
- 브라우저 뒤로가기 지원 (React Router)
- `/cart`에서 뒤로가기 → `/menu`
- `/orders`에서 뒤로가기 → `/menu`

---

## 9. 비즈니스 규칙 요약

### 장바구니 규칙
1. 최소 수량: 1
2. 최대 수량: 99
3. 동일 메뉴 중복 불가 (수량만 증가)
4. 품절 메뉴 추가 불가

### 주문 규칙
1. 빈 장바구니 주문 불가
2. 주문 확인 모달 필수 (실수 방지)
3. 주문 성공 후 장바구니 자동 비우기
4. 주문 취소 불가 (관리자만 가능)

### 세션 규칙
1. 세션 유효 기간: 16시간 (JWT)
2. 세션 만료 시 자동 재로그인 시도
3. 재로그인 실패 시 로그인 페이지로 이동

### UI/UX 규칙
1. 최소 버튼 크기: 44x44px (터치 친화적)
2. 로딩 시간 목표: 1초 이내 (메뉴)
3. Toast 알림 지속 시간: 3초 (성공), 5초 (에러)
4. 에러 메시지는 사용자 친화적인 한국어

---

## 10. 데이터 플로우 요약

```
[LocalStorage] ←─────────────┐
     ↓                        │
[자동 로그인]                 │
     ↓                        │
[Backend API] ─────→ [Context State] ←→ [Components]
     ↓                        ↓
[Session Token (Cookie)]  [LocalStorage 동기화]
     ↓
[모든 API 요청에 자동 포함]
```

**상태 관리 레이어**:
1. **LocalStorage**: 장바구니 영속성, 로그인 정보
2. **React Context**: 런타임 상태 (장바구니, 메뉴, 세션 정보)
3. **Cookie**: 세션 토큰 (HTTP-only, Backend 관리)

---

이상으로 Customer Frontend의 핵심 비즈니스 로직 모델링을 완료했습니다.
