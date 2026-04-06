# Business Rules - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T15:52:00Z

---

## Overview

Customer Frontend의 비즈니스 규칙을 정의합니다. 이 규칙들은 사용자 입력 검증, 상태 전이 규칙, 에러 처리 등을 포함합니다.

---

## 1. 장바구니 검증 규칙

### BR-CART-001: 수량 범위 검증

**규칙**: 장바구니 아이템의 수량은 1 이상 99 이하여야 합니다.

**검증 시점**: 
- 장바구니에 메뉴 추가 시
- 수량 증가/감소 버튼 클릭 시
- 수량 직접 입력 시

**검증 로직**:
```typescript
function validateQuantity(quantity: number): ValidationResult {
  if (quantity < 1) {
    return {
      valid: false,
      message: '수량은 최소 1개 이상이어야 합니다'
    }
  }
  
  if (quantity > 99) {
    return {
      valid: false,
      message: '수량은 최대 99개까지 가능합니다'
    }
  }
  
  return { valid: true }
}
```

**위반 시 처리**:
- 수량이 1 미만: 아이템 삭제 확인 모달 표시
- 수량이 99 초과: 증가 버튼 비활성화, Toast 알림

---

### BR-CART-002: 중복 메뉴 방지

**규칙**: 동일한 메뉴(`menu.id`)는 장바구니에 1개만 존재할 수 있습니다. 중복 추가 시 수량만 증가합니다.

**검증 시점**: 
- "장바구니에 추가" 버튼 클릭 시

**검증 로직**:
```typescript
function addToCart(cart: Cart, menu: Menu): Cart {
  const existingItem = cart.items.find(item => item.menu.id === menu.id)
  
  if (existingItem) {
    // 중복 메뉴 - 수량만 증가
    existingItem.quantity += 1
    
    if (existingItem.quantity > 99) {
      existingItem.quantity = 99
      showToast('최대 수량은 99개입니다', 'warning')
    }
  } else {
    // 신규 메뉴 - 장바구니에 추가
    cart.items.push({ menu, quantity: 1 })
  }
  
  return cart
}
```

**위반 시 처리**:
- 중복 추가 시도: 수량 자동 증가 + Toast "수량이 증가되었습니다"

---

### BR-CART-003: 품절 메뉴 추가 불가

**규칙**: 품절된 메뉴(`is_available: false`)는 장바구니에 추가할 수 없습니다.

**검증 시점**: 
- "장바구니에 추가" 버튼 클릭 시

**검증 로직**:
```typescript
function canAddToCart(menu: Menu): ValidationResult {
  if (!menu.is_available) {
    return {
      valid: false,
      message: '품절된 메뉴는 주문할 수 없습니다'
    }
  }
  
  return { valid: true }
}
```

**UI 처리**:
- 품절 메뉴 카드에 "품절" 배지 표시
- "장바구니에 추가" 버튼 비활성화 (disabled)
- 버튼 클릭 시 Toast 알림 (추가 안전장치)

**위반 시 처리**:
- Toast 알림: "품절된 메뉴는 주문할 수 없습니다"

---

### BR-CART-004: 빈 장바구니 주문 불가

**규칙**: 장바구니가 비어있을 때는 주문할 수 없습니다.

**검증 시점**: 
- "주문하기" 버튼 렌더링 시
- "주문하기" 버튼 클릭 시 (추가 방어)

**검증 로직**:
```typescript
function canCheckout(cart: Cart): ValidationResult {
  if (cart.items.length === 0) {
    return {
      valid: false,
      message: '장바구니가 비어있습니다'
    }
  }
  
  return { valid: true }
}
```

**UI 처리**:
- 장바구니가 비었을 때: "주문하기" 버튼 비활성화 (disabled)
- 도움말 메시지 표시: "메뉴를 담아주세요"

**위반 시 처리**:
- Toast 알림: "장바구니에 메뉴를 담아주세요"

---

### BR-CART-005: 장바구니 아이템 삭제 확인

**규칙**: 장바구니에서 아이템을 삭제할 때는 사용자 확인을 받아야 합니다.

**확인 시점**: 
- 수량을 0으로 감소시킬 때
- 삭제 버튼(X) 클릭 시

**확인 로직**:
```typescript
function confirmRemoveItem(item: CartItem, onConfirm: () => void) {
  showConfirmModal({
    title: '메뉴 삭제',
    message: `"${item.menu.name}"을(를) 장바구니에서 삭제하시겠습니까?`,
    confirmLabel: '삭제',
    cancelLabel: '취소',
    onConfirm
  })
}
```

**위반 시 처리**:
- 사용자가 취소 선택 시: 아무 동작 안 함

---

## 2. 주문 생성 검증 규칙

### BR-ORDER-001: 주문 확인 필수

**규칙**: 주문을 생성하기 전에 반드시 사용자 확인을 받아야 합니다.

**확인 시점**: 
- "주문하기" 버튼 클릭 시

**확인 로직**:
```typescript
function confirmOrder(cart: Cart, onConfirm: () => void) {
  const total = calculateTotal(cart)
  const itemCount = cart.items.length
  
  showConfirmModal({
    title: '주문 확인',
    message: `총 ${itemCount}개 메뉴, ${total.toLocaleString()}원을 주문하시겠습니까?`,
    details: cart.items.map(item => 
      `${item.menu.name} x ${item.quantity}`
    ),
    confirmLabel: '주문',
    cancelLabel: '취소',
    onConfirm
  })
}
```

**위반 시 처리**:
- 사용자가 취소 선택 시: 주문 생성 안 함, 장바구니 페이지 유지

---

### BR-ORDER-002: 주문 아이템 검증

**규칙**: 주문 생성 시 모든 아이템이 유효해야 합니다.

**검증 시점**: 
- API 호출 직전

**검증 로직**:
```typescript
function validateOrderItems(cart: Cart): ValidationResult {
  if (cart.items.length === 0) {
    return {
      valid: false,
      message: '주문할 메뉴가 없습니다'
    }
  }
  
  for (const item of cart.items) {
    if (item.quantity < 1 || item.quantity > 99) {
      return {
        valid: false,
        message: `"${item.menu.name}" 수량이 올바르지 않습니다`
      }
    }
    
    if (item.menu.id <= 0) {
      return {
        valid: false,
        message: '유효하지 않은 메뉴가 포함되어 있습니다'
      }
    }
  }
  
  return { valid: true }
}
```

**위반 시 처리**:
- Toast 알림: 검증 실패 메시지
- 주문 생성 중단

---

### BR-ORDER-003: 세션 유효성 검증

**규칙**: 주문 생성 시 유효한 세션(로그인 상태)이 있어야 합니다.

**검증 시점**: 
- API 호출 직전

**검증 로직**:
```typescript
function validateSession(): ValidationResult {
  const session = localStorage.getItem('customerAuth')
  
  if (!session) {
    return {
      valid: false,
      message: '로그인이 필요합니다'
    }
  }
  
  try {
    const parsed = JSON.parse(session)
    if (!parsed.tableNumber || !parsed.password) {
      return {
        valid: false,
        message: '세션 정보가 올바르지 않습니다'
      }
    }
  } catch (error) {
    return {
      valid: false,
      message: '세션 정보가 손상되었습니다'
    }
  }
  
  return { valid: true }
}
```

**위반 시 처리**:
- Toast 알림: "다시 로그인해주세요"
- 로그인 페이지로 리다이렉트
- LocalStorage 세션 정보 삭제

---

### BR-ORDER-004: 주문 성공 후 장바구니 초기화

**규칙**: 주문이 성공적으로 생성되면 장바구니를 비워야 합니다.

**실행 시점**: 
- API 호출 성공 후 (200 응답)

**실행 로직**:
```typescript
async function createOrder(cart: Cart) {
  try {
    const response = await api.createOrder(cart)
    
    // 주문 성공
    clearCart()  // Context 초기화
    localStorage.removeItem('customerCart')  // LocalStorage 삭제
    
    showToast(`주문이 접수되었습니다 (주문번호: #${response.order_number})`, 'success')
    navigate('/orders')  // 주문 내역 페이지로 이동
    
  } catch (error) {
    // 주문 실패 - 장바구니 유지
    showToast('주문 생성에 실패했습니다', 'error')
  }
}
```

---

## 3. 세션 관리 규칙

### BR-SESSION-001: 자동 로그인 시도

**규칙**: 앱 시작 시 LocalStorage에 저장된 세션 정보가 있으면 자동으로 로그인을 시도합니다.

**실행 시점**: 
- 앱 초기화 시 (useEffect, componentDidMount)

**실행 로직**:
```typescript
async function initializeAuth() {
  const savedAuth = localStorage.getItem('customerAuth')
  
  if (savedAuth) {
    try {
      const session = JSON.parse(savedAuth)
      
      // 자동 로그인 시도
      await api.loginCustomer({
        table_number: session.tableNumber,
        password: session.password
      })
      
      // 성공 - 메뉴 페이지로 이동
      navigate('/menu')
      
    } catch (error) {
      // 실패 - 저장된 정보 삭제 후 로그인 페이지
      localStorage.removeItem('customerAuth')
      navigate('/login')
    }
  } else {
    // 저장된 정보 없음 - 로그인 페이지
    navigate('/login')
  }
}
```

---

### BR-SESSION-002: 세션 만료 시 자동 재로그인

**규칙**: API 호출 시 401 에러가 발생하면 자동으로 재로그인을 시도합니다.

**실행 시점**: 
- API 호출 시 401 Unauthorized 에러 발생

**실행 로직**:
```typescript
async function handleUnauthorizedError() {
  const savedAuth = localStorage.getItem('customerAuth')
  
  if (savedAuth) {
    try {
      const session = JSON.parse(savedAuth)
      
      // 재로그인 시도
      await api.loginCustomer({
        table_number: session.tableNumber,
        password: session.password
      })
      
      // 성공 - 원래 API 요청 재시도
      return true
      
    } catch (error) {
      // 재로그인 실패
      localStorage.removeItem('customerAuth')
      showToast('다시 로그인해주세요', 'error')
      navigate('/login')
      return false
    }
  } else {
    // 저장된 정보 없음
    showToast('로그인이 필요합니다', 'info')
    navigate('/login')
    return false
  }
}
```

---

### BR-SESSION-003: 로그인 성공 시 정보 저장

**규칙**: 로그인이 성공하면 테이블 정보를 LocalStorage에 저장합니다.

**실행 시점**: 
- 로그인 API 호출 성공 후

**실행 로직**:
```typescript
async function login(tableNumber: number, password: string) {
  try {
    const response = await api.loginCustomer({
      table_number: tableNumber,
      password
    })
    
    // 로그인 정보 저장
    const session: CustomerSession = {
      tableNumber,
      password,
      lastLoginAt: new Date().toISOString()
    }
    
    localStorage.setItem('customerAuth', JSON.stringify(session))
    
    // 메뉴 페이지로 이동
    navigate('/menu')
    
  } catch (error) {
    showToast('로그인에 실패했습니다', 'error')
  }
}
```

---

## 4. 메뉴 조회 규칙

### BR-MENU-001: 품절 메뉴 필터링

**규칙**: 메뉴 목록을 로드할 때 품절 메뉴(`is_available: false`)는 제외합니다.

**실행 시점**: 
- 메뉴 페이지 진입 시

**실행 로직**:
```typescript
async function loadMenus() {
  try {
    // API 호출 시 available=true 파라미터 전달
    const menus = await api.getMenus({ available: true })
    
    // Context에 저장
    setMenus(menus)
    
  } catch (error) {
    showToast('메뉴를 불러오지 못했습니다', 'error')
  }
}
```

---

### BR-MENU-002: 카테고리별 정렬

**규칙**: 메뉴 카테고리는 `display_order` 기준으로 오름차순 정렬합니다.

**실행 시점**: 
- 카테고리 목록 렌더링 시

**실행 로직**:
```typescript
function sortCategories(categories: MenuCategory[]): MenuCategory[] {
  return [...categories].sort((a, b) => a.display_order - b.display_order)
}
```

---

### BR-MENU-003: 메뉴 가격 검증

**규칙**: 메뉴 가격은 0보다 커야 합니다.

**검증 시점**: 
- 메뉴 목록 렌더링 시

**검증 로직**:
```typescript
function isValidMenu(menu: Menu): boolean {
  return (
    menu.id > 0 &&
    menu.price > 0 &&
    menu.name.trim().length > 0
  )
}
```

**위반 시 처리**:
- 유효하지 않은 메뉴는 목록에서 제외
- 콘솔에 경고 로그

---

## 5. 에러 처리 규칙

### BR-ERROR-001: 네트워크 에러 처리

**규칙**: 네트워크 에러 발생 시 사용자 친화적인 메시지를 표시합니다.

**처리 시점**: 
- API 호출 실패 (네트워크 에러, 타임아웃 등)

**처리 로직**:
```typescript
function handleNetworkError(error: any) {
  if (error.message === 'Network Error' || error.message === 'Failed to fetch') {
    showToast('네트워크 연결을 확인해주세요', 'error')
  } else if (error.code === 'ECONNABORTED') {
    showToast('요청 시간이 초과되었습니다', 'error')
  } else {
    showToast('알 수 없는 오류가 발생했습니다', 'error')
  }
  
  console.error('API Error:', error)
}
```

---

### BR-ERROR-002: API 에러 메시지 매핑

**규칙**: Backend API 에러 응답을 사용자 친화적인 한국어 메시지로 변환합니다.

**처리 시점**: 
- API 호출 실패 (4xx, 5xx 응답)

**처리 로직**:
```typescript
function getErrorMessage(error: ApiError): string {
  const errorMessages: Record<string, string> = {
    AUTH_INVALID_CREDENTIALS: '테이블 번호 또는 비밀번호가 올바르지 않습니다',
    AUTH_TOKEN_EXPIRED: '세션이 만료되었습니다',
    ORDER_NOT_FOUND: '주문을 찾을 수 없습니다',
    MENU_NOT_FOUND: '메뉴 정보를 불러올 수 없습니다',
    VALIDATION_ERROR: '입력값이 올바르지 않습니다',
    INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다'
  }
  
  return errorMessages[error.error] || error.message || '알 수 없는 오류가 발생했습니다'
}
```

---

### BR-ERROR-003: Toast 알림 규칙

**규칙**: Toast 알림은 유형에 따라 지속 시간과 색상이 다릅니다.

**Toast 타입**:
- **성공 (success)**: 초록색, 3초
- **에러 (error)**: 빨간색, 5초
- **경고 (warning)**: 노란색, 3초
- **정보 (info)**: 파란색, 3초

**실행 로직**:
```typescript
function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const config = {
    success: { color: 'green', duration: 3000 },
    error: { color: 'red', duration: 5000 },
    warning: { color: 'yellow', duration: 3000 },
    info: { color: 'blue', duration: 3000 }
  }
  
  const { color, duration } = config[type]
  
  // Toast 라이브러리 호출
  toast(message, {
    type,
    autoClose: duration,
    position: 'bottom-center'
  })
}
```

---

## 6. UI/UX 규칙

### BR-UI-001: 터치 친화적 버튼 크기

**규칙**: 모든 터치 가능한 요소는 최소 44x44px 크기를 가져야 합니다.

**적용 대상**: 
- 버튼, 링크, 아이콘 버튼 등

**검증 로직**:
```css
/* 모든 버튼 최소 크기 */
button, .touchable {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}
```

---

### BR-UI-002: 로딩 상태 표시

**규칙**: API 호출 중에는 로딩 인디케이터를 표시해야 합니다.

**표시 시점**: 
- API 호출 시작 ~ 완료/실패

**표시 로직**:
```typescript
async function fetchWithLoading<T>(
  apiCall: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T> {
  setLoading(true)
  try {
    const result = await apiCall()
    return result
  } finally {
    setLoading(false)
  }
}
```

---

### BR-UI-003: 빈 상태 표시

**규칙**: 데이터가 없을 때는 명확한 빈 상태 메시지를 표시합니다.

**적용 대상**: 
- 빈 장바구니, 주문 내역 없음, 검색 결과 없음 등

**표시 예시**:
```typescript
function EmptyCart() {
  return (
    <EmptyState
      icon="🛒"
      message="장바구니가 비어있습니다"
      action={
        <Button onClick={() => navigate('/menu')}>
          메뉴 보러가기
        </Button>
      }
    />
  )
}
```

---

## 7. 데이터 동기화 규칙

### BR-SYNC-001: Context와 LocalStorage 동기화

**규칙**: 장바구니 Context가 변경될 때마다 LocalStorage에 동기화합니다.

**동기화 시점**: 
- 장바구니 아이템 추가/수정/삭제 시

**동기화 로직**:
```typescript
function updateCart(newCart: Cart) {
  // Context 업데이트
  setCart(newCart)
  
  // LocalStorage 동기화
  const cartData = {
    items: newCart.items,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem('customerCart', JSON.stringify(cartData))
}
```

---

### BR-SYNC-002: 앱 시작 시 장바구니 복원

**규칙**: 앱 시작 시 LocalStorage에서 장바구니 데이터를 복원합니다.

**복원 시점**: 
- 앱 초기화 시

**복원 로직**:
```typescript
function restoreCart(): Cart {
  const savedCart = localStorage.getItem('customerCart')
  
  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart)
      
      // 데이터 검증
      if (Array.isArray(parsed.items)) {
        return parsed
      }
    } catch (error) {
      console.error('Failed to restore cart:', error)
    }
  }
  
  // 기본값: 빈 장바구니
  return {
    items: [],
    updatedAt: new Date().toISOString()
  }
}
```

---

## 8. 규칙 우선순위

### 우선순위 1 (Critical):
- BR-ORDER-003: 세션 유효성 검증
- BR-SESSION-002: 세션 만료 시 자동 재로그인
- BR-ERROR-001: 네트워크 에러 처리

### 우선순위 2 (High):
- BR-CART-001: 수량 범위 검증
- BR-CART-004: 빈 장바구니 주문 불가
- BR-ORDER-001: 주문 확인 필수
- BR-ORDER-004: 주문 성공 후 장바구니 초기화

### 우선순위 3 (Medium):
- BR-CART-002: 중복 메뉴 방지
- BR-CART-003: 품절 메뉴 추가 불가
- BR-MENU-001: 품절 메뉴 필터링
- BR-UI-001: 터치 친화적 버튼 크기

### 우선순위 4 (Low):
- BR-UI-002: 로딩 상태 표시
- BR-UI-003: 빈 상태 표시
- BR-MENU-002: 카테고리별 정렬

---

이상으로 Customer Frontend의 비즈니스 규칙 정의를 완료했습니다.
