# Database Schema - Day 0 Contract

테이블오더 서비스의 데이터베이스 스키마 정의입니다.

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     Store       │
│─────────────────│
│ id (PK)         │
│ name            │
│ table_count     │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ├─────────────────────────────┐
        │                             │
        ▼                             ▼
┌─────────────────┐         ┌─────────────────┐
│     Admin       │         │     Table       │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ store_id (FK)   │         │ store_id (FK)   │
│ username        │         │ table_number    │
│ password_hash   │         │ password_hash   │
│ created_at      │         │ created_at      │
└─────────────────┘         └─────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                            ┌─────────────────┐
                            │  TableSession   │
                            │─────────────────│
                            │ id (PK)         │
                            │ table_id (FK)   │
                            │ started_at      │
                            │ ended_at        │
                            └─────────────────┘
                                    │
                                    │ 1:N
                                    ├─────────────────┐
                                    │                 │
                                    ▼                 ▼
                            ┌─────────────────┐  ┌─────────────────┐
                            │     Order       │  │  OrderHistory   │
                            │─────────────────│  │─────────────────│
                            │ id (PK)         │  │ id (PK)         │
                            │ store_id (FK)   │  │ session_id (FK) │
                            │ table_id (FK)   │  │ order_number    │
                            │ order_number    │  │ status          │
                            │ status          │  │ total_amount    │
                            │ created_at      │  │ completed_at    │
                            └─────────────────┘  │ order_data_json │
                                    │            └─────────────────┘
                                    │ 1:N
                                    ▼
                            ┌─────────────────┐
                            │   OrderItem     │
                            │─────────────────│
                            │ id (PK)         │
                            │ order_id (FK)   │
                            │ menu_id (FK)    │
                            │ quantity        │
                            │ price           │
                            └─────────────────┘
                                    │
                                    │ N:1
                                    ▼
┌─────────────────┐         ┌─────────────────┐
│  MenuCategory   │         │      Menu       │
│─────────────────│◄────────│─────────────────│
│ id (PK)         │  1:N    │ id (PK)         │
│ store_id (FK)   │         │ store_id (FK)   │
│ name            │         │ category_id (FK)│
│ display_order   │         │ name            │
└─────────────────┘         │ description     │
        │                   │ price           │
        │ N:1               │ is_available    │
        │                   │ created_at      │
        │                   │ updated_at      │
        ▼                   └─────────────────┘
┌─────────────────┐
│     Store       │
│  (same as above)│
└─────────────────┘
```

---

## Table Definitions

### 1. Store (매장)

**역할**: 매장 정보 저장

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 매장 ID |
| name | VARCHAR(100) | NOT NULL | 매장 이름 |
| table_count | INTEGER | NOT NULL, DEFAULT 0 | 테이블 수 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |

**Indexes**:
- PRIMARY KEY (id)

**Example**:
```json
{
  "id": 1,
  "name": "맛있는 식당",
  "table_count": 10,
  "created_at": "2026-04-06T10:00:00Z"
}
```

---

### 2. Admin (관리자)

**역할**: 매장 관리자 계정

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 관리자 ID |
| store_id | INTEGER | NOT NULL, FOREIGN KEY → Store(id) | 매장 ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 사용자명 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (username)
- INDEX (store_id)

**Example**:
```json
{
  "id": 1,
  "store_id": 1,
  "username": "admin",
  "password_hash": "$2b$12$...",
  "created_at": "2026-04-06T10:00:00Z"
}
```

---

### 3. Table (테이블)

**역할**: 물리적 테이블 정보

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 테이블 ID |
| store_id | INTEGER | NOT NULL, FOREIGN KEY → Store(id) | 매장 ID |
| table_number | INTEGER | NOT NULL | 테이블 번호 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 (4자리) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (store_id, table_number)
- INDEX (store_id)

**Business Rules**:
- (store_id, table_number) 조합은 유일해야 함

**Example**:
```json
{
  "id": 1,
  "store_id": 1,
  "table_number": 5,
  "password_hash": "$2b$12$...",
  "created_at": "2026-04-06T10:00:00Z"
}
```

---

### 4. TableSession (테이블 세션)

**역할**: 고객의 테이블 이용 세션

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 세션 ID |
| table_id | INTEGER | NOT NULL, FOREIGN KEY → Table(id) | 테이블 ID |
| started_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 세션 시작 시간 |
| ended_at | TIMESTAMP | NULL | 세션 종료 시간 |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (table_id)
- INDEX (ended_at)

**Business Rules**:
- ended_at이 NULL이면 활성 세션
- 테이블당 하나의 활성 세션만 존재

**Example**:
```json
{
  "id": 1,
  "table_id": 1,
  "started_at": "2026-04-06T12:00:00Z",
  "ended_at": null
}
```

---

### 5. MenuCategory (메뉴 카테고리)

**역할**: 메뉴 카테고리 (찌개류, 면류 등)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 카테고리 ID |
| store_id | INTEGER | NOT NULL, FOREIGN KEY → Store(id) | 매장 ID |
| name | VARCHAR(50) | NOT NULL | 카테고리 이름 |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 표시 순서 |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (store_id)

**Example**:
```json
{
  "id": 1,
  "store_id": 1,
  "name": "찌개류",
  "display_order": 1
}
```

---

### 6. Menu (메뉴)

**역할**: 메뉴 아이템

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 메뉴 ID |
| store_id | INTEGER | NOT NULL, FOREIGN KEY → Store(id) | 매장 ID |
| category_id | INTEGER | NOT NULL, FOREIGN KEY → MenuCategory(id) | 카테고리 ID |
| name | VARCHAR(100) | NOT NULL | 메뉴 이름 |
| description | TEXT | NULL | 메뉴 설명 |
| price | INTEGER | NOT NULL | 가격 (원) |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE | 판매 가능 여부 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (store_id)
- INDEX (category_id)

**Example**:
```json
{
  "id": 1,
  "store_id": 1,
  "category_id": 1,
  "name": "김치찌개",
  "description": "돼지고기가 들어간 김치찌개",
  "price": 8000,
  "is_available": true,
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z"
}
```

---

### 7. Order (주문)

**역할**: 고객 주문

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 주문 ID |
| store_id | INTEGER | NOT NULL, FOREIGN KEY → Store(id) | 매장 ID |
| table_id | INTEGER | NOT NULL, FOREIGN KEY → Table(id) | 테이블 ID |
| order_number | INTEGER | NOT NULL | 주문 번호 (스토어별 순차) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 주문 상태 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성 시간 |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (store_id, order_number)
- INDEX (store_id)
- INDEX (table_id)
- INDEX (status)

**Business Rules**:
- status: 'pending' → 'preparing' → 'completed' (순차 전환)
- order_number는 스토어별로 1부터 순차 증가

**Example**:
```json
{
  "id": 1,
  "store_id": 1,
  "table_id": 1,
  "order_number": 123,
  "status": "pending",
  "created_at": "2026-04-06T12:30:00Z"
}
```

---

### 8. OrderItem (주문 항목)

**역할**: 주문에 포함된 메뉴 항목

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 주문 항목 ID |
| order_id | INTEGER | NOT NULL, FOREIGN KEY → Order(id) ON DELETE CASCADE | 주문 ID |
| menu_id | INTEGER | NOT NULL, FOREIGN KEY → Menu(id) | 메뉴 ID |
| quantity | INTEGER | NOT NULL | 수량 |
| price | INTEGER | NOT NULL | 단가 (주문 당시 가격 스냅샷) |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (order_id)
- INDEX (menu_id)

**Business Rules**:
- price는 주문 당시 Menu.price를 스냅샷으로 저장
- 주문 삭제 시 OrderItem도 함께 삭제 (CASCADE)

**Example**:
```json
{
  "id": 1,
  "order_id": 1,
  "menu_id": 1,
  "quantity": 2,
  "price": 8000
}
```

---

### 9. OrderHistory (주문 히스토리)

**역할**: 완료된 주문 아카이브

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 히스토리 ID |
| session_id | INTEGER | NOT NULL, FOREIGN KEY → TableSession(id) | 세션 ID |
| order_number | INTEGER | NOT NULL | 주문 번호 |
| status | VARCHAR(20) | NOT NULL | 최종 상태 |
| total_amount | INTEGER | NOT NULL | 총 금액 |
| completed_at | TIMESTAMP | NOT NULL | 완료 시간 |
| order_data_json | TEXT | NOT NULL | 주문 전체 데이터 (JSON) |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (session_id)

**Business Rules**:
- 세션 종료 시 모든 주문이 OrderHistory로 아카이브
- order_data_json에 Order + OrderItems 전체 데이터 저장

**Example**:
```json
{
  "id": 1,
  "session_id": 1,
  "order_number": 123,
  "status": "completed",
  "total_amount": 16000,
  "completed_at": "2026-04-06T13:00:00Z",
  "order_data_json": "{\"id\":1,\"items\":[...]}"
}
```

---

## Foreign Key Relationships

| From Table | Column | References | On Delete |
|------------|--------|------------|-----------|
| Admin | store_id | Store(id) | CASCADE |
| Table | store_id | Store(id) | CASCADE |
| TableSession | table_id | Table(id) | CASCADE |
| MenuCategory | store_id | Store(id) | CASCADE |
| Menu | store_id | Store(id) | CASCADE |
| Menu | category_id | MenuCategory(id) | CASCADE |
| Order | store_id | Store(id) | CASCADE |
| Order | table_id | Table(id) | CASCADE |
| OrderItem | order_id | Order(id) | CASCADE |
| OrderItem | menu_id | Menu(id) | RESTRICT |
| OrderHistory | session_id | TableSession(id) | CASCADE |

**Total Foreign Keys**: 11개

---

## Data Consistency Rules

1. **Referential Integrity**: 모든 Foreign Key는 참조 무결성 제약 조건 적용
2. **Unique Constraints**: 
   - Admin.username (전역 유일)
   - Table(store_id, table_number) (매장 내 테이블 번호 유일)
   - Order(store_id, order_number) (매장 내 주문 번호 유일)
3. **Cascade Deletion**: 
   - Store 삭제 시 관련 모든 데이터 삭제
   - Order 삭제 시 OrderItem 함께 삭제
4. **Default Values**: 
   - Order.status = 'pending'
   - Menu.is_available = TRUE
   - Timestamp 필드 = CURRENT_TIMESTAMP

---

## Database Engine

**SQLite** (MVP)
- File-based: `table_order.db`
- No separate server process
- ACID transactions
- Limited concurrent writes (single writer)

**Migration Path**: PostgreSQL (for scaling beyond MVP)

---

**Database Schema Complete**
