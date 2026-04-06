# Unit of Work Dependencies

유닛 간 의존성 관계, API 계약, 데이터 플로우를 정의합니다. (Contract-First 방식)

---

## Dependency Matrix

| From \ To | Unit 1 (Backend) | Unit 2 (Customer UI) | Unit 3 (Admin UI) | Day 0 계약 |
|---|---|---|---|---|
| **Unit 1 (Backend)** | - | Provides API | Provides API + SSE | Implements |
| **Unit 2 (Customer UI)** | Uses (통합 시) | - | None | Implements |
| **Unit 3 (Admin UI)** | Uses (통합 시) | None | - | Implements |
| **Day 0 계약** | Required | Required | Required | - |

**Key Observations**:
- **Day 0 계약**이 모든 유닛의 필수 의존성
- Unit 1, 2, 3는 **개발 중에는 서로 독립적** (Mock 사용)
- Unit 2와 Unit 3는 **통합 시에만** Unit 1에 의존
- 3명이 **완전 병렬 개발 가능** (Day 0 계약 준수 조건)

---

## Dependency Graph

```
                    [Day 0: API 계약 + Database Schema]
                                    |
                 +------------------+------------------+
                 |                  |                  |
                 v                  v                  v
          [Unit 1: Backend]  [Unit 2: Customer]  [Unit 3: Admin]
          (Real API)         (Mock API)          (Mock API + SSE)
                 |                  |                  |
                 |   [Week 3: Integration]            |
                 |                  |                  |
                 +--------+---------+---------+--------+
                          |                   |
                          v                   v
                  [Unit 2: Customer]   [Unit 3: Admin]
                  (Real API)           (Real API + SSE)

Legend:
→ : Depends on (contract-based)
⇉ : SSE (real-time stream)
⇄ : Day 0 agreement (coordination needed)
```

---

## Day 0: Contract & Schema Agreement

### Critical Coordination Point

**모든 개발자**가 **Day 0 (1일)**에 참여하여 다음을 합의합니다:

1. **API 계약 정의** (api-contract.yaml)
2. **Database Schema 정의** (database-schema.md)
3. **Mock Data 형식** (mock-data-samples.json)
4. **TypeScript 타입 정의** (index.ts)

### 1. API 계약 정의 (api-contract.yaml)

**위치**: `aidlc-docs/inception/contracts/api-contract.yaml`

**내용**:
- OpenAPI 3.0 spec
- 15개 API 엔드포인트 전체 명세
- Request/Response 스키마
- Error 응답 형식
- Authentication 방식 (JWT)
- SSE 이벤트 형식

**예시 구조**:
```yaml
openapi: 3.0.0
info:
  title: Table Order API
  version: 1.0.0
servers:
  - url: http://localhost:8000
    description: Local development server

paths:
  /api/customer/login:
    post:
      summary: Customer table login
      tags: [Customer]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [store_id, table_number, table_password]
              properties:
                store_id: { type: string, example: "store_1" }
                table_number: { type: integer, example: 1 }
                table_password: { type: string, example: "1234" }
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  session_id: { type: string, example: "session_123" }
                  table_info:
                    type: object
                    properties:
                      id: { type: string }
                      table_number: { type: integer }
                      store_name: { type: string }
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                type: object
                properties:
                  error: { type: string }

  /api/customer/menus:
    get:
      summary: Get menu list
      tags: [Customer]
      parameters:
        - in: query
          name: store_id
          required: true
          schema: { type: string }
        - in: query
          name: category_id
          schema: { type: string }
      responses:
        '200':
          description: Menu list
          content:
            application/json:
              schema:
                type: object
                properties:
                  menus:
                    type: array
                    items:
                      type: object
                      properties:
                        id: { type: string }
                        name: { type: string }
                        price: { type: number }
                        description: { type: string }
                        category_id: { type: string }
                        image_url: { type: string }
                  categories:
                    type: array
                    items:
                      type: object
                      properties:
                        id: { type: string }
                        name: { type: string }

  # ... 나머지 13개 endpoints (POST /api/customer/orders, GET /api/customer/orders, 
  #     POST /api/admin/login, GET /api/admin/orders/stream, etc.)

components:
  schemas:
    Error:
      type: object
      properties:
        error: { type: string }
        detail: { type: string }
```

**전체 엔드포인트 목록 (15개)**:
1. POST /api/customer/login
2. GET /api/customer/menus
3. POST /api/customer/orders
4. GET /api/customer/orders
5. POST /api/admin/login
6. GET /api/admin/orders/stream (SSE)
7. GET /api/admin/orders
8. PATCH /api/admin/orders/{id}/status
9. DELETE /api/admin/orders/{id}
10. POST /api/admin/tables/{id}/complete
11. GET /api/admin/orders/history
12. GET /api/admin/menus
13. POST /api/admin/menus
14. PUT /api/admin/menus/{id}
15. DELETE /api/admin/menus/{id}

---

### 2. Database Schema 정의 (database-schema.md)

**위치**: `aidlc-docs/inception/contracts/database-schema.md`

**내용**:
- ERD 다이어그램
- 9개 테이블 구조
- 컬럼 타입, 제약조건, Foreign Keys
- 인덱스 전략

**ERD 다이어그램**:
```
┌─────────────┐
│   stores    │
│─────────────│
│ id (PK)     │
│ name        │
│ ...         │
└──────┬──────┘
       │
       ├──────┐
       │      │
       │   ┌──▼──────────┐
       │   │   admins    │
       │   │─────────────│
       │   │ id (PK)     │
       │   │ store_id(FK)│
       │   │ username    │
       │   │ password    │
       │   └─────────────┘
       │
       ├──────┐
       │      │
       │   ┌──▼──────────────┐
       │   │ menu_categories │
       │   │─────────────────│
       │   │ id (PK)         │
       │   │ store_id (FK)   │
       │   │ name            │
       │   └──────┬──────────┘
       │          │
       │       ┌──▼──────────┐
       │       │   menus     │
       │       │─────────────│
       │       │ id (PK)     │
       │       │ store_id(FK)│
       │       │ category(FK)│
       │       │ name, price │
       │       └──────┬──────┘
       │              │
       ├──────┐       │
       │      │       │
       │   ┌──▼───────▼──────┐
       │   │    tables       │
       │   │─────────────────│
       │   │ id (PK)         │
       │   │ store_id (FK)   │
       │   │ table_number    │
       │   │ password        │
       │   └──────┬──────────┘
       │          │
       │       ┌──▼───────────────┐
       │       │ table_sessions   │
       │       │──────────────────│
       │       │ id (PK)          │
       │       │ table_id (FK)    │
       │       │ start_time       │
       │       │ end_time         │
       │       └──────┬───────────┘
       │              │
       │           ┌──▼──────────┐
       │           │   orders    │
       │           │─────────────│
       │           │ id (PK)     │
       │           │ table_id(FK)│
       │           │ session(FK) │
       │           │ status      │
       │           │ total       │
       │           └──────┬──────┘
       │                  │
       │               ┌──▼──────────┐
       │               │order_items  │
       │               │─────────────│
       │               │ id (PK)     │
       │               │ order_id(FK)│
       │               │ menu_id (FK)│
       │               │ quantity    │
       │               └─────────────┘
       │
       └──────┐
              │
           ┌──▼───────────────┐
           │ order_history    │
           │──────────────────│
           │ id (PK)          │
           │ table_id (FK)    │
           │ session_id (FK)  │
           │ archived_data    │
           └──────────────────┘
```

**테이블 상세 정의** (예시: stores 테이블):
```
Table: stores
Columns:
  - id: VARCHAR(36) PRIMARY KEY (UUID)
  - name: VARCHAR(255) NOT NULL
  - address: VARCHAR(500)
  - phone: VARCHAR(20)
  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Indexes:
  - PRIMARY KEY (id)

Constraints:
  - name UNIQUE
```

*(나머지 8개 테이블도 동일 형식으로 정의)*

---

### 3. Mock Data 샘플 (mock-data-samples.json)

**위치**: `aidlc-docs/inception/contracts/mock-data-samples.json`

**내용**:
- 모든 API 응답 예시
- SSE 이벤트 예시
- Error 응답 예시

**예시**:
```json
{
  "customerLogin": {
    "request": {
      "store_id": "store_1",
      "table_number": 1,
      "table_password": "1234"
    },
    "response": {
      "session_id": "session_abc123",
      "table_info": {
        "id": "table_1",
        "table_number": 1,
        "store_name": "Sample Restaurant"
      }
    }
  },
  "menus": {
    "response": {
      "menus": [
        {
          "id": "menu_1",
          "name": "Margherita Pizza",
          "price": 15000,
          "description": "Classic pizza with tomato and mozzarella",
          "category_id": "cat_1",
          "image_url": "https://example.com/pizza.jpg"
        },
        {
          "id": "menu_2",
          "name": "Carbonara Pasta",
          "price": 12000,
          "description": "Creamy pasta with bacon",
          "category_id": "cat_1",
          "image_url": "https://example.com/pasta.jpg"
        }
      ],
      "categories": [
        {
          "id": "cat_1",
          "name": "Main Dishes"
        }
      ]
    }
  },
  "createOrder": {
    "request": {
      "table_id": "table_1",
      "session_id": "session_abc123",
      "items": [
        { "menu_id": "menu_1", "quantity": 2 },
        { "menu_id": "menu_2", "quantity": 1 }
      ]
    },
    "response": {
      "order_id": "order_xyz789",
      "order_number": 12,
      "total_amount": 42000
    }
  },
  "sseEvent": {
    "event": "order.created",
    "data": {
      "order_id": "order_xyz789",
      "table_id": "table_1",
      "order_number": 12,
      "status": "pending",
      "total_amount": 42000,
      "items": [
        { "menu_id": "menu_1", "menu_name": "Margherita Pizza", "quantity": 2, "price": 15000 },
        { "menu_id": "menu_2", "menu_name": "Carbonara Pasta", "quantity": 1, "price": 12000 }
      ],
      "created_at": "2026-04-06T12:00:00Z"
    }
  },
  "error": {
    "401": {
      "error": "Authentication failed",
      "detail": "Invalid table password"
    },
    "404": {
      "error": "Not found",
      "detail": "Table not found"
    },
    "500": {
      "error": "Internal server error",
      "detail": "Unexpected error occurred"
    }
  }
}
```

---

### 4. TypeScript 타입 정의 (index.ts)

**위치**: `frontend/common-types/index.ts`

**내용**: OpenAPI spec에서 자동 생성 또는 수동 정의

**자동 생성 방법 (권장)**:
```bash
npm install -g openapi-typescript
openapi-typescript aidlc-docs/inception/contracts/api-contract.yaml -o frontend/common-types/index.ts
```

**수동 정의 예시**:
```typescript
// Customer API Types
export interface LoginRequest {
  store_id: string
  table_number: number
  table_password: string
}

export interface LoginResponse {
  session_id: string
  table_info: {
    id: string
    table_number: number
    store_name: string
  }
}

export interface Menu {
  id: string
  name: string
  price: number
  description: string
  category_id: string
  image_url: string
}

export interface MenuCategory {
  id: string
  name: string
}

export interface MenuResponse {
  menus: Menu[]
  categories: MenuCategory[]
}

export interface CreateOrderRequest {
  table_id: string
  session_id: string
  items: {
    menu_id: string
    quantity: number
  }[]
}

export interface OrderResponse {
  order_id: string
  order_number: number
  total_amount: number
}

export interface Order {
  id: string
  order_number: number
  table_id: string
  session_id: string
  total_amount: number
  status: 'pending' | 'preparing' | 'completed'
  created_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_id: string
  menu_name: string
  quantity: number
  price: number
}

// Admin API Types
export interface AdminLoginRequest {
  store_id: string
  username: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  admin: {
    id: string
    username: string
    store_id: string
  }
}

export interface OrdersResponse {
  orders: Order[]
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'preparing' | 'completed'
}

// SSE Event Types
export interface SSEEvent {
  event: 'order.created' | 'order.status_changed' | 'order.deleted'
  data: any
}

export interface OrderCreatedEvent {
  order_id: string
  table_id: string
  order_number: number
  status: string
  total_amount: number
  items: OrderItem[]
  created_at: string
}

// Error Types
export interface ErrorResponse {
  error: string
  detail?: string
}
```

---

## API Contract: Unit 1 (Backend) Implementation

### Backend가 구현해야 할 API (Day 0 계약 준수)

| Endpoint | Method | Purpose | Contract Reference |
|---|---|---|---|
| /api/customer/login | POST | 테이블 로그인 | api-contract.yaml#/paths/~1api~1customer~1login |
| /api/customer/menus | GET | 메뉴 조회 | api-contract.yaml#/paths/~1api~1customer~1menus |
| /api/customer/orders | POST | 주문 생성 | api-contract.yaml#/paths/~1api~1customer~1orders~post |
| /api/customer/orders | GET | 주문 내역 | api-contract.yaml#/paths/~1api~1customer~1orders~get |
| /api/admin/login | POST | 관리자 로그인 | api-contract.yaml#/paths/~1api~1admin~1login |
| /api/admin/orders/stream | GET | SSE 실시간 스트림 | api-contract.yaml#/paths/~1api~1admin~1orders~1stream |
| /api/admin/orders | GET | 주문 목록 조회 | api-contract.yaml#/paths/~1api~1admin~1orders |
| /api/admin/orders/{id}/status | PATCH | 주문 상태 변경 | api-contract.yaml#/paths/~1api~1admin~1orders~1{id}~1status |
| /api/admin/orders/{id} | DELETE | 주문 삭제 | api-contract.yaml#/paths/~1api~1admin~1orders~1{id} |
| /api/admin/tables/{id}/complete | POST | 테이블 세션 종료 | api-contract.yaml#/paths/~1api~1admin~1tables~1{id}~1complete |
| /api/admin/orders/history | GET | 과거 주문 내역 | api-contract.yaml#/paths/~1api~1admin~1orders~1history |
| /api/admin/menus | GET | 메뉴 목록 조회 | api-contract.yaml#/paths/~1api~1admin~1menus |
| /api/admin/menus | POST | 메뉴 등록 | api-contract.yaml#/paths/~1api~1admin~1menus~post |
| /api/admin/menus/{id} | PUT | 메뉴 수정 | api-contract.yaml#/paths/~1api~1admin~1menus~1{id} |
| /api/admin/menus/{id} | DELETE | 메뉴 삭제 | api-contract.yaml#/paths/~1api~1admin~1menus~1{id}~delete |

**검증 방법**:
- Postman으로 각 엔드포인트 테스트
- Request/Response가 Day 0 계약과 정확히 일치하는지 확인
- Error 응답도 계약대로 반환하는지 확인

---

## API Contract: Unit 2 (Customer Frontend) Mock Implementation

### Mock API 구현 (Day 0 계약 준수)

**파일**: `frontend/customer/src/services/mockApi.ts`

```typescript
import type { LoginRequest, LoginResponse, MenuResponse, CreateOrderRequest, OrderResponse, OrdersResponse } from '../../common-types'

const MOCK_DELAY = 500

// Mock data from mock-data-samples.json
const MOCK_MENUS: MenuResponse = {
  menus: [
    { id: 'menu_1', name: 'Margherita Pizza', price: 15000, description: 'Classic pizza', category_id: 'cat_1', image_url: 'https://example.com/pizza.jpg' },
    { id: 'menu_2', name: 'Carbonara Pasta', price: 12000, description: 'Creamy pasta', category_id: 'cat_1', image_url: 'https://example.com/pasta.jpg' }
  ],
  categories: [
    { id: 'cat_1', name: 'Main Dishes' }
  ]
}

export const mockApi = {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    await sleep(MOCK_DELAY)
    // Day 0 계약대로 응답
    return {
      session_id: 'mock_session_' + Date.now(),
      table_info: {
        id: 'table_1',
        table_number: req.table_number,
        store_name: 'Mock Restaurant'
      }
    }
  },

  getMenus: async (params: { store_id: string; category_id?: string }): Promise<MenuResponse> => {
    await sleep(MOCK_DELAY)
    return MOCK_MENUS
  },

  createOrder: async (req: CreateOrderRequest): Promise<OrderResponse> => {
    await sleep(MOCK_DELAY)
    const total = req.items.reduce((sum, item) => sum + (item.quantity * 15000), 0)
    return {
      order_id: 'mock_order_' + Date.now(),
      order_number: Math.floor(Math.random() * 100) + 1,
      total_amount: total
    }
  },

  getOrders: async (sessionId: string): Promise<OrdersResponse> => {
    await sleep(MOCK_DELAY)
    return {
      orders: [
        {
          id: 'mock_order_1',
          order_number: 1,
          table_id: 'table_1',
          session_id: sessionId,
          total_amount: 15000,
          status: 'pending',
          created_at: new Date().toISOString(),
          items: []
        }
      ]
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
```

**통합 시 (Week 3)**:
```typescript
// frontend/customer/src/services/api.ts
import { mockApi } from './mockApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = USE_MOCK ? mockApi : {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },
  // ... other endpoints
}
```

---

## API Contract: Unit 3 (Admin Frontend) Mock Implementation

### Mock API + Mock SSE 구현 (Day 0 계약 준수)

**Mock API**: Unit 2와 유사 (생략)

**Mock SSE**:

**파일**: `frontend/admin/src/services/mockSse.ts`

```typescript
import type { OrderCreatedEvent } from '../../common-types'

export class MockSSE {
  private intervalId: number | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    console.log('[MockSSE] Connected to', url)
    
    // Simulate SSE events every 10 seconds
    this.intervalId = window.setInterval(() => {
      if (this.onmessage) {
        const mockEvent: OrderCreatedEvent = {
          order_id: 'mock_order_' + Date.now(),
          table_id: 'table_' + (Math.floor(Math.random() * 10) + 1),
          order_number: Math.floor(Math.random() * 100) + 1,
          status: 'pending',
          total_amount: 15000 + Math.floor(Math.random() * 50000),
          items: [
            { id: '1', order_id: '', menu_id: 'menu_1', menu_name: 'Pizza', quantity: 2, price: 15000 }
          ],
          created_at: new Date().toISOString()
        }

        const messageEvent = {
          data: JSON.stringify({
            event: 'order.created',
            data: mockEvent
          })
        } as MessageEvent

        this.onmessage(messageEvent)
      }
    }, 10000)
  }

  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      console.log('[MockSSE] Connection closed')
    }
  }
}
```

**SSE 클라이언트**:

**파일**: `frontend/admin/src/services/sse.ts`

```typescript
import { MockSSE } from './mockSse'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const createSSEConnection = (storeId: string) => {
  const url = `${BASE_URL}/api/admin/orders/stream?store_id=${storeId}`
  
  if (USE_MOCK) {
    console.log('[SSE] Using Mock SSE')
    return new MockSSE(url)
  } else {
    console.log('[SSE] Using Real SSE:', url)
    return new EventSource(url, { withCredentials: true })
  }
}
```

---

## Integration Strategy

### Week 3: Mock → Real API 전환

#### Phase 1: Backend 준비 (Day 1-2)
- Developer 1: Backend 서버 실행
- Developer 1: Postman으로 모든 API 테스트
- Developer 1: API 문서 확인 (`http://localhost:8000/docs`)

#### Phase 2: Customer Frontend 통합 (Day 3-4)
- Developer 2: `.env` 변경
  ```
  VITE_USE_MOCK_API=false
  VITE_API_BASE_URL=http://localhost:8000
  ```
- Developer 2: Real API로 테스트
- Developer 2: 버그 발견 시 Developer 1에게 보고

#### Phase 3: Admin Frontend 통합 (Day 5-6)
- Developer 3: `.env` 변경
  ```
  VITE_USE_MOCK_API=false
  VITE_API_BASE_URL=http://localhost:8000
  ```
- Developer 3: Real API + Real SSE로 테스트
- Developer 3: SSE 연결 검증
- Developer 3: 버그 발견 시 Developer 1에게 보고

#### Phase 4: End-to-End 테스트 (Day 7)
- 모든 개발자: 전체 플로우 테스트
  - Customer: 로그인 → 메뉴 조회 → 주문 생성
  - Admin: SSE로 실시간 주문 수신 확인
  - Admin: 주문 상태 변경
  - Customer: 변경된 상태 확인

---

## Dependency Summary

| Dependency Type | From | To | Nature | Critical |
|---|---|---|---|---|
| Day 0 계약 | Unit 1 | Day 0 | Implements API | **Critical** |
| Day 0 계약 | Unit 2 | Day 0 | Implements Mock | **Critical** |
| Day 0 계약 | Unit 3 | Day 0 | Implements Mock | **Critical** |
| Integration | Unit 2 | Unit 1 | Mock → Real API | Week 3 only |
| Integration | Unit 3 | Unit 1 | Mock → Real API + SSE | Week 3 only |

**Total Dependencies**: 5  
**Critical Path**: Day 0 계약 → (Unit 1 ∥ Unit 2 ∥ Unit 3) → Integration  
**Parallel Opportunity**: Week 1-2 완전 병렬 (3명 독립 개발)

---

## Integration Checkpoints

| Checkpoint | Description | Verify | When |
|---|---|---|---|
| 0. Day 0 계약 완료 | API 계약 + Schema + Mock Data 합의 | 모든 문서 승인 | Day 0 |
| 1. Backend Complete | Unit 1 모든 API 작동 | Postman tests pass | Week 2 End |
| 2. Customer Mock Complete | Unit 2 Mock API로 작동 | Mock으로 완전 독립 실행 | Week 2 End |
| 3. Admin Mock Complete | Unit 3 Mock API + SSE로 작동 | Mock으로 완전 독립 실행 | Week 2 End |
| 4. Customer Integration | Unit 2 → Unit 1 Real API | Order flow E2E test | Week 3, Day 3-4 |
| 5. Admin Integration | Unit 3 → Unit 1 Real API + SSE | Dashboard SSE test | Week 3, Day 5-6 |
| 6. Full System Test | All 3 units working together | Complete user journey | Week 3, Day 7 |

---

**Dependency Analysis Complete** ✓  
**Critical Path Identified**: Day 0 계약 → 완전 병렬 개발 → 통합  
**Integration Strategy**: Defined (Contract-First)  
**Parallel Development**: 3명 완전 독립 (Week 1-2)  
**Independence Guaranteed**: Mock API + Mock SSE로 Backend 의존성 제거
