# Application Design - Consolidated

테이블오더 서비스의 전체 애플리케이션 설계를 통합한 문서입니다.

---

## Table of Contents

1. [Design Overview](#design-overview)
2. [Architecture Style](#architecture-style)
3. [Component Summary](#component-summary)
4. [Service Layer Summary](#service-layer-summary)
5. [Communication Patterns](#communication-patterns)
6. [Technology Stack](#technology-stack)
7. [Design Decisions](#design-decisions)
8. [Next Steps](#next-steps)

---

## Design Overview

### Project Structure

```
테이블오더 서비스
├── Customer Frontend (고객용 웹 UI)
│   ├── Pages: MenuPage, CartPage, OrderHistoryPage
│   ├── Features: Menu components, Cart components, Order components
│   └── Common: Button, Modal, Loading, EmptyState
│
├── Admin Frontend (관리자용 웹 UI)
│   ├── Pages: LoginPage, DashboardPage, TableManagementPage, MenuManagementPage
│   ├── Features: Dashboard components, Table components, Menu components
│   └── Common: Shared with Customer
│
└── Backend API (FastAPI)
    ├── API Layer: CustomerRouter, AdminRouter, MenuRouter
    ├── Service Layer: AuthService, OrderService, TableService, MenuService
    ├── Repository Layer: OrderRepository, TableRepository, MenuRepository, AdminRepository, StoreRepository
    ├── Model Layer: 9 SQLAlchemy models
    └── Utility Layer: JWTUtil, PasswordUtil, SSEManager, DatabaseSession, SeedDataLoader
```

### Component Count

| Layer | Component Type | Count |
|---|---|---|
| **Frontend** | Customer Components | 13 |
| | Admin Components | 17 |
| **Backend** | API Routers | 3 |
| | Services | 4 |
| | Repositories | 5 |
| | Data Models | 9 |
| | Utilities | 5 |
| **Total** | | **56 components** |

---

## Architecture Style

### Backend: Layered Architecture

```
┌─────────────────────────────────────────┐
│         API Layer (Routers)             │  ← HTTP requests
│  CustomerRouter, AdminRouter, MenuRouter│
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Service Layer                    │  ← Business logic
│  AuthService, OrderService,              │    & Orchestration
│  TableService, MenuService               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Repository Layer (Data Access)      │  ← Database queries
│  OrderRepository, TableRepository,       │
│  MenuRepository, AdminRepository,        │
│  StoreRepository                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Database (SQLite)                │  ← Data storage
│  9 tables: Store, Table, TableSession,  │
│  Admin, MenuCategory, Menu, Order,      │
│  OrderItem, OrderHistory                 │
└─────────────────────────────────────────┘

Utilities (Cross-cutting):
  JWTUtil, PasswordUtil, SSEManager, DatabaseSession
```

### Frontend: Hybrid Component Organization

**Customer Frontend**:
```
src/
├── pages/                     # Page components
│   ├── MenuPage.tsx
│   ├── CartPage.tsx
│   └── OrderHistoryPage.tsx
├── features/                  # Feature-specific components
│   ├── menu/
│   │   ├── MenuCategoryList.tsx
│   │   └── MenuCard.tsx
│   ├── cart/
│   │   └── CartItem.tsx
│   └── orders/
│       └── OrderCard.tsx
├── common/                    # Shared/reusable components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
├── contexts/                  # React Context (state management)
│   └── CustomerAppContext.tsx
└── services/                  # API client functions
    └── api.ts
```

**Admin Frontend**:
```
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TableManagementPage.tsx
│   └── MenuManagementPage.tsx
├── features/
│   ├── dashboard/
│   │   ├── TableCard.tsx
│   │   └── OrderDetailModal.tsx
│   ├── tables/
│   │   ├── TableSetupForm.tsx
│   │   └── OrderHistoryModal.tsx
│   └── menus/
│       ├── MenuForm.tsx
│       └── MenuList.tsx
├── common/                    # Same as Customer
├── contexts/
│   └── AdminAppContext.tsx
└── services/
    └── api.ts
```

---

## Component Summary

### Customer Frontend Components (13)

**Pages (4)**:
1. CustomerApp - 루트 컴포넌트
2. MenuPage - 메뉴 조회 화면
3. CartPage - 장바구니 화면
4. OrderHistoryPage - 주문 내역 화면

**Features (4)**:
5. MenuCategoryList - 카테고리 목록
6. MenuCard - 메뉴 카드
7. CartItem - 장바구니 아이템
8. OrderCard - 주문 카드

**Common (5)**:
9. Button - 재사용 버튼
10. Modal - 모달 다이얼로그
11. LoadingSpinner - 로딩 인디케이터
12. EmptyState - 빈 상태 표시
13. (Context: CustomerAppContext)

---

### Admin Frontend Components (17)

**Pages (5)**:
1. AdminApp - 루트 컴포넌트
2. LoginPage - 로그인 화면
3. DashboardPage - 실시간 주문 대시보드
4. TableManagementPage - 테이블 관리 화면
5. MenuManagementPage - 메뉴 관리 화면

**Features (7)**:
6. TableCard - 대시보드 테이블 카드
7. OrderDetailModal - 주문 상세 모달
8. TableSetupForm - 테이블 초기 설정 폼
9. OrderHistoryModal - 과거 주문 내역 모달
10. MenuForm - 메뉴 등록/수정 폼
11. MenuList - 메뉴 목록
12. (SSE Connection Handler)

**Common (5)**: Customer와 동일 공통 컴포넌트 사용
13-17. Button, Modal, LoadingSpinner, EmptyState, (Context: AdminAppContext)

---

### Backend API Components (3 Routers)

**CustomerRouter**:
- POST /api/customer/login - 테이블 로그인
- GET /api/customer/menus - 메뉴 조회
- POST /api/customer/orders - 주문 생성
- GET /api/customer/orders - 주문 내역 조회

**AdminRouter**:
- POST /api/admin/login - 관리자 로그인
- GET /api/admin/orders/stream - SSE 실시간 주문 스트림
- GET /api/admin/orders - 주문 목록 조회
- PATCH /api/admin/orders/{order_id}/status - 주문 상태 변경
- DELETE /api/admin/orders/{order_id} - 주문 삭제
- POST /api/admin/tables/{table_id}/complete - 테이블 세션 종료
- GET /api/admin/orders/history - 과거 주문 내역

**MenuRouter**:
- GET /api/admin/menus - 메뉴 목록 조회
- POST /api/admin/menus - 메뉴 등록
- PUT /api/admin/menus/{menu_id} - 메뉴 수정
- DELETE /api/admin/menus/{menu_id} - 메뉴 삭제

**Total API Endpoints**: 15

---

## Service Layer Summary

### AuthService
**책임**: 인증 및 권한 관리  
**주요 메서드**:
- login_table() - 테이블 로그인
- login_admin() - 관리자 로그인
- create_jwt_token() - JWT 토큰 생성
- verify_jwt_token() - JWT 토큰 검증

**의존성**: AdminRepository, TableRepository, JWTUtil, PasswordUtil

---

### OrderService
**책임**: 주문 비즈니스 로직 및 실시간 이벤트 관리  
**주요 메서드**:
- create_order() - 주문 생성 및 검증
- get_orders_by_session() - 세션별 주문 조회
- get_orders_by_store() - 매장별 주문 조회
- update_order_status() - 주문 상태 변경
- delete_order() - 주문 삭제
- broadcast_order_event() - SSE 이벤트 전송
- archive_orders() - 주문 이력 아카이빙

**의존성**: OrderRepository, MenuRepository, TableRepository, SSEManager

**핵심 역할**: 
- 주문 생성 시 메뉴 검증 및 가격 계산
- 주문 생성/변경 시 SSE로 관리자에게 실시간 알림
- 세션 종료 시 주문 이력 아카이빙

---

### TableService
**책임**: 테이블 및 세션 관리  
**주요 메서드**:
- create_table_session() - 세션 생성
- complete_table_session() - 세션 종료 (이용 완료)
- get_table_status() - 테이블 상태 조회
- get_table_order_summary() - 테이블별 주문 집계

**의존성**: TableRepository, OrderService

**핵심 역할**:
- 테이블 세션 라이프사이클 관리
- 세션 종료 시 OrderService에 아카이빙 위임

---

### MenuService
**책임**: 메뉴 관리 비즈니스 로직  
**주요 메서드**:
- get_menus_by_category() - 카테고리별 메뉴 조회
- create_menu() - 메뉴 생성 및 검증
- update_menu() - 메뉴 수정
- delete_menu() - 메뉴 삭제
- validate_menu_data() - 메뉴 데이터 유효성 검증

**의존성**: MenuRepository

---

## Communication Patterns

### 1. HTTP Request/Response (Standard REST API)
**사용처**: 대부분의 API 엔드포인트  
**프로토콜**: HTTP/HTTPS  
**데이터 형식**: JSON  

**예시**: 메뉴 조회
```
Customer Frontend → HTTP GET /api/customer/menus → Backend → JSON Response
```

---

### 2. Server-Sent Events (SSE) - Real-time Updates
**사용처**: 관리자 대시보드 실시간 주문 업데이트  
**프로토콜**: HTTP (persistent connection)  
**방향**: Server → Client (단방향)

**플로우**:
```
Admin Frontend → EventSource('/api/admin/orders/stream') → Backend
Backend → SSE events → Admin Frontend (실시간 주문 수신)
```

**이벤트 타입**:
- `order.created` - 새 주문 생성
- `order.status_changed` - 주문 상태 변경
- `order.deleted` - 주문 삭제

---

### 3. LocalStorage Persistence (Client-side)
**사용처**: 고객 장바구니 데이터  
**저장소**: Browser LocalStorage  
**동기화**: React Context ↔ LocalStorage

**플로우**:
```
User adds to cart → Context updates → Save to LocalStorage
Page refresh → Load from LocalStorage → Restore cart state
```

---

### 4. JWT Authentication (HTTP-only Cookie)
**사용처**: 관리자 인증  
**저장소**: HTTP-only Cookie (XSS 방지)  
**토큰 수명**: 16시간

**플로우**:
```
Admin Login → Backend generates JWT → Set HTTP-only Cookie
Subsequent requests → Browser auto-sends Cookie → Backend validates JWT
```

---

### 5. Context API State Management (Frontend)
**사용처**: Frontend 전역 상태  
**구현**: React Context API

**Customer Context**:
- tableSessionState (세션 정보)
- cartState (장바구니)
- orderHistoryState (주문 내역)

**Admin Context**:
- authState (인증 정보)
- ordersState (실시간 주문 목록)
- tablesState (테이블 상태)
- menusState (메뉴 목록)

---

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript (권장) 또는 JavaScript
- **Build Tool**: Vite 또는 Create React App
- **State Management**: React Context API
- **HTTP Client**: fetch API 또는 axios
- **SSE Client**: EventSource API (native)
- **Storage**: LocalStorage API (native)

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Async**: asyncio, async/await
- **ORM**: SQLAlchemy
- **Database**: SQLite
- **Migration**: Alembic
- **Authentication**: JWT (python-jose)
- **Password**: bcrypt
- **CORS**: FastAPI CORS middleware

### Database
- **Type**: SQLite (file-based)
- **Schema**: 9 tables
- **ORM**: SQLAlchemy models

### Development Tools
- **Seed Data**: Python script
- **Environment**: .env file (python-dotenv)
- **Testing**: pytest (backend), Jest/React Testing Library (frontend)

---

## Design Decisions

### Decision 1: Layered Architecture for Backend
**Rationale**: 
- 명확한 책임 분리 (API ← Service ← Repository ← Database)
- 테스트 용이성 (각 레이어 독립적 테스트)
- 유지보수성 (변경 사항의 영향 범위 제한)

**Trade-off**: 
- 단순한 CRUD는 오버헤드 발생
- MVP에는 충분히 적합

---

### Decision 2: React Context for State Management
**Rationale**:
- Redux/Zustand보다 단순 (MVP에 적합)
- React 내장 기능 (추가 라이브러리 불필요)
- 작은 규모 앱에 충분

**Trade-off**:
- 대규모 앱에서는 성능 이슈 가능
- 현재 MVP 범위에는 적합

---

### Decision 3: Server-Sent Events (SSE) for Real-time
**Rationale**:
- 단방향 통신만 필요 (서버 → 클라이언트)
- WebSocket보다 단순한 구현
- 브라우저 네이티브 지원 (EventSource)
- FastAPI에서 쉽게 구현 가능

**Trade-off**:
- 양방향 통신 불가 (필요 없음)
- 재연결 로직 필요 (자동 재연결)

---

### Decision 4: SQLite for Database
**Rationale**:
- 로컬 개발에 최적
- 설정 없이 바로 사용 가능
- 파일 기반으로 간단한 백업
- MVP에 충분한 성능

**Trade-off**:
- 동시성 제한 (최대 50 테이블로 충분)
- 프로덕션에서는 PostgreSQL/MySQL 고려 필요

---

### Decision 5: HTTP-only Cookie for JWT
**Rationale**:
- XSS 공격 방지 (JavaScript 접근 불가)
- 브라우저 자동 전송
- CSRF 방어 (SameSite 설정)

**Trade-off**:
- LocalStorage보다 구현 복잡
- 보안 우선 선택

---

## Design Patterns Used

1. **Repository Pattern**: 데이터 접근 로직 분리
2. **Service Layer Pattern**: 비즈니스 로직 캡슐화
3. **Dependency Injection**: 서비스 간 의존성 관리
4. **Observer Pattern**: SSE 실시간 이벤트
5. **Context Provider Pattern**: React 상태 관리
6. **Transaction Script**: 서비스 메서드 트랜잭션 관리

---

## Next Steps

이 Application Design을 기반으로 다음 단계를 진행합니다:

1. **Units Generation**: 개발 단위(유닛) 분해 및 의존성 정의
   - Unit 1: Backend (Database + API)
   - Unit 2: Customer Frontend
   - Unit 3: Admin Frontend

2. **Functional Design** (per-unit): 상세 비즈니스 로직 설계
   - 데이터 모델 상세 스키마
   - 비즈니스 규칙 정의
   - 상태 머신 및 엣지 케이스

3. **NFR Design** (per-unit): 비기능 요구사항 구현 패턴
   - SSE 구현 패턴
   - JWT 인증 플로우
   - 성능 최적화 전략

4. **Code Generation** (per-unit): 실제 코드 구현
   - Backend: FastAPI, SQLAlchemy models, Services, Repositories
   - Frontend: React components, Context, API clients

5. **Build and Test**: 통합 및 검증
   - 전체 시스템 빌드
   - 통합 테스트
   - SSE End-to-End 테스트

---

## Design Approval Checklist

- [x] 컴포넌트 식별 완료 (56개 컴포넌트)
- [x] 컴포넌트 메서드 정의 완료 (~185개 메서드)
- [x] 서비스 레이어 설계 완료 (4개 서비스)
- [x] 컴포넌트 의존성 매핑 완료
- [x] 통신 패턴 정의 완료 (5가지 패턴)
- [x] 아키텍처 스타일 결정 완료
- [x] 기술 스택 확정 완료
- [x] 설계 결정 문서화 완료

**Application Design Ready for Approval** ✓

---

## Related Documents

- **Component Details**: `components.md`
- **Method Signatures**: `component-methods.md`
- **Service Layer**: `services.md`
- **Dependencies & Communication**: `component-dependency.md`
- **Requirements**: `../requirements/requirements.md`
- **User Stories**: `../user-stories/stories.md`
- **Execution Plan**: `../plans/execution-plan.md`
