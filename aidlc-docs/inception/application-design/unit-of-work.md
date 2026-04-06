# Unit of Work Definitions

테이블오더 서비스를 3개의 개발 단위로 분해하여 **완전 독립 병렬 개발** 가능합니다.

---

## Unit Overview

| Unit | Name | Priority | Estimated Duration | Dependencies | Developer |
|---|---|---|---|---|---|
| 1 | Backend API & Database | 1 | 1-2주 | Day 0 계약 | Developer 1 |
| 2 | Customer Frontend | 1 | 1-2주 | Day 0 계약 | Developer 2 |
| 3 | Admin Frontend | 1 | 1-2주 | Day 0 계약 | Developer 3 |

**Total Duration**: 1-2주 (3명 완전 병렬) + 0.5-1주 (통합 & 테스트)

**Parallel Development Strategy**: Day 0 사전 합의 → 3명 완전 독립 개발 → 최종 통합

---

## Day 0: Contract & Schema Agreement (모든 개발자)

### Purpose
3명이 독립 개발을 위한 사전 합의 및 계약 정의

### 필수 산출물

#### 1. API 계약 정의 (OpenAPI/Swagger Spec)
- **파일**: `aidlc-docs/inception/contracts/api-contract.yaml`
- **내용**:
  - 모든 API 엔드포인트 (15개)
  - Request/Response 스키마
  - Error 응답 형식
  - Authentication 방식 (JWT)
  - SSE 이벤트 형식

**예시**:
```yaml
openapi: 3.0.0
info:
  title: Table Order API
  version: 1.0.0
paths:
  /api/customer/login:
    post:
      summary: Customer login
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                store_id: { type: string }
                table_number: { type: integer }
                table_password: { type: string }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  session_id: { type: string }
                  table_info: { type: object }
  # ... 나머지 14개 endpoints
```

#### 2. Database Schema 정의
- **파일**: `aidlc-docs/inception/contracts/database-schema.md`
- **내용**:
  - ERD 다이어그램
  - 모든 테이블 구조 (9개 테이블)
  - 컬럼 타입, 제약조건, Foreign Keys
  - 인덱스 전략

#### 3. Mock Data 형식
- **파일**: `aidlc-docs/inception/contracts/mock-data-samples.json`
- **내용**:
  - 모든 API 응답 예시
  - SSE 이벤트 예시
  - Error 응답 예시

#### 4. TypeScript 타입 정의 (자동 생성 또는 수동)
- **파일**: `frontend/common-types/index.ts`
- **내용**: OpenAPI spec에서 TypeScript 타입 생성

### Day 0 Activities

**시간**: 1일 (8시간)

1. **Morning (4h)**: API 계약 정의
   - 모든 엔드포인트 명세
   - Request/Response 스키마
   - Developer 1이 주도, Developer 2, 3 검토

2. **Afternoon (4h)**: Database Schema + Mock Data
   - ERD 다이어그램 작성
   - Mock 데이터 샘플 작성
   - Developer 1이 주도, Developer 2, 3 검토

### Day 0 Deliverables

- [ ] API 계약 문서 (api-contract.yaml)
- [ ] Database Schema 문서 (database-schema.md)
- [ ] Mock Data 샘플 (mock-data-samples.json)
- [ ] TypeScript 타입 정의 (index.ts)

---

## Unit 1: Backend API & Database

### Purpose
데이터베이스 스키마, RESTful API 엔드포인트, 비즈니스 로직, 실시간 SSE 제공

### Responsibilities
1. SQLite 데이터베이스 스키마 생성 (9개 테이블)
2. FastAPI 애플리케이션 구조
3. 15개 API 엔드포인트 구현 (Day 0 계약 준수)
4. SSE 실시간 주문 스트림
5. JWT 인증 및 세션 관리
6. 비즈니스 로직 (주문, 테이블 세션, 메뉴 관리)
7. 시드 데이터 스크립트
8. 백엔드 단위 테스트

### Components (26개)
**API Layer (3)**:
- CustomerRouter
- AdminRouter
- MenuRouter

**Service Layer (4)**:
- AuthService
- OrderService
- TableService
- MenuService

**Repository Layer (5)**:
- OrderRepository
- TableRepository
- MenuRepository
- AdminRepository
- StoreRepository

**Model Layer (9)**:
- Store
- Table
- TableSession
- Admin
- MenuCategory
- Menu
- Order
- OrderItem
- OrderHistory

**Utility Layer (5)**:
- JWTUtil
- PasswordUtil
- SSEManager
- DatabaseSession
- SeedDataLoader

### User Stories
- TECH-001: 데이터베이스 및 시드 데이터 설정

### Technology Stack
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: SQLite
- **Migration**: Alembic
- **Authentication**: python-jose (JWT), bcrypt
- **Testing**: pytest

### Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration (from .env)
│   ├── database.py             # Database connection & session
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── store.py
│   │   ├── table.py
│   │   ├── admin.py
│   │   ├── menu.py
│   │   └── order.py
│   │
│   ├── repositories/           # Data access layer
│   │   ├── __init__.py
│   │   ├── order_repository.py
│   │   ├── table_repository.py
│   │   ├── menu_repository.py
│   │   ├── admin_repository.py
│   │   └── store_repository.py
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── order_service.py
│   │   ├── table_service.py
│   │   └── menu_service.py
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── customer.py
│   │   ├── admin.py
│   │   └── menu.py
│   │
│   ├── schemas/                # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── order.py
│   │   ├── table.py
│   │   └── menu.py
│   │
│   ├── utils/                  # Utility functions
│   │   ├── __init__.py
│   │   ├── jwt_util.py
│   │   ├── password_util.py
│   │   ├── sse_manager.py
│   │   └── seed_data.py
│   │
│   └── middleware/             # Middleware (auth, error handling)
│       ├── __init__.py
│       └── auth_middleware.py
│
├── tests/                      # Unit tests
│   ├── __init__.py
│   ├── test_services/
│   ├── test_repositories/
│   └── test_routers/
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Alembic configuration
└── README.md                   # Backend documentation
```

### 독립 개발 전략

1. **Day 0 계약 사용**: API 계약, Database Schema 사전 정의된 것 사용
2. **시드 데이터로 테스트**: Frontend 없이 시드 데이터로 모든 기능 테스트
3. **Postman/Curl로 API 테스트**: 독립적으로 API 검증
4. **FastAPI 자동 문서**: `/docs` 엔드포인트로 API 문서 제공

### Dependencies
- **Day 0 계약**: API 계약, Database Schema
- **No Frontend Dependency**: Frontend 없이 완전 독립 개발

### Deliverables
1. 작동하는 FastAPI 애플리케이션
2. SQLite 데이터베이스 (스키마 + 시드 데이터)
3. 15개 API 엔드포인트 (Day 0 계약 준수)
4. SSE 실시간 스트림
5. JWT 인증 미들웨어
6. 백엔드 단위 테스트
7. API 문서 (FastAPI 자동 생성)

### Success Criteria
- 모든 API 엔드포인트가 Day 0 계약대로 작동
- SSE 실시간 이벤트가 2초 이내 전송
- JWT 인증이 올바르게 작동 (16시간 세션)
- 단위 테스트 통과율 80% 이상
- Postman으로 모든 API 테스트 통과

**Duration**: 1-2주  
**Developer**: Developer 1  
**Parallel**: Developer 2, 3와 완전 병렬 개발

---

## Unit 2: Customer Frontend

### Purpose
고객이 테이블 태블릿에서 메뉴를 보고 주문하는 웹 UI 제공

### Responsibilities
1. React 애플리케이션 (고객용)
2. 자동 로그인 및 세션 관리
3. 메뉴 조회 및 카테고리 탐색
4. 장바구니 관리 (LocalStorage)
5. 주문 생성 및 내역 조회
6. 터치 친화적 UI
7. 고객 UI 단위 테스트

### Components (13개)
**Pages (4)**:
- CustomerApp
- MenuPage
- CartPage
- OrderHistoryPage

**Features (4)**:
- MenuCategoryList
- MenuCard
- CartItem
- OrderCard

**Common (5)**:
- Button
- Modal
- LoadingSpinner
- EmptyState
- (CustomerAppContext)

### User Stories (8개)
- CUS-001: 테이블 자동 로그인
- CUS-002: 메뉴 목록 조회
- CUS-003: 메뉴 카테고리 필터링
- CUS-004: 장바구니 담기
- CUS-005: 장바구니 수량 조정
- CUS-006: 주문 생성
- CUS-007: 주문 내역 조회
- CUS-008: 주문 상태 표시

### Technology Stack
- **Framework**: React 18+
- **Language**: JavaScript or TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: fetch API or axios
- **Storage**: LocalStorage API
- **Testing**: Jest, React Testing Library

### Directory Structure
```
frontend/
├── customer/                   # Customer app
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   │
│   │   ├── pages/              # Page components
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── OrderHistoryPage.tsx
│   │   │
│   │   ├── features/           # Feature-specific components
│   │   │   ├── menu/
│   │   │   │   ├── MenuCategoryList.tsx
│   │   │   │   └── MenuCard.tsx
│   │   │   ├── cart/
│   │   │   │   └── CartItem.tsx
│   │   │   └── orders/
│   │   │       └── OrderCard.tsx
│   │   │
│   │   ├── common/             # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── contexts/           # React Context
│   │   │   └── CustomerAppContext.tsx
│   │   │
│   │   ├── services/           # API client + Mock
│   │   │   ├── api.ts          # Real API client
│   │   │   └── mockApi.ts      # Mock API for development
│   │   │
│   │   ├── types/              # TypeScript types (from Day 0)
│   │   │   └── index.ts
│   │   │
│   │   └── styles/             # Global styles
│   │       └── index.css
│   │
│   ├── tests/                  # Unit tests
│   │   └── components/
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

### 독립 개발 전략

#### Mock API 구현

**파일**: `frontend/customer/src/services/mockApi.ts`

```typescript
// Mock API - Backend 없이 독립 개발
const MOCK_DELAY = 500 // Simulate network delay

export const mockApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await sleep(MOCK_DELAY)
    return {
      session_id: 'mock_session_123',
      table_info: {
        id: 'table_1',
        table_number: credentials.table_number,
        store_name: 'Mock Restaurant'
      }
    }
  },

  getMenus: async (params: MenuParams): Promise<MenuResponse> => {
    await sleep(MOCK_DELAY)
    return {
      menus: [
        { id: '1', name: 'Mock Pizza', price: 15000, category_id: '1', image_url: '/mock.jpg' },
        { id: '2', name: 'Mock Pasta', price: 12000, category_id: '1', image_url: '/mock.jpg' }
      ],
      categories: [
        { id: '1', name: 'Main Dishes' }
      ]
    }
  },

  createOrder: async (order: CreateOrderRequest): Promise<OrderResponse> => {
    await sleep(MOCK_DELAY)
    return {
      order_id: 'mock_order_' + Date.now(),
      order_number: Math.floor(Math.random() * 100),
      total_amount: order.items.reduce((sum, item) => sum + (item.quantity * 15000), 0)
    }
  },

  getOrders: async (sessionId: string): Promise<OrdersResponse> => {
    await sleep(MOCK_DELAY)
    return {
      orders: [
        { id: 'mock_order_1', order_number: 1, status: 'pending', total_amount: 15000, created_at: new Date().toISOString(), items: [] }
      ]
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
```

#### 개발 모드 전환

**파일**: `frontend/customer/src/services/api.ts`

```typescript
import { mockApi } from './mockApi'

// 환경 변수로 Mock vs Real API 전환
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export const api = USE_MOCK ? mockApi : {
  // Real API implementation
  login: async (credentials) => {
    const res = await fetch('http://localhost:8000/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return res.json()
  },
  // ... other endpoints
}
```

#### .env 설정

```
# Development (독립 개발)
VITE_USE_MOCK_API=true

# Production (통합 후)
VITE_USE_MOCK_API=false
```

### Dependencies
- **Day 0 계약**: API 계약, TypeScript 타입
- **No Backend Dependency**: Mock API로 완전 독립 개발

### Deliverables
1. 작동하는 React 애플리케이션 (고객용)
2. 8개 User Stories 구현
3. Mock API로 모든 기능 작동
4. 장바구니 LocalStorage 영속성
5. 주문 생성 플로우
6. 고객 UI 단위 테스트
7. 사용자 매뉴얼 (README)

### Success Criteria
- 모든 8개 User Stories가 Mock API로 작동
- 장바구니가 페이지 새로고침 시 유지
- 주문 생성이 2초 이내 완료 (Mock)
- 터치 친화적 UI (44x44px 최소 버튼)
- Backend 없이 완전 독립 실행 가능

**Duration**: 1-2주  
**Developer**: Developer 2  
**Parallel**: Developer 1, 3와 완전 병렬 개발

---

## Unit 3: Admin Frontend

### Purpose
관리자가 주문을 실시간으로 모니터링하고 테이블/메뉴를 관리하는 웹 UI 제공

### Responsibilities
1. React 애플리케이션 (관리자용)
2. 관리자 로그인 및 JWT 인증
3. 실시간 주문 대시보드 (SSE 수신)
4. 주문 상태 변경
5. 테이블 관리 (초기 설정, 주문 삭제, 세션 종료, 과거 내역)
6. 메뉴 관리 (CRUD)
7. 관리자 UI 단위 테스트

### Components (17개)
**Pages (5)**:
- AdminApp
- LoginPage
- DashboardPage
- TableManagementPage
- MenuManagementPage

**Features (7)**:
- TableCard
- OrderDetailModal
- TableSetupForm
- OrderHistoryModal
- MenuForm
- MenuList
- (SSE Connection Handler)

**Common (5)**:
- Button, Modal, LoadingSpinner, EmptyState (고객과 공유)
- (AdminAppContext)

### User Stories (11개)
- ADM-001: 관리자 로그인
- ADM-002: 실시간 주문 대시보드 (Epic)
  - ADM-002.1: SSE 연결 및 실시간 주문 수신
  - ADM-002.2: 주문 상태 변경
  - ADM-002.3: 주문 삭제
- ADM-003: 테이블 관리 (Epic)
  - ADM-003.1: 활성 테이블 목록 조회
  - ADM-003.2: 테이블별 주문 내역 조회
  - ADM-003.3: 테이블 세션 종료
- ADM-004: 메뉴 목록 조회
- ADM-005: 메뉴 등록
- ADM-006: 메뉴 수정
- ADM-007: 메뉴 삭제

### Technology Stack
- **Framework**: React 18+
- **Language**: JavaScript or TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: fetch API or axios
- **SSE Client**: EventSource API (native)
- **Testing**: Jest, React Testing Library

### Directory Structure
```
frontend/
├── admin/                      # Admin app
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   │
│   │   ├── pages/              # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TableManagementPage.tsx
│   │   │   └── MenuManagementPage.tsx
│   │   │
│   │   ├── features/           # Feature-specific components
│   │   │   ├── dashboard/
│   │   │   │   ├── TableCard.tsx
│   │   │   │   └── OrderDetailModal.tsx
│   │   │   ├── tables/
│   │   │   │   ├── TableSetupForm.tsx
│   │   │   │   └── OrderHistoryModal.tsx
│   │   │   └── menus/
│   │   │       ├── MenuForm.tsx
│   │   │       └── MenuList.tsx
│   │   │
│   │   ├── common/             # Shared with customer (copy)
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── contexts/           # React Context
│   │   │   └── AdminAppContext.tsx
│   │   │
│   │   ├── services/           # API client + Mock + SSE
│   │   │   ├── api.ts          # Real API client
│   │   │   ├── mockApi.ts      # Mock API for development
│   │   │   ├── sse.ts          # Real SSE client
│   │   │   └── mockSse.ts      # Mock SSE for development
│   │   │
│   │   ├── types/              # TypeScript types (from Day 0)
│   │   │   └── index.ts
│   │   │
│   │   └── styles/             # Global styles
│   │       └── index.css
│   │
│   ├── tests/                  # Unit tests
│   │   └── components/
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

### 독립 개발 전략

#### Mock API 구현

**파일**: `frontend/admin/src/services/mockApi.ts`

```typescript
// Mock API - Backend 없이 독립 개발
const MOCK_DELAY = 500

export const mockApi = {
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    await sleep(MOCK_DELAY)
    return {
      success: true,
      admin: {
        id: 'mock_admin_1',
        username: credentials.username,
        store_id: credentials.store_id
      }
    }
  },

  getOrders: async (storeId: string): Promise<OrdersResponse> => {
    await sleep(MOCK_DELAY)
    return {
      orders: [
        { id: 'mock_order_1', table_id: 'table_1', order_number: 1, status: 'pending', total_amount: 15000, created_at: new Date().toISOString(), items: [] }
      ]
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
    await sleep(MOCK_DELAY)
    return {
      order: { id: orderId, status, /* ... */ }
    }
  },

  deleteOrder: async (orderId: string): Promise<SuccessResponse> => {
    await sleep(MOCK_DELAY)
    return { success: true }
  },

  // ... other endpoints (tables, menus)
}
```

#### Mock SSE 구현

**파일**: `frontend/admin/src/services/mockSse.ts`

```typescript
// Mock SSE - Backend 없이 실시간 이벤트 시뮬레이션
export class MockSSE {
  private intervalId: number | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    // Simulate SSE events every 5 seconds
    this.intervalId = window.setInterval(() => {
      if (this.onmessage) {
        const mockEvent = {
          data: JSON.stringify({
            event: 'order.created',
            data: {
              order_id: 'mock_order_' + Date.now(),
              table_id: 'table_1',
              order_number: Math.floor(Math.random() * 100),
              status: 'pending',
              total_amount: 15000,
              items: []
            }
          })
        } as MessageEvent
        this.onmessage(mockEvent)
      }
    }, 5000)
  }

  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}
```

#### SSE 클라이언트

**파일**: `frontend/admin/src/services/sse.ts`

```typescript
import { MockSSE } from './mockSse'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export const createSSEConnection = (url: string) => {
  if (USE_MOCK) {
    return new MockSSE(url)
  } else {
    return new EventSource(url)
  }
}
```

### Dependencies
- **Day 0 계약**: API 계약, TypeScript 타입, SSE 이벤트 형식
- **No Backend Dependency**: Mock API + Mock SSE로 완전 독립 개발

### Deliverables
1. 작동하는 React 애플리케이션 (관리자용)
2. 11개 User Stories 구현
3. Mock API + Mock SSE로 모든 기능 작동
4. JWT 인증 (Mock Cookie)
5. 주문/테이블/메뉴 관리 기능
6. 관리자 UI 단위 테스트
7. 사용자 매뉴얼 (README)

### Success Criteria
- 모든 11개 User Stories가 Mock API로 작동
- Mock SSE 실시간 업데이트가 작동
- JWT 세션 Mock이 작동
- 주문/테이블/메뉴 CRUD Mock이 작동
- Backend 없이 완전 독립 실행 가능

**Duration**: 1-2주  
**Developer**: Developer 3  
**Parallel**: Developer 1, 2와 완전 병렬 개발

---

## 완전 독립 병렬 개발 타임라인

### Day 0 (모든 개발자)
- **Morning**: API 계약 정의 (api-contract.yaml)
- **Afternoon**: Database Schema + Mock Data (database-schema.md, mock-data-samples.json)
- **Output**: TypeScript 타입 생성 (index.ts)

**Deliverables**:
- [ ] API 계약 문서
- [ ] Database Schema 문서
- [ ] Mock Data 샘플
- [ ] TypeScript 타입 정의

---

### Week 1-2: 3명 완전 병렬 개발

**Developer 1 (Backend)**:
- [ ] FastAPI 애플리케이션 구조
- [ ] Database models & migrations
- [ ] 15개 API 엔드포인트 (Day 0 계약 준수)
- [ ] SSE implementation
- [ ] JWT authentication
- [ ] 시드 데이터 스크립트
- [ ] 단위 테스트
- [ ] Postman 테스트

**Developer 2 (Customer Frontend)**:
- [ ] React 프로젝트 초기화
- [ ] Mock API 구현
- [ ] 8개 User Stories 구현
- [ ] 장바구니 LocalStorage
- [ ] UI 컴포넌트 (13개)
- [ ] 단위 테스트
- [ ] Mock으로 완전 독립 실행

**Developer 3 (Admin Frontend)**:
- [ ] React 프로젝트 초기화
- [ ] Mock API + Mock SSE 구현
- [ ] 11개 User Stories 구현
- [ ] 실시간 대시보드 (Mock SSE)
- [ ] UI 컴포넌트 (17개)
- [ ] 단위 테스트
- [ ] Mock으로 완전 독립 실행

**Coordination**: 없음 (완전 독립, Day 0 계약만 준수)

---

### Week 3: 통합 & 테스트

**Phase 1: Backend 통합 (Day 1-2)**
- Developer 1: Backend 실행 및 API 테스트
- Developer 2, 3: Backend API 엔드포인트 확인

**Phase 2: Frontend 통합 (Day 3-5)**
- Developer 2: Customer Frontend Mock → Real API 전환
  - `.env` 변경: `VITE_USE_MOCK_API=false`
  - API 엔드포인트 URL 설정
  - 통합 테스트

- Developer 3: Admin Frontend Mock → Real API 전환
  - `.env` 변경: `VITE_USE_MOCK_API=false`
  - API + SSE 엔드포인트 URL 설정
  - 통합 테스트

**Phase 3: End-to-End 테스트 (Day 6-7)**
- Customer → Backend → Admin (주문 플로우)
- SSE 실시간 업데이트 검증
- Bug fixes

---

## Code Organization Strategy (Greenfield)

### Recommended Directory Structure
```
/home/ec2-user/environment/aidlc-table-order/
├── backend/                    # Unit 1
│   ├── app/
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # Units 2 & 3
│   ├── common-types/           # Shared TypeScript types (from Day 0)
│   │   └── index.ts
│   │
│   ├── customer/               # Unit 2
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   └── mockApi.ts  # Mock API
│   │   │   └── ...
│   │   ├── tests/
│   │   ├── .env.example        # VITE_USE_MOCK_API=true
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── admin/                  # Unit 3
│       ├── src/
│       │   ├── services/
│       │   │   ├── api.ts
│       │   │   ├── mockApi.ts  # Mock API
│       │   │   ├── sse.ts
│       │   │   └── mockSse.ts  # Mock SSE
│       │   └── ...
│       ├── tests/
│       ├── .env.example        # VITE_USE_MOCK_API=true
│       ├── package.json
│       └── README.md
│
├── aidlc-docs/
│   ├── inception/
│   │   ├── contracts/          # Day 0 계약 (NEW)
│   │   │   ├── api-contract.yaml
│   │   │   ├── database-schema.md
│   │   │   └── mock-data-samples.json
│   │   └── ...
│   └── ...
│
├── .env                        # Environment variables
├── .gitignore
└── README.md                   # Project overview
```

---

## Unit Summary

| Aspect | Unit 1 (Backend) | Unit 2 (Customer) | Unit 3 (Admin) |
|---|---|---|---|
| **Priority** | 1 | 1 | 1 |
| **Duration** | 1-2주 | 1-2주 | 1-2주 |
| **Components** | 26 | 13 | 17 |
| **Stories** | 1 | 8 | 11 |
| **Dependencies** | Day 0 계약 | Day 0 계약 | Day 0 계약 |
| **Parallel** | Developer 2, 3 | Developer 1, 3 | Developer 1, 2 |
| **Developer** | Developer 1 | Developer 2 | Developer 3 |
| **Technology** | Python/FastAPI | React + Mock API | React + Mock API + Mock SSE |
| **Independence** | 시드 데이터로 독립 | Mock API로 독립 | Mock API + Mock SSE로 독립 |
| **Integration** | Week 3 | Week 3 (Mock→Real) | Week 3 (Mock→Real) |

**Total**: 3 Units, 56 Components, 20 Stories, 2-3주 예상 (병렬 + 통합)
