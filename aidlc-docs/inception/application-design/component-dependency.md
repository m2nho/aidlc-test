# Component Dependencies and Communication Patterns

컴포넌트 간 의존성 관계 및 통신 패턴을 정의합니다.

---

## Dependency Overview

### High-Level Architecture

```
[Customer Frontend] <---HTTP--->  [Backend API]  <---HTTP---> [Admin Frontend]
                                        |
                                   [Services]
                                        |
                                  [Repositories]
                                        |
                                   [Database]
                       
[Admin Frontend] <---SSE--- [Backend API (SSE Endpoint)]
```

---

## Frontend Dependencies

### Customer Frontend

#### External Dependencies (Backend APIs)
- **AuthService API**: POST /api/customer/login
- **MenuService API**: GET /api/customer/menus
- **OrderService API**: 
  - POST /api/customer/orders (주문 생성)
  - GET /api/customer/orders (주문 내역)

#### Internal Dependencies
```
MenuPage
  └─> MenuCategoryList (카테고리 목록)
  └─> MenuCard (메뉴 카드)
      └─> Modal (메뉴 상세)
  └─> Button (공통 버튼)

CartPage
  └─> CartItem (장바구니 아이템)
      └─> Button (수량 조절)
  └─> Button (주문하기)
  └─> Modal (주문 확인)

OrderHistoryPage
  └─> OrderCard (주문 카드)
  └─> EmptyState (주문 없음)
```

#### State Management
```
CustomerAppContext (React Context)
  ├─> tableSessionState (세션 정보)
  ├─> cartState (장바구니 LocalStorage 동기화)
  └─> orderHistoryState (주문 내역)
```

---

### Admin Frontend

#### External Dependencies (Backend APIs)
- **AuthService API**: POST /api/admin/login
- **OrderService API**: 
  - GET /api/admin/orders/stream (SSE)
  - GET /api/admin/orders
  - PATCH /api/admin/orders/{order_id}/status
  - DELETE /api/admin/orders/{order_id}
  - GET /api/admin/orders/history
- **TableService API**:
  - POST /api/admin/tables/{table_id}/complete
- **MenuService API**:
  - GET /api/admin/menus
  - POST /api/admin/menus
  - PUT /api/admin/menus/{menu_id}
  - DELETE /api/admin/menus/{menu_id}

#### Internal Dependencies
```
DashboardPage
  └─> SSE Connection (EventSource)
  └─> TableCard[] (테이블 카드 배열)
      └─> OrderDetailModal (주문 상세)
          └─> Button (상태 변경, 삭제)

TableManagementPage
  └─> TableSetupForm (초기 설정)
  └─> OrderDetailModal (주문 상세)
  └─> OrderHistoryModal (과거 내역)

MenuManagementPage
  └─> MenuList (메뉴 목록)
  └─> MenuForm (메뉴 등록/수정)
      └─> Modal
```

#### State Management
```
AdminAppContext (React Context)
  ├─> authState (인증 토큰)
  ├─> ordersState (실시간 주문 목록)
  ├─> tablesState (테이블 상태)
  └─> menusState (메뉴 목록)
```

---

## Backend Dependencies

### API Router → Service → Repository → Database

#### Customer Router Dependencies
```
CustomerRouter
  ├─> AuthService.login_table()
  │     └─> TableRepository.get_by_table_number()
  │     └─> JWTUtil.encode_token()
  │
  ├─> MenuService.get_menus_by_category()
  │     └─> MenuRepository.get_by_category()
  │
  ├─> OrderService.create_order()
  │     └─> TableRepository.get_active_session()
  │     └─> MenuRepository.get_by_id() (각 메뉴 검증)
  │     └─> OrderRepository.create()
  │     └─> OrderRepository.create_order_items()
  │     └─> SSEManager.broadcast()
  │
  └─> OrderService.get_orders_by_session()
        └─> OrderRepository.get_by_session()
```

#### Admin Router Dependencies
```
AdminRouter
  ├─> AuthService.login_admin()
  │     └─> AdminRepository.get_by_username()
  │     └─> PasswordUtil.verify_password()
  │     └─> JWTUtil.encode_token()
  │
  ├─> SSE Endpoint (Generator Function)
  │     └─> SSEManager.add_connection()
  │     └─> Queue (per-client message queue)
  │     └─> SSEManager.remove_connection() (on disconnect)
  │
  ├─> OrderService.get_orders_by_store()
  │     └─> OrderRepository.get_by_store()
  │
  ├─> OrderService.update_order_status()
  │     └─> OrderRepository.get_by_id()
  │     └─> OrderRepository.update()
  │     └─> SSEManager.broadcast()
  │
  ├─> OrderService.delete_order()
  │     └─> OrderRepository.delete()
  │     └─> SSEManager.broadcast()
  │
  ├─> TableService.complete_table_session()
  │     └─> TableRepository.get_active_session()
  │     └─> OrderService.archive_orders()
  │           └─> OrderRepository.get_by_session()
  │           └─> OrderRepository.archive_orders_to_history()
  │     └─> TableRepository.complete_session()
  │
  └─> OrderService.get_order_history()
        └─> OrderRepository.get_order_history()
```

#### Menu Router Dependencies
```
MenuRouter
  ├─> MenuService.get_menus_by_category()
  │     └─> MenuRepository.get_by_store()
  │
  ├─> MenuService.create_menu()
  │     └─> MenuService.validate_menu_data()
  │     └─> MenuRepository.create()
  │
  ├─> MenuService.update_menu()
  │     └─> MenuRepository.get_by_id()
  │     └─> MenuService.validate_menu_data()
  │     └─> MenuRepository.update()
  │
  └─> MenuService.delete_menu()
        └─> MenuRepository.delete()
```

---

## Dependency Matrix

### Service Dependencies

| Service | Depends On | Purpose |
|---|---|---|
| AuthService | AdminRepository | 관리자 조회 |
| | TableRepository | 테이블 조회 |
| | JWTUtil | JWT 토큰 처리 |
| | PasswordUtil | 비밀번호 검증 |
| OrderService | OrderRepository | 주문 데이터 접근 |
| | MenuRepository | 메뉴 검증 |
| | TableRepository | 세션 검증 |
| | SSEManager | 실시간 이벤트 |
| TableService | TableRepository | 테이블/세션 접근 |
| | OrderService | 주문 아카이빙 위임 |
| MenuService | MenuRepository | 메뉴 데이터 접근 |

### Repository Dependencies

| Repository | Depends On | Purpose |
|---|---|---|
| OrderRepository | Database (SQLAlchemy) | 주문 데이터 접근 |
| TableRepository | Database (SQLAlchemy) | 테이블 데이터 접근 |
| MenuRepository | Database (SQLAlchemy) | 메뉴 데이터 접근 |
| AdminRepository | Database (SQLAlchemy) | 관리자 데이터 접근 |
| StoreRepository | Database (SQLAlchemy) | 매장 데이터 접근 |

---

## Communication Patterns

### Pattern 1: HTTP Request/Response (Customer ↔ Backend)

**메뉴 조회 플로우**:
```
[Customer Frontend]
  |
  | HTTP GET /api/customer/menus?store_id=store123&category_id=cat1
  |
  v
[Backend - CustomerRouter]
  |
  | Call MenuService.get_menus_by_category(store123, cat1)
  |
  v
[MenuService]
  |
  | Call MenuRepository.get_by_category(cat1)
  |
  v
[MenuRepository]
  |
  | SQL Query: SELECT * FROM menus WHERE category_id='cat1'
  |
  v
[Database]
  |
  | Return List[Menu]
  |
  v
[Backend]
  |
  | JSON Response: {menus: [...]}
  |
  v
[Customer Frontend]
  |
  | Update UI with menu list
```

---

### Pattern 2: HTTP POST with Validation (Customer → Backend)

**주문 생성 플로우**:
```
[Customer Frontend]
  |
  | HTTP POST /api/customer/orders
  | Body: {table_id, session_id, items: [{menu_id, quantity}, ...]}
  |
  v
[Backend - CustomerRouter]
  |
  | Extract request body
  | Call OrderService.create_order(table_id, session_id, items)
  |
  v
[OrderService]
  |
  | Start Transaction
  | 1. Validate session (TableRepository)
  | 2. Validate menu IDs and prices (MenuRepository)
  | 3. Calculate total amount
  | 4. Create order (OrderRepository)
  | 5. Create order items (OrderRepository)
  | 6. Commit Transaction
  | 7. Broadcast SSE event (SSEManager)
  |
  v
[Database]
  |
  | Insert order & order_items
  |
  v
[SSEManager]
  |
  | Broadcast to all admin clients: {event: "order.created", data: {...}}
  |
  v
[Backend]
  |
  | JSON Response: {order_id, order_number, total_amount}
  |
  v
[Customer Frontend]
  |
  | Show success message & redirect
```

---

### Pattern 3: Server-Sent Events (Backend → Admin Frontend)

**실시간 주문 업데이트**:
```
[Admin Frontend - DashboardPage]
  |
  | EventSource: new EventSource('/api/admin/orders/stream?store_id=store123')
  | onmessage handler registered
  |
  v
[Backend - SSE Endpoint]
  |
  | Create Queue for this client
  | SSEManager.add_connection(store123, queue)
  | Generator function: yield messages from queue
  |
  v
[SSE Connection Established]
  |
  | Keep-alive (every 30s): heartbeat message
  |
  v
[When Order Created]
  |
[OrderService]
  |
  | After order creation, call:
  | SSEManager.broadcast(store123, {event: "order.created", data: order})
  |
  v
[SSEManager]
  |
  | Find all queues for store123
  | Put message in each queue
  |
  v
[SSE Endpoint Generator]
  |
  | Read from queue
  | Format as SSE: "event: order.created\ndata: {...}\n\n"
  | Yield to client
  |
  v
[Admin Frontend]
  |
  | EventSource.onmessage(event)
  | Parse event.data
  | Update ordersState
  | Re-render UI with new order (highlighted)
```

---

### Pattern 4: State Management with LocalStorage (Customer Frontend)

**장바구니 동기화**:
```
[MenuPage]
  |
  | User clicks "Add to Cart" on MenuCard
  | handleAddToCart(menuId, quantity)
  |
  v
[CustomerAppContext]
  |
  | cartState update function
  | 1. Get current cart from state
  | 2. Add/update item in cart
  | 3. Save to LocalStorage: localStorage.setItem('cart', JSON.stringify(cart))
  | 4. Update React state
  |
  v
[CartPage]
  |
  | useEffect: Load cart from LocalStorage on mount
  | localStorage.getItem('cart')
  | If exists, parse and set to state
  |
  v
[User refreshes page]
  |
  | CustomerApp loads
  | Context Provider initializes
  | cartState = JSON.parse(localStorage.getItem('cart')) || []
  | Cart persists across refresh
```

---

### Pattern 5: JWT Authentication Flow

**관리자 인증 플로우**:
```
[Admin Frontend - LoginPage]
  |
  | HTTP POST /api/admin/login
  | Body: {store_id, username, password}
  |
  v
[Backend - AdminRouter]
  |
  | Call AuthService.login_admin(store_id, username, password)
  |
  v
[AuthService]
  |
  | 1. AdminRepository.get_by_username(store_id, username)
  | 2. Verify admin exists
  | 3. PasswordUtil.verify_password(plain, hashed)
  | 4. Generate JWT token (expires in 16h)
  |    payload = {admin_id, store_id, exp: 16h}
  | 5. Return token
  |
  v
[Backend]
  |
  | Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict
  | JSON Response: {success: true, admin: {...}}
  |
  v
[Admin Frontend]
  |
  | Cookie stored by browser (HttpOnly)
  | Update authState: {isAuthenticated: true, admin: {...}}
  | Redirect to /dashboard
  |
  v
[Subsequent Requests]
  |
  | Browser automatically sends Cookie with each request
  |
  v
[Backend Middleware]
  |
  | Extract token from Cookie
  | JWTUtil.verify_token(token)
  | If valid, attach admin_id to request context
  | If invalid/expired, return 401 Unauthorized
```

---

## Data Flow Diagrams

### Order Creation Data Flow

```
Customer Cart
    |
    | Items: [{menuId, quantity}, ...]
    v
Customer Frontend (CartPage)
    |
    | HTTP POST /api/customer/orders
    | Body: {table_id, session_id, items}
    v
Backend API (CustomerRouter)
    |
    v
OrderService
    |
    +---> MenuRepository: Validate each menu_id
    |
    +---> TableRepository: Validate session_id
    |
    +---> Calculate total_amount
    |
    v
OrderRepository
    |
    +---> Insert Order (order_id, table_id, session_id, total_amount, status)
    |
    +---> Insert OrderItems[] (order_id, menu_id, quantity, unit_price)
    |
    v
Database (SQLite)
    |
    | Transaction Commit
    v
SSEManager
    |
    | Broadcast: {event: "order.created", order: {...}}
    v
Admin Frontend (DashboardPage)
    |
    | EventSource receives event
    | Update ordersState
    | Highlight new order in UI
```

### Table Session Lifecycle

```
Initial State: Table (current_session_id = NULL)
    |
    | Customer sits down
    | Tablet auto-login
    v
AuthService.login_table()
    |
    | Check if current_session_id exists
    | If NULL, create new session
    v
TableService.create_table_session()
    |
    | Insert TableSession (table_id, started_at, is_active=True)
    | Update Table.current_session_id = new_session_id
    v
Active Session State
    |
    | Customer orders multiple times
    | All orders have same session_id
    v
[Customer finishes meal]
    |
    | Admin clicks "Complete Session"
    v
TableService.complete_table_session()
    |
    +---> OrderService.archive_orders(session_id)
    |       |
    |       | Copy all orders to OrderHistory
    |       | Delete original orders
    |
    +---> TableRepository.complete_session()
            |
            | Update TableSession: completed_at = NOW(), is_active = False
            | Update Table: current_session_id = NULL
            v
Clean State: Table ready for next customer
```

---

## Dependency Graph (Simplified)

```
Frontend Layer:
  Customer UI ----HTTP----> Backend API
  Admin UI ------HTTP----> Backend API
  Admin UI <-----SSE------ Backend API

Service Layer:
  AuthService --> AdminRepository, TableRepository, JWTUtil, PasswordUtil
  OrderService --> OrderRepository, MenuRepository, TableRepository, SSEManager
  TableService --> TableRepository, OrderService
  MenuService --> MenuRepository

Repository Layer:
  All Repositories --> Database (SQLAlchemy)

Utility Layer:
  JWTUtil (standalone)
  PasswordUtil (standalone)
  SSEManager (maintains client connections)
  DatabaseSession (manages DB sessions)
  SeedDataLoader --> All Repositories
```

---

## Critical Dependencies

### Must Be Available First
1. **Database**: All repositories depend on it
2. **JWTUtil & PasswordUtil**: AuthService depends on them
3. **SSEManager**: OrderService depends on it for real-time events

### Initialization Order
1. Database connection & schema
2. Seed data (Store, Tables, Admin, Categories, Menus)
3. Utility instances (JWTUtil, PasswordUtil, SSEManager, DatabaseSession)
4. Repository instances
5. Service instances (inject dependencies)
6. API Routers (inject services)
7. FastAPI app (register routers)

---

## Circular Dependency Avoidance

**Potential Circular Dependency**:
- TableService → OrderService (for archiving)
- OrderService → TableRepository (for session validation)

**Solution**: 
- TableService calls OrderService (high-level calls low-level)
- OrderService doesn't call TableService
- OrderService only uses TableRepository (repository layer, not service layer)
- **No circular dependency**

---

## Summary

- **Total Communication Patterns**: 5
- **Primary Protocols**: HTTP, SSE
- **State Management**: React Context + LocalStorage
- **Authentication**: JWT + HTTP-only Cookie
- **Real-time**: Server-Sent Events
- **Transaction Scope**: Service Layer
- **Dependency Injection**: Services → Repositories → Database

**Key Integration Points**:
1. Customer Frontend ↔ Backend API (HTTP)
2. Admin Frontend ↔ Backend API (HTTP + SSE)
3. Service Layer ↔ Repository Layer (Direct calls)
4. SSEManager ↔ Connected Clients (Event streaming)
