# Business Logic Model - Unit 1: Backend

Backend의 4개 서비스 레이어의 비즈니스 로직 플로우를 상세 설계합니다.

---

## Service Architecture

```
┌─────────────────────────────────────────┐
│         FastAPI Router Layer            │
│  (CustomerRouter, AdminRouter, etc.)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Service Layer                  │
│  ┌─────────────────────────────────┐   │
│  │       AuthService               │   │
│  │  - Customer Login               │   │
│  │  - Admin Login                  │   │
│  │  - JWT Generation/Validation    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       OrderService              │   │
│  │  - Create Order                 │   │
│  │  - Update Status                │   │
│  │  - Delete Order                 │   │
│  │  - Query Orders                 │   │
│  │  - Archive Orders               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       TableService              │   │
│  │  - Get/Create Session           │   │
│  │  - Complete Session             │   │
│  │  - Get Active Tables            │   │
│  │  - Get Table History            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       MenuService               │   │
│  │  - Create Menu                  │   │
│  │  - Update Menu                  │   │
│  │  - Delete Menu                  │   │
│  │  - Query Menus                  │   │
│  └─────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        Repository Layer                 │
│  (OrderRepository, TableRepository,     │
│   MenuRepository, AdminRepository,      │
│   StoreRepository)                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Database (SQLite)              │
└─────────────────────────────────────────┘
```

---

## 1. AuthService

### Purpose
사용자 인증 및 JWT 토큰 관리를 담당합니다.

---

### 1.1. Customer Login

#### Flow
```
POST /api/customer/login
  ↓
AuthService.customer_login(store_id, table_number, password)
  ↓
1. Validate Input
   - store_id, table_number, password required
  ↓
2. Find Table
   - TableRepository.find_by_store_and_number(store_id, table_number)
   - If not found → 404 Error
  ↓
3. Verify Table Password
   - Compare plain password with table.password
   - If mismatch → 401 Error
  ↓
4. Check Table Active
   - If table.is_active = FALSE → 403 Error
  ↓
5. Get or Create Session
   - TableService.get_or_create_session(table.id)
   - Returns existing active session or creates new
  ↓
6. Generate Session Response
   - Return { session_id, table_info }
  ↓
Response 200 OK
```

#### Input
```python
{
  "store_id": "store_xxx",
  "table_number": 1,
  "table_password": "1234"
}
```

#### Output
```python
{
  "session_id": "session_yyy",
  "table_info": {
    "id": "table_zzz",
    "table_number": 1,
    "store_name": "Sample Restaurant"
  }
}
```

#### Error Cases
- 400: Missing required fields
- 404: Table not found
- 401: Invalid password
- 403: Table inactive

---

### 1.2. Admin Login

#### Flow
```
POST /api/admin/login
  ↓
AuthService.admin_login(store_id, username, password)
  ↓
1. Validate Input
   - store_id, username, password required
  ↓
2. Find Admin
   - AdminRepository.find_by_store_and_username(store_id, username)
   - If not found → 404 Error
  ↓
3. Verify Password
   - bcrypt.checkpw(password, admin.password_hash)
   - If mismatch → 401 Error
  ↓
4. Generate JWT Token
   - JWTUtil.create_token(admin.id, store_id)
   - Expires in 16 hours
  ↓
5. Set HTTP-only Cookie
   - Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Max-Age=57600
  ↓
6. Generate Response
   - Return { success: true, admin: {...} }
  ↓
Response 200 OK + Set-Cookie
```

#### Input
```python
{
  "store_id": "store_xxx",
  "username": "admin",
  "password": "password123"
}
```

#### Output
```python
# Response Body
{
  "success": true,
  "admin": {
    "id": "admin_yyy",
    "username": "admin",
    "store_id": "store_xxx"
  }
}

# Response Headers
Set-Cookie: token=<jwt_token>; HttpOnly; SameSite=Strict; Max-Age=57600; Path=/
```

#### JWT Token Payload
```python
{
  "admin_id": "admin_yyy",
  "store_id": "store_xxx",
  "exp": 1234567890  # Unix timestamp (16 hours later)
}
```

#### Error Cases
- 400: Missing required fields
- 404: Admin not found
- 401: Invalid password

---

### 1.3. JWT Validation (Middleware)

#### Flow
```
Any Admin API Request
  ↓
AuthMiddleware.validate_jwt()
  ↓
1. Extract Token from Cookie
   - Cookie: token=<jwt>
   - If not found → 401 Error
  ↓
2. Verify JWT Signature
   - JWTUtil.verify_token(token)
   - If invalid signature → 401 Error
  ↓
3. Check Expiration
   - If expired → 401 Error
  ↓
4. Extract Payload
   - { admin_id, store_id, exp }
  ↓
5. Attach to Request Context
   - request.state.admin_id = payload["admin_id"]
   - request.state.store_id = payload["store_id"]
  ↓
Pass to Handler
```

#### Error Cases
- 401: Token missing
- 401: Token invalid
- 401: Token expired

---

## 2. OrderService

### Purpose
주문 생성, 상태 변경, 조회, 삭제, 아카이브를 담당합니다.

---

### 2.1. Create Order

#### Flow
```
POST /api/customer/orders
  ↓
OrderService.create_order(table_id, session_id, items: [{menu_id, quantity}])
  ↓
1. Validate Input
   - table_id, session_id, items required
   - items: at least 1 item, quantity >= 1
  ↓
2. Verify Active Session
   - TableRepository.find_session_by_id(session_id)
   - If not found or is_active = FALSE → 400 Error
  ↓
3. Verify Session Belongs to Table
   - If session.table_id != table_id → 400 Error
  ↓
4. Fetch Menu Prices
   - MenuRepository.find_by_ids([menu_id1, menu_id2, ...])
   - If any menu not found → 404 Error
   - If any menu is_active = FALSE → 400 Error
  ↓
5. Calculate Total Amount
   - total = sum(menu.price * quantity for each item)
  ↓
6. Generate Order Number
   - OrderRepository.get_next_order_number(store_id)
   - Store-wide sequential (Q7)
  ↓
7. Create Order (Transaction Start)
   - Create Order entity (status='pending', total_amount=total)
   - Create OrderItem entities (price=menu.price snapshot)
   - Commit transaction
  ↓
8. Broadcast SSE Event
   - SSEManager.broadcast(store_id, event='order.created', data={order_details})
  ↓
9. Return Order Response
   - { order_id, order_number, total_amount }
  ↓
Response 200 OK
```

#### Input
```python
{
  "table_id": "table_xxx",
  "session_id": "session_yyy",
  "items": [
    { "menu_id": "menu_1", "quantity": 2 },
    { "menu_id": "menu_2", "quantity": 1 }
  ]
}
```

#### Output
```python
{
  "order_id": "order_zzz",
  "order_number": 12,
  "total_amount": 42000
}
```

#### SSE Event (order.created)
```python
{
  "event": "order.created",
  "data": {
    "order_id": "order_zzz",
    "table_id": "table_xxx",
    "order_number": 12,
    "status": "pending",
    "total_amount": 42000,
    "items": [
      { "menu_id": "menu_1", "menu_name": "Pizza", "quantity": 2, "price": 15000 },
      { "menu_id": "menu_2", "menu_name": "Pasta", "quantity": 1, "price": 12000 }
    ],
    "created_at": "2026-04-06T12:05:00Z"
  }
}
```

#### Concurrent Order Handling (Q5)
- 동일 테이블에서 동시 주문 허용
- 각 주문은 독립적인 order_number 부여
- Database lock으로 order_number 중복 방지

#### Error Cases
- 400: Invalid input (empty items, quantity < 1)
- 400: Session inactive or not found
- 400: Session does not belong to table
- 404: Menu not found
- 400: Menu inactive

---

### 2.2. Update Order Status

#### Flow
```
PATCH /api/admin/orders/{order_id}/status
  ↓
OrderService.update_status(order_id, new_status, admin_id)
  ↓
1. Validate Input
   - new_status in ['pending', 'preparing', 'completed']
  ↓
2. Find Order
   - OrderRepository.find_by_id(order_id)
   - If not found → 404 Error
  ↓
3. Verify Admin Permission
   - If order.table.store_id != admin.store_id → 403 Error
  ↓
4. Validate Status Transition (Q1: Strict Sequential)
   - pending → preparing: OK
   - preparing → completed: OK
   - pending → completed: NOT ALLOWED → 400 Error
   - Any reverse transition: NOT ALLOWED → 400 Error
   - Same status: Idempotent (no error, no update)
  ↓
5. Update Order Status
   - order.status = new_status
   - order.updated_at = CURRENT_TIMESTAMP
   - OrderRepository.update(order)
  ↓
6. Broadcast SSE Event
   - SSEManager.broadcast(store_id, event='order.status_changed', data={...})
  ↓
7. Return Updated Order
   - { order: {...} }
  ↓
Response 200 OK
```

#### Status Transition Matrix
| From \ To | pending | preparing | completed |
|---|---|---|---|
| **pending** | ✅ (idempotent) | ✅ | ❌ |
| **preparing** | ❌ | ✅ (idempotent) | ✅ |
| **completed** | ❌ | ❌ | ✅ (idempotent) |

#### SSE Event (order.status_changed)
```python
{
  "event": "order.status_changed",
  "data": {
    "order_id": "order_zzz",
    "old_status": "pending",
    "new_status": "preparing",
    "updated_at": "2026-04-06T12:10:00Z"
  }
}
```

#### Error Cases
- 400: Invalid status value
- 404: Order not found
- 403: Admin not authorized (different store)
- 400: Invalid status transition

---

### 2.3. Delete Order

#### Flow
```
DELETE /api/admin/orders/{order_id}
  ↓
OrderService.delete_order(order_id, admin_id)
  ↓
1. Find Order
   - OrderRepository.find_by_id(order_id)
   - If not found → 404 Error
  ↓
2. Verify Admin Permission
   - If order.table.store_id != admin.store_id → 403 Error
  ↓
3. Hard Delete Order (Q4)
   - OrderRepository.delete(order_id)
   - Cascade deletes OrderItems (ON DELETE CASCADE)
  ↓
4. Broadcast SSE Event
   - SSEManager.broadcast(store_id, event='order.deleted', data={order_id})
  ↓
5. Return Success
   - { success: true }
  ↓
Response 200 OK
```

#### SSE Event (order.deleted)
```python
{
  "event": "order.deleted",
  "data": {
    "order_id": "order_zzz",
    "table_id": "table_xxx"
  }
}
```

#### Hard Delete (Q4)
- 데이터베이스에서 완전 삭제
- OrderItem도 CASCADE로 자동 삭제
- 복구 불가능
- OrderHistory에 이미 아카이브된 경우는 히스토리 유지

#### Error Cases
- 404: Order not found
- 403: Admin not authorized

---

### 2.4. Query Orders

#### Flow (Customer)
```
GET /api/customer/orders?session_id=xxx
  ↓
OrderService.get_orders_by_session(session_id)
  ↓
1. Validate Session
   - TableRepository.find_session_by_id(session_id)
   - If not found → 404 Error
  ↓
2. Query Orders
   - OrderRepository.find_by_session_id(session_id)
   - Include OrderItems (JOIN)
   - Order by created_at DESC
  ↓
3. Return Orders
   - { orders: [...] }
  ↓
Response 200 OK
```

#### Flow (Admin)
```
GET /api/admin/orders?store_id=xxx
  ↓
OrderService.get_orders_by_store(store_id, admin_id)
  ↓
1. Verify Admin Permission
   - If admin.store_id != store_id → 403 Error
  ↓
2. Query Active Orders
   - OrderRepository.find_by_store_id(store_id)
   - Filter: session.is_active = TRUE
   - Include OrderItems, Table info (JOIN)
   - Order by created_at DESC
  ↓
3. Return Orders
   - { orders: [...] }
  ↓
Response 200 OK
```

#### Output Format
```python
{
  "orders": [
    {
      "id": "order_zzz",
      "order_number": 12,
      "table_id": "table_xxx",
      "table_number": 1,
      "status": "pending",
      "total_amount": 42000,
      "created_at": "2026-04-06T12:05:00Z",
      "items": [
        {
          "id": "item_1",
          "menu_id": "menu_1",
          "menu_name": "Pizza",
          "quantity": 2,
          "price": 15000
        }
      ]
    }
  ]
}
```

---

### 2.5. Archive Orders (Internal)

#### Flow
```
TableService.complete_session(table_id) calls
  ↓
OrderService.archive_orders(session_id)
  ↓
1. Query All Orders in Session
   - OrderRepository.find_by_session_id(session_id)
   - Include OrderItems, Menu names (JOIN)
  ↓
2. Build Archived Data (JSON)
   - session_info: { session_id, table_number, start_time, end_time }
   - orders: [ { order_id, order_number, status, total, items: [...] } ]
   - total_session_amount: sum(order.total_amount)
  ↓
3. Create OrderHistory
   - OrderHistoryRepository.create({
       table_id, session_id, archived_data, archived_at
     })
  ↓
4. Return Success
  ↓
Complete
```

#### Archived Data Format
```python
{
  "session_id": "session_yyy",
  "table_number": 1,
  "start_time": "2026-04-06T12:00:00Z",
  "end_time": "2026-04-06T14:00:00Z",
  "orders": [
    {
      "order_id": "order_zzz",
      "order_number": 12,
      "status": "completed",
      "total_amount": 42000,
      "created_at": "2026-04-06T12:05:00Z",
      "items": [
        { "menu_name": "Pizza", "quantity": 2, "price": 15000 },
        { "menu_name": "Pasta", "quantity": 1, "price": 12000 }
      ]
    }
  ],
  "total_session_amount": 42000
}
```

#### Archive Trigger (Q8)
- 테이블 세션 종료 시 (POST /api/admin/tables/{id}/complete)
- TableService가 OrderService.archive_orders() 호출

---

## 3. TableService

### Purpose
테이블 세션 관리, 활성 테이블 조회, 히스토리 조회를 담당합니다.

---

### 3.1. Get or Create Session

#### Flow
```
AuthService.customer_login() calls
  ↓
TableService.get_or_create_session(table_id)
  ↓
1. Find Active Session
   - TableRepository.find_active_session(table_id)
   - Query: table_sessions WHERE table_id = ? AND is_active = TRUE
  ↓
2. If Active Session Exists
   - Return existing session
  ↓
3. If No Active Session
   - Create new TableSession
   - { table_id, start_time=NOW(), is_active=TRUE }
   - TableRepository.create_session(session)
  ↓
4. Return Session
   - { session_id, table_id, start_time, is_active }
  ↓
Complete
```

#### Business Rules
- 테이블당 동시에 1개의 활성 세션만 허용
- 활성 세션 있으면 재사용 (새로 생성하지 않음)
- 세션 자동 타임아웃 없음 (Q2)

---

### 3.2. Complete Session

#### Flow
```
POST /api/admin/tables/{table_id}/complete
  ↓
TableService.complete_session(table_id, admin_id)
  ↓
1. Find Active Session
   - TableRepository.find_active_session(table_id)
   - If not found → 404 Error
  ↓
2. Verify Admin Permission
   - If table.store_id != admin.store_id → 403 Error
  ↓
3. Check All Orders Completed or Deleted
   - OrderRepository.count_pending_orders(session_id)
   - If count > 0 → 400 Error ("Orders not completed")
  ↓
4. Archive Orders (Transaction Start)
   - OrderService.archive_orders(session_id)
   - Creates OrderHistory with JSON data
  ↓
5. Close Session
   - session.end_time = CURRENT_TIMESTAMP
   - session.is_active = FALSE
   - TableRepository.update_session(session)
   - Commit transaction
  ↓
6. Return Success
   - { success: true }
  ↓
Response 200 OK
```

#### Session End Condition
```python
# 모든 주문이 completed 또는 deleted 상태여야 함
pending_orders = orders.filter(status IN ['pending', 'preparing'])
if len(pending_orders) > 0:
    raise Error("Cannot complete session with pending orders")
```

#### Error Cases
- 404: No active session for table
- 403: Admin not authorized
- 400: Pending or preparing orders exist

---

### 3.3. Get Active Tables

#### Flow
```
GET /api/admin/tables?store_id=xxx (implied)
  ↓
TableService.get_active_tables(store_id, admin_id)
  ↓
1. Verify Admin Permission
   - If admin.store_id != store_id → 403 Error
  ↓
2. Query Active Sessions
   - TableRepository.find_active_sessions_by_store(store_id)
   - JOIN: table_sessions, tables, orders
   - Filter: is_active = TRUE
  ↓
3. Aggregate Order Info per Table
   - For each session:
     - Count orders
     - Sum total_amount
     - Get order statuses
  ↓
4. Return Active Tables
   - { tables: [...] }
  ↓
Response 200 OK
```

#### Output Format
```python
{
  "tables": [
    {
      "table_id": "table_xxx",
      "table_number": 1,
      "session_id": "session_yyy",
      "session_start": "2026-04-06T12:00:00Z",
      "order_count": 3,
      "total_amount": 50000,
      "orders": [
        { "order_number": 12, "status": "pending" },
        { "order_number": 13, "status": "preparing" },
        { "order_number": 14, "status": "completed" }
      ]
    }
  ]
}
```

---

### 3.4. Get Table History

#### Flow
```
GET /api/admin/orders/history?table_id=xxx&date=2026-04-06
  ↓
TableService.get_table_history(table_id, date, admin_id)
  ↓
1. Verify Admin Permission
   - If table.store_id != admin.store_id → 403 Error
  ↓
2. Query OrderHistory
   - OrderHistoryRepository.find_by_table_and_date(table_id, date)
   - Filter: archived_at BETWEEN date_start AND date_end
   - Order by archived_at DESC
  ↓
3. Parse JSON Data
   - Extract archived_data (JSON)
   - Return structured history
  ↓
4. Return History
   - { history: [...] }
  ↓
Response 200 OK
```

#### Output Format
```python
{
  "history": [
    {
      "session_id": "session_yyy",
      "table_number": 1,
      "start_time": "2026-04-06T12:00:00Z",
      "end_time": "2026-04-06T14:00:00Z",
      "archived_at": "2026-04-06T14:00:00Z",
      "orders": [
        {
          "order_id": "order_zzz",
          "order_number": 12,
          "status": "completed",
          "total_amount": 42000,
          "items": [...]
        }
      ],
      "total_session_amount": 42000
    }
  ]
}
```

---

## 4. MenuService

### Purpose
메뉴 CRUD 작업을 담당합니다.

---

### 4.1. Create Menu

#### Flow
```
POST /api/admin/menus
  ↓
MenuService.create_menu(menu_data, admin_id)
  ↓
1. Validate Input
   - name, price, category_id required
   - price >= 0, price <= 10,000,000
  ↓
2. Verify Admin Permission
   - Extract store_id from admin_id
  ↓
3. Verify Category Exists
   - MenuCategoryRepository.find_by_id(category_id)
   - If not found → 404 Error
   - If category.store_id != admin.store_id → 403 Error
  ↓
4. Validate Image URL (if provided)
   - Check URL format (starts with http:// or https://)
  ↓
5. Create Menu
   - MenuRepository.create({
       store_id, category_id, name, description, price, image_url, is_active=TRUE
     })
  ↓
6. Return Created Menu
   - { menu: {...} }
  ↓
Response 201 Created
```

#### Error Cases
- 400: Invalid input (price out of range, invalid URL)
- 404: Category not found
- 403: Category belongs to different store

---

### 4.2. Update Menu

#### Flow
```
PUT /api/admin/menus/{menu_id}
  ↓
MenuService.update_menu(menu_id, menu_data, admin_id)
  ↓
1. Find Menu
   - MenuRepository.find_by_id(menu_id)
   - If not found → 404 Error
  ↓
2. Verify Admin Permission
   - If menu.store_id != admin.store_id → 403 Error
  ↓
3. Validate Input
   - If price provided: 0 <= price <= 10,000,000
   - If category_id provided: verify exists and same store
   - If image_url provided: validate URL format
  ↓
4. Update Menu
   - Update allowed fields: name, description, price, category_id, image_url, is_active
   - menu.updated_at = CURRENT_TIMESTAMP
   - MenuRepository.update(menu)
  ↓
5. Return Updated Menu
   - { menu: {...} }
  ↓
Response 200 OK
```

#### Price Change Policy (Q3)
- 메뉴 가격 변경 가능
- 기존 주문에는 영향 없음 (OrderItem에 가격 스냅샷 저장됨)
- 새 주문부터 변경된 가격 적용

#### Error Cases
- 400: Invalid input
- 404: Menu not found
- 403: Admin not authorized

---

### 4.3. Delete Menu

#### Flow
```
DELETE /api/admin/menus/{menu_id}
  ↓
MenuService.delete_menu(menu_id, admin_id)
  ↓
1. Find Menu
   - MenuRepository.find_by_id(menu_id)
   - If not found → 404 Error
  ↓
2. Verify Admin Permission
   - If menu.store_id != admin.store_id → 403 Error
  ↓
3. Check Active Orders (Optional Safety Check)
   - OrderItemRepository.count_by_menu_id(menu_id)
   - If count > 0 → 400 Error ("Menu in use by orders")
   - (This is optional - can decide to allow deletion)
  ↓
4. Hard Delete Menu (Q4)
   - MenuRepository.delete(menu_id)
  ↓
5. Return Success
   - { success: true }
  ↓
Response 200 OK
```

#### Deletion Policy
- Hard Delete (Q4)
- 활성 주문에 포함된 메뉴 삭제 불가 (안전장치)
- OrderItem의 menu_id는 Foreign Key RESTRICT로 보호됨

#### Error Cases
- 404: Menu not found
- 403: Admin not authorized
- 400: Menu in use by orders

---

### 4.4. Query Menus

#### Flow (Customer)
```
GET /api/customer/menus?store_id=xxx&category_id=yyy
  ↓
MenuService.get_menus(store_id, category_id=None)
  ↓
1. Query Menus
   - MenuRepository.find_by_store(store_id, category_id)
   - Filter: is_active = TRUE
   - Include category info (JOIN)
   - Order by category.display_order, menu.name
  ↓
2. Group by Category (Optional)
  ↓
3. Return Menus
   - { menus: [...], categories: [...] }
  ↓
Response 200 OK
```

#### Flow (Admin)
```
GET /api/admin/menus?store_id=xxx
  ↓
MenuService.get_all_menus(store_id, admin_id)
  ↓
1. Verify Admin Permission
   - If admin.store_id != store_id → 403 Error
  ↓
2. Query All Menus (including inactive)
   - MenuRepository.find_by_store(store_id, include_inactive=TRUE)
   - Include category info (JOIN)
   - Order by category.display_order, menu.name
  ↓
3. Return Menus
   - { menus: [...], categories: [...] }
  ↓
Response 200 OK
```

#### Output Format
```python
{
  "menus": [
    {
      "id": "menu_xxx",
      "name": "Pizza",
      "description": "Delicious pizza",
      "price": 15000,
      "category_id": "cat_yyy",
      "category_name": "Main Dishes",
      "image_url": "https://example.com/pizza.jpg",
      "is_active": true
    }
  ],
  "categories": [
    { "id": "cat_yyy", "name": "Main Dishes", "display_order": 0 }
  ]
}
```

---

## Transaction Management

### Critical Transactions

1. **Create Order**:
   ```python
   BEGIN TRANSACTION
     INSERT INTO orders (...)
     INSERT INTO order_items (...)  # Multiple inserts
     SSEManager.broadcast(...)      # Outside transaction
   COMMIT
   ```

2. **Complete Session**:
   ```python
   BEGIN TRANSACTION
     SELECT orders WHERE session_id = ? FOR UPDATE  # Lock
     INSERT INTO order_history (...)
     UPDATE table_sessions SET end_time=?, is_active=FALSE
   COMMIT
   ```

3. **Delete Order**:
   ```python
   BEGIN TRANSACTION
     DELETE FROM order_items WHERE order_id = ?  # Cascade
     DELETE FROM orders WHERE id = ?
   COMMIT
   ```

### Concurrency Control

- **Order Number Generation**: Database-level unique constraint + lock
- **Session Creation**: Unique constraint on (table_id, is_active=TRUE)
- **Order Creation**: Allow concurrent (Q5)

---

## SSE Manager Integration

### SSEManager Methods

```python
class SSEManager:
    connections: Dict[str, List[Queue]] = {}  # store_id → [queue1, queue2, ...]
    
    def add_connection(self, store_id: str, queue: Queue):
        """Add SSE connection for a store"""
        
    def remove_connection(self, store_id: str, queue: Queue):
        """Remove SSE connection"""
        
    def broadcast(self, store_id: str, event_type: str, data: dict):
        """Broadcast event to all connections for a store"""
        for queue in self.connections[store_id]:
            queue.put({"event": event_type, "data": data})
```

### SSE Event Types

1. **order.created**: 새 주문 생성 시
2. **order.status_changed**: 주문 상태 변경 시
3. **order.deleted**: 주문 삭제 시

### SSE Authentication (Q6)
- JWT Cookie로 인증
- AdminRouter에서 JWT 검증 후 SSE 연결 허용

### SSE Reconnection (Q10)
- 클라이언트가 자동 재연결
- 서버는 재연결 시 최신 상태만 조회 (이벤트 버퍼링 없음)

---

**Business Logic Model Complete** ✓  
**Total Services**: 4개  
**Total Business Flows**: 15개
