# Mock API Strategy - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T15:56:00Z

---

## Overview

Customer Frontend는 Backend와 완전히 독립적으로 개발할 수 있도록 Mock API를 구현합니다. 이를 통해 Unit 1 (Backend)의 개발 진행과 무관하게 병렬로 작업할 수 있습니다.

---

## Mock API 구현 전략

### 목표
1. **완전 독립 개발**: Backend 없이 모든 기능 구현 및 테스트
2. **Day 0 계약 준수**: API 계약과 TypeScript 타입 완벽 준수
3. **빠른 전환**: Mock ↔ Real API 전환이 환경 변수로 간단하게
4. **현실적인 시뮬레이션**: 네트워크 지연, 에러 시나리오 포함

### 원칙
- Day 0 계약의 Request/Response 타입 정확히 준수
- 실제 API와 동일한 인터페이스 제공
- 환경 변수(`.env`)로 Mock/Real 전환

---

## 파일 구조

```
frontend/customer/src/services/
├── api.ts              # API Client (Real 또는 Mock 선택)
├── mockApi.ts          # Mock API 구현
├── mockData.ts         # Mock 데이터 (시드 데이터)
└── types.ts            # Day 0 타입 (복사 또는 import)
```

---

## Mock API 구현

### api.ts (API Client 선택자)

```typescript
import { mockApi } from './mockApi'
import { realApi } from './realApi'
import type { ApiClient } from './types'

// 환경 변수로 Mock vs Real 전환
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

export const api: ApiClient = USE_MOCK_API ? mockApi : realApi

console.log(`API Mode: ${USE_MOCK_API ? 'MOCK' : 'REAL'}`)
```

---

### mockApi.ts (Mock API 구현)

```typescript
import type {
  ApiClient,
  CustomerLoginRequest,
  CustomerLoginResponse,
  Menu,
  MenuCategory,
  Order,
  CreateOrderRequest,
  CreateOrderResponse
} from './types'
import { mockData, generateOrderNumber } from './mockData'

// Mock 네트워크 지연 시뮬레이션
const MOCK_DELAY = 500 // ms

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock 에러 시뮬레이션 (10% 확률)
const ERROR_RATE = 0.0 // 0.1 = 10%, 0.0 = 에러 없음

function shouldSimulateError(): boolean {
  return Math.random() < ERROR_RATE
}

function simulateError() {
  throw {
    error: 'INTERNAL_SERVER_ERROR',
    message: '서버 오류가 발생했습니다 (Mock Error)'
  }
}

// ========================================================================
// Mock API Implementation
// ========================================================================

export const mockApi: ApiClient = {
  // ----------------------
  // Auth API
  // ----------------------
  
  async loginCustomer(credentials: CustomerLoginRequest): Promise<CustomerLoginResponse> {
    await delay(MOCK_DELAY)
    
    if (shouldSimulateError()) {
      simulateError()
    }
    
    // Mock 로그인 검증
    const table = mockData.tables.find(
      t => t.table_number === credentials.table_number
    )
    
    if (!table) {
      throw {
        error: 'AUTH_INVALID_CREDENTIALS',
        message: '테이블 번호가 올바르지 않습니다'
      }
    }
    
    // Mock: 비밀번호는 항상 "table123"으로 가정
    if (credentials.password !== 'table123') {
      throw {
        error: 'AUTH_INVALID_CREDENTIALS',
        message: '비밀번호가 올바르지 않습니다'
      }
    }
    
    // Mock: 세션 생성 (실제로는 Backend에서 처리)
    // Cookie는 브라우저가 자동 처리한다고 가정
    
    return {
      message: '로그인 성공',
      store: mockData.stores[0]
    }
  },
  
  async logout(): Promise<{ message: string }> {
    await delay(MOCK_DELAY)
    
    return {
      message: '로그아웃 성공'
    }
  },
  
  // ----------------------
  // Menus API
  // ----------------------
  
  async getMenus(params?: { category_id?: number; available?: boolean }): Promise<Menu[]> {
    await delay(MOCK_DELAY)
    
    if (shouldSimulateError()) {
      simulateError()
    }
    
    let menus = [...mockData.menus]
    
    // 카테고리 필터링
    if (params?.category_id) {
      menus = menus.filter(menu => menu.category_id === params.category_id)
    }
    
    // 가용성 필터링
    if (params?.available !== undefined) {
      menus = menus.filter(menu => menu.is_available === params.available)
    }
    
    // 카테고리 정보 조인 (Mock)
    return menus.map(menu => ({
      ...menu,
      category: mockData.categories.find(c => c.id === menu.category_id)
    }))
  },
  
  // ----------------------
  // Orders API
  // ----------------------
  
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    await delay(MOCK_DELAY)
    
    if (shouldSimulateError()) {
      simulateError()
    }
    
    // Mock 주문 생성
    const orderNumber = generateOrderNumber()
    const orderId = mockData.orders.length + 1
    
    const orderItems = request.items.map((item, index) => {
      const menu = mockData.menus.find(m => m.id === item.menu_id)
      
      return {
        id: mockData.orderItems.length + index + 1,
        order_id: orderId,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: menu?.price || 0,
        menu
      }
    })
    
    const newOrder: Order = {
      id: orderId,
      store_id: 1,
      table_id: request.table_id,
      order_number: orderNumber,
      status: 'pending',
      created_at: new Date().toISOString(),
      items: orderItems
    }
    
    // Mock 데이터에 추가
    mockData.orders.push(newOrder)
    mockData.orderItems.push(...orderItems)
    
    return newOrder
  },
  
  async getOrders(params?: { status?: string; table_id?: number }): Promise<Order[]> {
    await delay(MOCK_DELAY)
    
    if (shouldSimulateError()) {
      simulateError()
    }
    
    let orders = [...mockData.orders]
    
    // 테이블 ID 필터링 (현재 세션)
    if (params?.table_id) {
      orders = orders.filter(order => order.table_id === params.table_id)
    }
    
    // 상태 필터링
    if (params?.status) {
      orders = orders.filter(order => order.status === params.status)
    }
    
    // 최신 주문 먼저 (created_at DESC)
    orders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    // OrderItem에 Menu 정보 조인
    return orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        menu: mockData.menus.find(m => m.id === item.menu_id)
      }))
    }))
  },
  
  async getOrder(orderId: number): Promise<Order> {
    await delay(MOCK_DELAY)
    
    if (shouldSimulateError()) {
      simulateError()
    }
    
    const order = mockData.orders.find(o => o.id === orderId)
    
    if (!order) {
      throw {
        error: 'ORDER_NOT_FOUND',
        message: '주문을 찾을 수 없습니다'
      }
    }
    
    return {
      ...order,
      items: order.items.map(item => ({
        ...item,
        menu: mockData.menus.find(m => m.id === item.menu_id)
      }))
    }
  },
  
  // ----------------------
  // Tables API (Customer용은 getTableSession만 필요)
  // ----------------------
  
  async getTableSession(): Promise<{ id: number; table_id: number; started_at: string; ended_at: string | null }> {
    await delay(MOCK_DELAY)
    
    // Mock: 현재 세션 반환
    return {
      id: 1,
      table_id: 1,
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
      ended_at: null
    }
  },
  
  // Admin API는 Customer에서 사용하지 않으므로 생략
  updateOrderStatus: async () => { throw new Error('Not implemented in Customer') },
  deleteOrder: async () => { throw new Error('Not implemented in Customer') },
  completeTableSession: async () => { throw new Error('Not implemented in Customer') },
  getActiveTables: async () => { throw new Error('Not implemented in Customer') },
  getTableHistory: async () => { throw new Error('Not implemented in Customer') },
  createMenu: async () => { throw new Error('Not implemented in Customer') },
  updateMenu: async () => { throw new Error('Not implemented in Customer') },
  deleteMenu: async () => { throw new Error('Not implemented in Customer') },
  subscribeToOrders: () => { throw new Error('Not implemented in Customer') }
}
```

---

### mockData.ts (Mock 시드 데이터)

```typescript
import type { Store, Table, MenuCategory, Menu, Order, OrderItem } from './types'

// ========================================================================
// Mock Database
// ========================================================================

export const mockData: {
  stores: Store[]
  tables: Table[]
  categories: MenuCategory[]
  menus: Menu[]
  orders: Order[]
  orderItems: OrderItem[]
} = {
  // ----------------------
  // Stores
  // ----------------------
  stores: [
    {
      id: 1,
      name: 'Mock 레스토랑',
      table_count: 10,
      created_at: '2026-04-01T00:00:00Z'
    }
  ],
  
  // ----------------------
  // Tables
  // ----------------------
  tables: [
    { id: 1, store_id: 1, table_number: 1, created_at: '2026-04-01T00:00:00Z' },
    { id: 2, store_id: 1, table_number: 2, created_at: '2026-04-01T00:00:00Z' },
    { id: 3, store_id: 1, table_number: 3, created_at: '2026-04-01T00:00:00Z' },
    { id: 4, store_id: 1, table_number: 4, created_at: '2026-04-01T00:00:00Z' },
    { id: 5, store_id: 1, table_number: 5, created_at: '2026-04-01T00:00:00Z' }
  ],
  
  // ----------------------
  // Categories
  // ----------------------
  categories: [
    { id: 1, store_id: 1, name: '메인 요리', display_order: 1 },
    { id: 2, store_id: 1, name: '음료', display_order: 2 },
    { id: 3, store_id: 1, name: '디저트', display_order: 3 }
  ],
  
  // ----------------------
  // Menus
  // ----------------------
  menus: [
    // 메인 요리
    {
      id: 1,
      store_id: 1,
      category_id: 1,
      name: '마르게리따 피자',
      description: '신선한 토마토, 모짜렐라 치즈, 바질',
      price: 15000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 2,
      store_id: 1,
      category_id: 1,
      name: '까르보나라 파스타',
      description: '베이컨, 계란, 파르메산 치즈',
      price: 12000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 3,
      store_id: 1,
      category_id: 1,
      name: '스테이크',
      description: '200g 안심 스테이크, 감자 퓨레',
      price: 25000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 4,
      store_id: 1,
      category_id: 1,
      name: '치킨 샐러드',
      description: '그릴 치킨, 신선한 채소, 발사믹 드레싱',
      price: 10000,
      is_available: false, // 품절
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    
    // 음료
    {
      id: 5,
      store_id: 1,
      category_id: 2,
      name: '콜라',
      description: '코카콜라',
      price: 3000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 6,
      store_id: 1,
      category_id: 2,
      name: '아메리카노',
      description: '진한 에스프레소',
      price: 4000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 7,
      store_id: 1,
      category_id: 2,
      name: '오렌지 주스',
      description: '100% 착즙 주스',
      price: 5000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    
    // 디저트
    {
      id: 8,
      store_id: 1,
      category_id: 3,
      name: '티라미수',
      description: '이탈리안 디저트',
      price: 7000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    },
    {
      id: 9,
      store_id: 1,
      category_id: 3,
      name: '아이스크림',
      description: '바닐라, 초콜릿, 딸기 중 선택',
      price: 5000,
      is_available: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }
  ],
  
  // ----------------------
  // Orders (초기 빈 배열)
  // ----------------------
  orders: [],
  
  // ----------------------
  // OrderItems (초기 빈 배열)
  // ----------------------
  orderItems: []
}

// ========================================================================
// Helper Functions
// ========================================================================

let orderNumberCounter = 1

export function generateOrderNumber(): number {
  return orderNumberCounter++
}

export function resetMockData() {
  mockData.orders = []
  mockData.orderItems = []
  orderNumberCounter = 1
}
```

---

## 환경 변수 설정

### .env (Mock API 사용)

```env
# Mock API 사용 (독립 개발)
VITE_USE_MOCK_API=true

# Backend URL (Real API 사용 시)
# VITE_API_BASE_URL=http://localhost:8000
```

### .env.production (Real API 사용)

```env
# Real API 사용 (통합 후)
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

---

## Mock vs Real API 전환

### 개발 단계 (Mock)
```bash
# .env 파일
VITE_USE_MOCK_API=true

# 앱 실행
npm run dev
```

### 통합 단계 (Real)
```bash
# .env 파일
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000

# Backend 실행 (Unit 1)
cd backend
uvicorn app.main:app --reload

# Frontend 실행 (Unit 2)
cd frontend/customer
npm run dev
```

---

## Mock API 테스트 시나리오

### 시나리오 1: 로그인 후 메뉴 조회
1. 테이블 번호: `1`, 비밀번호: `table123`
2. 로그인 성공 → `/menu`로 이동
3. 메뉴 9개 로드 (품절 메뉴 1개 포함)
4. 카테고리 필터링 테스트

### 시나리오 2: 장바구니 & 주문 생성
1. 메뉴 3개 장바구니에 추가
2. 수량 조절 (증가/감소)
3. 주문 확인 모달
4. 주문 생성 → 주문 내역 페이지

### 시나리오 3: 에러 시뮬레이션
1. `mockApi.ts`에서 `ERROR_RATE = 0.5` (50% 에러)
2. API 호출 시 간헐적 에러 발생
3. Toast 알림 확인

---

## Mock API 장점

### 독립 개발
- Backend 개발 완료를 기다리지 않음
- Unit 1, 2 완전 병렬 개발

### 빠른 반복
- 네트워크 지연 없음 (500ms 시뮬레이션)
- Backend 재시작 불필요

### 테스트 용이
- 에러 시나리오 쉽게 테스트
- 엣지 케이스 시뮬레이션

### 데모 가능
- Backend 없이 Frontend 데모 가능
- Mock 데이터로 완전 작동하는 UI

---

## Mock API 제약사항

### 영속성 없음
- Mock 데이터는 메모리에만 존재
- 페이지 새로고침 시 초기화 (주문 내역 사라짐)
- LocalStorage는 장바구니에만 사용

### 세션 관리 간소화
- JWT 토큰 검증 없음
- 세션 만료 시뮬레이션 없음
- 모든 요청이 "로그인 상태"로 간주

### SSE 지원 없음
- Customer는 SSE 사용하지 않으므로 문제 없음
- Admin은 Mock SSE 별도 구현 필요

---

## 통합 시 주의사항

### Real API 전환 체크리스트
- [ ] `.env` 파일: `VITE_USE_MOCK_API=false`
- [ ] Backend 실행 확인: `http://localhost:8000/docs`
- [ ] CORS 설정 확인 (Backend)
- [ ] Cookie 설정 확인 (HTTP-only, SameSite)
- [ ] API 엔드포인트 URL 확인

### 차이점 확인
- Mock: 비밀번호 항상 "table123"
- Real: 실제 테이블 비밀번호 사용

- Mock: 세션 검증 없음
- Real: JWT 토큰 검증

- Mock: 에러 응답 간단
- Real: 상세한 에러 메시지 및 details

---

## 코드 예시: mockApi 사용

```typescript
// src/pages/MenuPage.tsx

import { api } from '../services/api'

function MenuPage() {
  useEffect(() => {
    async function loadMenus() {
      try {
        // Mock 또는 Real API 자동 선택
        const menus = await api.getMenus({ available: true })
        setMenus(menus)
      } catch (error) {
        showToast('메뉴를 불러오지 못했습니다', 'error')
      }
    }
    
    loadMenus()
  }, [])
}
```

---

이상으로 Customer Frontend의 Mock API 전략을 완료했습니다.
