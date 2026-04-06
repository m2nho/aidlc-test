# Domain Entities - Unit 1: Backend

Backend의 9개 도메인 엔티티(데이터베이스 테이블) 상세 설계입니다.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Store       │
│─────────────────│
│ id (PK)         │
│ name            │
│ address         │
│ phone           │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         │                      │
    ┌────▼─────────┐      ┌────▼──────────────┐
    │    Admin     │      │  MenuCategory     │
    │──────────────│      │───────────────────│
    │ id (PK)      │      │ id (PK)           │
    │ store_id (FK)│      │ store_id (FK)     │
    │ username     │      │ name              │
    │ password_hash│      │ display_order     │
    │ created_at   │      │ created_at        │
    └──────────────┘      └────────┬──────────┘
                                   │
         ┌─────────────────────────┼──────────┐
         │                         │          │
    ┌────▼─────────┐         ┌────▼─────────────────┐
    │    Table     │         │       Menu           │
    │──────────────│         │──────────────────────│
    │ id (PK)      │         │ id (PK)              │
    │ store_id (FK)│         │ store_id (FK)        │
    │ table_number │         │ category_id (FK)     │
    │ password     │         │ name                 │
    │ is_active    │         │ description          │
    │ created_at   │         │ price                │
    └────┬─────────┘         │ image_url            │
         │                   │ is_active            │
         │                   │ created_at           │
         │                   │ updated_at           │
         │                   └──────────┬───────────┘
         │                              │
    ┌────▼───────────────┐             │
    │   TableSession     │             │
    │────────────────────│             │
    │ id (PK)            │             │
    │ table_id (FK)      │             │
    │ start_time         │             │
    │ end_time (nullable)│             │
    │ is_active          │             │
    └────┬───────────────┘             │
         │                              │
         │         ┌────────────────────┘
         │         │
    ┌────▼─────────▼──────┐
    │       Order         │
    │─────────────────────│
    │ id (PK)             │
    │ order_number        │
    │ table_id (FK)       │
    │ session_id (FK)     │
    │ status              │
    │ total_amount        │
    │ created_at          │
    │ updated_at          │
    └────┬────────────────┘
         │
         ├──────────────┬───────────────┐
         │              │               │
    ┌────▼──────────┐   │          ┌────▼──────────────┐
    │  OrderItem    │   │          │  OrderHistory     │
    │───────────────│   │          │───────────────────│
    │ id (PK)       │   │          │ id (PK)           │
    │ order_id (FK) │   │          │ table_id (FK)     │
    │ menu_id (FK)  │◄──┘          │ session_id (FK)   │
    │ quantity      │               │ archived_data     │
    │ price         │               │ archived_at       │
    │ created_at    │               └───────────────────┘
    └───────────────┘
```

---

## 1. Store Entity

### Purpose
매장 정보를 저장합니다. 시스템의 최상위 엔티티로 모든 데이터는 Store에 속합니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| name | VARCHAR(255) | NOT NULL, UNIQUE | 매장 이름 |
| address | VARCHAR(500) | NULL | 매장 주소 |
| phone | VARCHAR(20) | NULL | 매장 전화번호 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시각 |

### Indexes
- PRIMARY KEY (id)
- UNIQUE INDEX idx_store_name (name)

### Business Rules
- 매장 이름은 중복 불가
- MVP에서는 단일 매장만 지원하지만, 확장 가능성을 위해 Store 테이블 유지
- 삭제 불가 (시스템 데이터)

### Example Data
```json
{
  "id": "store_550e8400-e29b-41d4-a716-446655440000",
  "name": "Sample Restaurant",
  "address": "서울시 강남구 테헤란로 123",
  "phone": "02-1234-5678",
  "created_at": "2026-04-01T00:00:00Z",
  "updated_at": "2026-04-01T00:00:00Z"
}
```

---

## 2. Admin Entity

### Purpose
관리자 계정 정보를 저장합니다. JWT 인증에 사용됩니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| store_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (stores.id) | 소속 매장 |
| username | VARCHAR(50) | NOT NULL | 관리자 사용자명 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

### Indexes
- PRIMARY KEY (id)
- UNIQUE INDEX idx_admin_store_username (store_id, username)
- INDEX idx_admin_store_id (store_id)

### Business Rules
- username은 store 내에서 고유해야 함 (복합 유니크)
- password는 bcrypt로 해시되어 저장 (원문 저장 금지)
- 비밀번호 최소 길이: 4자리 (MVP 간소화)
- 관리자 삭제 불가 (시스템 데이터, 시드로만 생성)

### Password Hashing
```python
import bcrypt

# 비밀번호 해싱
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# 비밀번호 검증
is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash)
```

### Example Data
```json
{
  "id": "admin_550e8400-e29b-41d4-a716-446655440001",
  "store_id": "store_550e8400-e29b-41d4-a716-446655440000",
  "username": "admin",
  "password_hash": "$2b$12$...", 
  "created_at": "2026-04-01T00:00:00Z"
}
```

---

## 3. Table Entity

### Purpose
매장의 물리적 테이블 정보를 저장합니다. 고객이 로그인하는 단위입니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| store_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (stores.id) | 소속 매장 |
| table_number | INTEGER | NOT NULL | 테이블 번호 (1, 2, 3, ...) |
| password | VARCHAR(4) | NOT NULL | 4자리 숫자 비밀번호 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

### Indexes
- PRIMARY KEY (id)
- UNIQUE INDEX idx_table_store_number (store_id, table_number)
- INDEX idx_table_store_id (store_id)

### Business Rules
- table_number는 store 내에서 고유해야 함 (복합 유니크)
- password는 4자리 숫자 (1234, 0000 등)
- is_active = FALSE인 테이블은 로그인 불가
- 테이블 삭제 불가 (시스템 데이터, 시드로만 생성)

### Example Data
```json
{
  "id": "table_550e8400-e29b-41d4-a716-446655440002",
  "store_id": "store_550e8400-e29b-41d4-a716-446655440000",
  "table_number": 1,
  "password": "1234",
  "is_active": true,
  "created_at": "2026-04-01T00:00:00Z"
}
```

---

## 4. TableSession Entity

### Purpose
테이블의 사용 세션을 관리합니다. 고객이 착석부터 퇴석까지의 단위입니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4, 세션 ID |
| table_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (tables.id) | 소속 테이블 |
| start_time | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 세션 시작 시각 |
| end_time | TIMESTAMP | NULL | 세션 종료 시각 (NULL = 활성) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |

### Indexes
- PRIMARY KEY (id)
- INDEX idx_session_table_id (table_id)
- INDEX idx_session_active (is_active)

### Business Rules
- 테이블당 동시에 1개의 활성 세션만 허용 (is_active = TRUE)
- 세션 생성: Customer 로그인 시 자동 생성 or 재사용
- 세션 종료: Admin이 수동으로 종료 (POST /api/admin/tables/{id}/complete)
- 세션 종료 조건: 모든 주문이 completed or deleted 상태
- 세션 종료 시: end_time 설정, is_active = FALSE, OrderHistory 생성
- 자동 타임아웃 없음 (Q2: No Timeout)

### Lifecycle
```
1. Customer 로그인 (POST /api/customer/login)
   - 활성 세션 있으면 재사용
   - 없으면 새 세션 생성

2. 주문 생성 (POST /api/customer/orders)
   - session_id 필수

3. Admin 세션 종료 (POST /api/admin/tables/{id}/complete)
   - 모든 주문 completed/deleted 확인
   - end_time 설정, is_active = FALSE
   - OrderHistory 생성
```

### Example Data
```json
{
  "id": "session_550e8400-e29b-41d4-a716-446655440003",
  "table_id": "table_550e8400-e29b-41d4-a716-446655440002",
  "start_time": "2026-04-06T12:00:00Z",
  "end_time": null,
  "is_active": true
}
```

---

## 5. MenuCategory Entity

### Purpose
메뉴 카테고리 정보를 저장합니다. 메뉴를 그룹화합니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| store_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (stores.id) | 소속 매장 |
| name | VARCHAR(100) | NOT NULL | 카테고리 이름 |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

### Indexes
- PRIMARY KEY (id)
- INDEX idx_category_store_id (store_id)

### Business Rules
- 카테고리 이름 중복 허용 (같은 store 내에서도)
- display_order: 낮은 숫자가 먼저 표시 (0, 1, 2, ...)
- 카테고리 삭제 시 해당 카테고리의 메뉴가 있으면 삭제 불가

### Example Data
```json
{
  "id": "category_550e8400-e29b-41d4-a716-446655440004",
  "store_id": "store_550e8400-e29b-41d4-a716-446655440000",
  "name": "메인 요리",
  "display_order": 0,
  "created_at": "2026-04-01T00:00:00Z"
}
```

---

## 6. Menu Entity

### Purpose
메뉴 항목 정보를 저장합니다. 고객이 주문하는 단위입니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| store_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (stores.id) | 소속 매장 |
| category_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (menu_categories.id) | 소속 카테고리 |
| name | VARCHAR(200) | NOT NULL | 메뉴 이름 |
| description | TEXT | NULL | 메뉴 설명 |
| price | INTEGER | NOT NULL | 가격 (원 단위, 정수) |
| image_url | VARCHAR(500) | NULL | 메뉴 이미지 URL (외부 링크) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시각 |

### Indexes
- PRIMARY KEY (id)
- INDEX idx_menu_store_id (store_id)
- INDEX idx_menu_category_id (category_id)
- INDEX idx_menu_active (is_active)

### Business Rules
- 메뉴 이름 중복 허용 (같은 카테고리 내에서도)
- price는 0원 이상 (음수 불가), 최대 10,000,000원
- image_url은 외부 URL (MVP에서는 업로드 기능 없음)
- is_active = FALSE인 메뉴는 주문 불가 (고객 UI에 미표시)
- 메뉴 삭제: Hard Delete (Q4), 단 활성 주문에 포함된 메뉴는 삭제 불가

### Price History (Q3: Snapshot)
- 메뉴 가격 변경 시 기존 주문 영향 없음
- OrderItem 테이블에 주문 당시 가격 저장 (Snapshot)

### Example Data
```json
{
  "id": "menu_550e8400-e29b-41d4-a716-446655440005",
  "store_id": "store_550e8400-e29b-41d4-a716-446655440000",
  "category_id": "category_550e8400-e29b-41d4-a716-446655440004",
  "name": "마르게리타 피자",
  "description": "토마토, 모짜렐라, 바질",
  "price": 15000,
  "image_url": "https://example.com/pizza.jpg",
  "is_active": true,
  "created_at": "2026-04-01T00:00:00Z",
  "updated_at": "2026-04-01T00:00:00Z"
}
```

---

## 7. Order Entity

### Purpose
주문 정보를 저장합니다. 고객이 생성하고 관리자가 관리합니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| order_number | INTEGER | NOT NULL | 주문 번호 (store별 순차) |
| table_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (tables.id) | 주문한 테이블 |
| session_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (table_sessions.id) | 소속 세션 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 주문 상태 |
| total_amount | INTEGER | NOT NULL | 총 금액 (원) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 주문 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 주문 수정 시각 |

### Indexes
- PRIMARY KEY (id)
- UNIQUE INDEX idx_order_store_number (table_id, order_number) - store별 고유 번호
- INDEX idx_order_table_id (table_id)
- INDEX idx_order_session_id (session_id)
- INDEX idx_order_status (status)

### Status Values
- **pending**: 주문 접수 (초기 상태)
- **preparing**: 조리 중
- **completed**: 완료

### Status Transition Rules (Q1: Strict Sequential)
```
pending → preparing → completed
```
- pending → completed 직접 전환 불가
- 역방향 전환 불가 (completed → preparing 불가)
- 취소는 DELETE API로 처리 (상태 없음)

### Order Number Generation (Q7: Store-wide Sequential)
- Store별 순차 번호 (1, 2, 3, ...)
- 매일 초기화하지 않음 (계속 증가)
- 동시 주문 처리 (Q5: Allow Concurrent)

### Total Amount Calculation
```python
total_amount = sum(order_item.price * order_item.quantity for order_item in order_items)
```
- OrderItem의 price는 주문 당시 메뉴 가격 스냅샷
- 총액은 항상 OrderItem 합계와 일치해야 함 (데이터 일관성)

### Business Rules
- 활성 세션(is_active = TRUE) 필요
- 최소 1개 이상의 OrderItem 필요
- 주문 삭제: Hard Delete (Q4), 단 관련 OrderItem도 함께 삭제 (CASCADE)

### Example Data
```json
{
  "id": "order_550e8400-e29b-41d4-a716-446655440006",
  "order_number": 1,
  "table_id": "table_550e8400-e29b-41d4-a716-446655440002",
  "session_id": "session_550e8400-e29b-41d4-a716-446655440003",
  "status": "pending",
  "total_amount": 30000,
  "created_at": "2026-04-06T12:05:00Z",
  "updated_at": "2026-04-06T12:05:00Z"
}
```

---

## 8. OrderItem Entity

### Purpose
주문의 개별 메뉴 항목을 저장합니다. Order와 Menu의 Many-to-Many 관계를 해소합니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| order_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (orders.id) ON DELETE CASCADE | 소속 주문 |
| menu_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (menus.id) | 주문한 메뉴 |
| quantity | INTEGER | NOT NULL | 수량 |
| price | INTEGER | NOT NULL | 주문 당시 메뉴 가격 (스냅샷) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

### Indexes
- PRIMARY KEY (id)
- INDEX idx_order_item_order_id (order_id)
- INDEX idx_order_item_menu_id (menu_id)

### Business Rules
- quantity는 1 이상 (최대 제한 없음, MVP에서는 Frontend 제한)
- price는 주문 당시 Menu.price 값 복사 (Q3: Snapshot)
  - 메뉴 가격 변경해도 기존 주문 영향 없음
- ON DELETE CASCADE: Order 삭제 시 OrderItem도 자동 삭제

### Price Snapshot Logic
```python
# 주문 생성 시
order_item = OrderItem(
    order_id=order.id,
    menu_id=menu.id,
    quantity=request_quantity,
    price=menu.price  # 현재 메뉴 가격 스냅샷
)
```

### Example Data
```json
{
  "id": "item_550e8400-e29b-41d4-a716-446655440007",
  "order_id": "order_550e8400-e29b-41d4-a716-446655440006",
  "menu_id": "menu_550e8400-e29b-41d4-a716-446655440005",
  "quantity": 2,
  "price": 15000,
  "created_at": "2026-04-06T12:05:00Z"
}
```

---

## 9. OrderHistory Entity

### Purpose
세션 종료 시 주문 내역을 아카이브합니다. 과거 데이터 조회용입니다.

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| table_id | VARCHAR(36) | NOT NULL, FOREIGN KEY (tables.id) | 테이블 |
| session_id | VARCHAR(36) | NOT NULL | 세션 ID (원본 TableSession.id) |
| archived_data | TEXT | NOT NULL | JSON 형식의 주문 데이터 |
| archived_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 아카이브 시각 |

### Indexes
- PRIMARY KEY (id)
- INDEX idx_history_table_id (table_id)
- INDEX idx_history_session_id (session_id)
- INDEX idx_history_archived_at (archived_at)

### Archived Data Format (JSON)
```json
{
  "session_id": "session_550e8400-e29b-41d4-a716-446655440003",
  "table_number": 1,
  "start_time": "2026-04-06T12:00:00Z",
  "end_time": "2026-04-06T14:00:00Z",
  "orders": [
    {
      "order_id": "order_550e8400-e29b-41d4-a716-446655440006",
      "order_number": 1,
      "status": "completed",
      "total_amount": 30000,
      "created_at": "2026-04-06T12:05:00Z",
      "items": [
        {
          "menu_name": "마르게리타 피자",
          "quantity": 2,
          "price": 15000
        }
      ]
    }
  ],
  "total_session_amount": 30000
}
```

### Archive Trigger (Q8: On Session Complete)
- 세션 종료 시 (POST /api/admin/tables/{id}/complete) 자동 생성
- 해당 세션의 모든 주문 데이터를 JSON으로 직렬화
- 원본 Order/OrderItem은 삭제하지 않음 (별도 보관)

### Business Rules
- archived_data는 읽기 전용 (수정 불가)
- 데이터 보존 기간: 무제한 (MVP에서는 삭제 기능 없음)
- 조회: Admin UI에서 테이블별, 날짜별 필터링 가능

### Example Data
```json
{
  "id": "history_550e8400-e29b-41d4-a716-446655440008",
  "table_id": "table_550e8400-e29b-41d4-a716-446655440002",
  "session_id": "session_550e8400-e29b-41d4-a716-446655440003",
  "archived_data": "{\"session_id\":\"session_...\",\"orders\":[...]}",
  "archived_at": "2026-04-06T14:00:00Z"
}
```

---

## Foreign Key Relationships Summary

| From Table | Column | References | On Delete |
|---|---|---|---|
| Admin | store_id | Store.id | RESTRICT |
| Table | store_id | Store.id | RESTRICT |
| TableSession | table_id | Table.id | RESTRICT |
| MenuCategory | store_id | Store.id | RESTRICT |
| Menu | store_id | Store.id | RESTRICT |
| Menu | category_id | MenuCategory.id | RESTRICT |
| Order | table_id | Table.id | RESTRICT |
| Order | session_id | TableSession.id | RESTRICT |
| OrderItem | order_id | Order.id | CASCADE |
| OrderItem | menu_id | Menu.id | RESTRICT |
| OrderHistory | table_id | Table.id | RESTRICT |

**Notes**:
- CASCADE: 부모 삭제 시 자식도 삭제 (OrderItem만 해당)
- RESTRICT: 자식이 있으면 부모 삭제 불가 (나머지 모두)

---

## Data Consistency Rules

1. **Order Total Amount**:
   ```sql
   Order.total_amount = SUM(OrderItem.price * OrderItem.quantity)
   ```

2. **Active Session Uniqueness**:
   ```sql
   COUNT(*) <= 1 WHERE table_id = ? AND is_active = TRUE
   ```

3. **Session End Condition**:
   ```sql
   -- 세션 종료 가능 조건
   SELECT COUNT(*) FROM orders 
   WHERE session_id = ? 
   AND status NOT IN ('completed', 'deleted') = 0
   ```

4. **Order Number Uniqueness**:
   ```sql
   -- store별 order_number 고유
   UNIQUE (table_id, order_number) 
   -- table_id를 통해 store 간접 참조
   ```

---

**Domain Entities Complete** ✓  
**Total Entities**: 9개  
**Total Relationships**: 11개 (Foreign Keys)
