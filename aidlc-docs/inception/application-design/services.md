# Service Layer Design

서비스 레이어의 정의, 책임, 오케스트레이션 패턴을 정의합니다.

---

## Service Layer Purpose

서비스 레이어는 다음을 담당합니다:
- **비즈니스 로직 구현**: 도메인 규칙 및 검증
- **오케스트레이션**: 여러 Repository 및 리소스 조율
- **트랜잭션 관리**: 데이터 일관성 보장
- **외부 서비스 통합**: SSE, 인증 등
- **에러 처리 및 로깅**

---

## Service Definitions

### 1. AuthService

**Purpose**: 인증 및 권한 관리

**Responsibilities**:
1. 테이블 로그인 인증
2. 관리자 로그인 인증
3. JWT 토큰 생성 및 검증
4. 세션 관리
5. 비밀번호 해싱 및 검증

**Dependencies**:
- TableRepository (테이블 정보 조회)
- AdminRepository (관리자 정보 조회)
- JWTUtil (JWT 처리)
- PasswordUtil (비밀번호 처리)

**Orchestration Pattern**:
```python
# 관리자 로그인 플로우
def login_admin(store_id, username, password):
    1. AdminRepository로 관리자 조회
    2. 관리자 존재 여부 확인
    3. PasswordUtil로 비밀번호 검증
    4. 로그인 시도 횟수 확인 (5회 제한)
    5. JWTUtil로 토큰 생성 (16시간 만료)
    6. 토큰 반환
```

**Error Handling**:
- Invalid credentials → 401 Unauthorized
- Too many login attempts → 429 Too Many Requests
- Invalid store ID → 404 Not Found

**Transaction Management**: 읽기 전용 (트랜잭션 불필요)

---

### 2. OrderService

**Purpose**: 주문 비즈니스 로직 및 실시간 이벤트 관리

**Responsibilities**:
1. 주문 생성 및 검증
2. 주문 상태 관리 (대기중/준비중/완료)
3. 주문 조회 (세션별, 테이블별, 매장별)
4. 주문 삭제 및 총액 재계산
5. SSE 실시간 이벤트 브로드캐스트
6. 주문 이력 아카이빙

**Dependencies**:
- OrderRepository (주문 데이터 접근)
- MenuRepository (메뉴 정보 조회 및 가격 검증)
- TableRepository (테이블 세션 검증)
- SSEManager (실시간 이벤트 전송)

**Orchestration Pattern**:
```python
# 주문 생성 플로우
def create_order(table_id, session_id, order_items):
    1. 트랜잭션 시작
    2. TableRepository로 세션 유효성 확인
    3. MenuRepository로 각 메뉴 ID 및 가격 검증
    4. 총액 계산
    5. OrderRepository로 주문 헤더 생성
    6. OrderRepository로 주문 아이템 생성
    7. 트랜잭션 커밋
    8. SSEManager로 실시간 이벤트 브로드캐스트
    9. 주문 객체 반환
```

```python
# 주문 삭제 플로우
def delete_order(order_id):
    1. 트랜잭션 시작
    2. OrderRepository로 주문 조회
    3. 주문 존재 확인
    4. OrderRepository로 주문 삭제
    5. 트랜잭션 커밋
    6. SSEManager로 삭제 이벤트 브로드캐스트
    7. 성공 반환
```

```python
# 주문 이력 아카이빙 플로우
def archive_orders(session_id):
    1. 트랜잭션 시작
    2. OrderRepository로 세션의 모든 주문 조회
    3. 각 주문을 OrderHistory로 복사
    4. OrderRepository로 원본 주문 삭제
    5. 트랜잭션 커밋
```

**Error Handling**:
- Invalid menu ID → 400 Bad Request
- Invalid session → 403 Forbidden
- Insufficient data → 400 Bad Request

**Transaction Management**: 
- 주문 생성: 트랜잭션 필요 (주문 + 아이템 원자적 생성)
- 주문 삭제: 트랜잭션 필요
- 주문 조회: 읽기 전용

**Real-time Events**:
- `order.created`: 새 주문 생성 시
- `order.status_changed`: 상태 변경 시
- `order.deleted`: 주문 삭제 시

---

### 3. TableService

**Purpose**: 테이블 및 세션 관리

**Responsibilities**:
1. 테이블 세션 생성 및 종료
2. 테이블 상태 조회
3. 테이블 초기 설정
4. 테이블별 주문 집계

**Dependencies**:
- TableRepository (테이블 데이터 접근)
- OrderRepository (주문 데이터 조회)
- OrderService (주문 아카이빙 위임)

**Orchestration Pattern**:
```python
# 테이블 세션 종료 플로우
def complete_table_session(table_id):
    1. 트랜잭션 시작
    2. TableRepository로 현재 활성 세션 조회
    3. 세션 존재 확인
    4. OrderService로 주문 아카이빙 위임
    5. TableRepository로 세션 종료 (completed_at 업데이트)
    6. TableRepository로 테이블의 current_session_id 클리어
    7. 트랜잭션 커밋
    8. 성공 반환
```

```python
# 테이블 주문 집계 플로우
def get_table_order_summary(table_id):
    1. TableRepository로 현재 세션 조회
    2. OrderRepository로 세션의 모든 주문 조회
    3. 총액 계산
    4. 주문 목록 및 총액 반환
```

**Error Handling**:
- No active session → 404 Not Found
- Invalid table ID → 404 Not Found

**Transaction Management**:
- 세션 종료: 트랜잭션 필요 (주문 아카이빙 + 세션 종료 원자적)
- 세션 생성: 트랜잭션 필요
- 상태 조회: 읽기 전용

---

### 4. MenuService

**Purpose**: 메뉴 관리 비즈니스 로직

**Responsibilities**:
1. 메뉴 CRUD
2. 카테고리 관리
3. 메뉴 유효성 검증
4. 메뉴 조회 (카테고리별, 매장별)

**Dependencies**:
- MenuRepository (메뉴 데이터 접근)

**Orchestration Pattern**:
```python
# 메뉴 생성 플로우
def create_menu(menu_data):
    1. 메뉴 데이터 유효성 검증
        - 필수 필드 확인 (name, price, category_id)
        - 가격 범위 확인 (>= 0)
    2. 트랜잭션 시작
    3. MenuRepository로 카테고리 존재 확인
    4. MenuRepository로 메뉴 생성
    5. 트랜잭션 커밋
    6. 생성된 메뉴 반환
```

```python
# 메뉴 수정 플로우
def update_menu(menu_id, menu_data):
    1. 메뉴 데이터 유효성 검증
    2. 트랜잭션 시작
    3. MenuRepository로 기존 메뉴 조회
    4. 메뉴 존재 확인
    5. 변경 사항 적용
    6. MenuRepository로 메뉴 업데이트
    7. 트랜잭션 커밋
    8. 업데이트된 메뉴 반환
```

**Error Handling**:
- Invalid price → 400 Bad Request
- Missing required fields → 400 Bad Request
- Category not found → 404 Not Found
- Menu not found → 404 Not Found

**Transaction Management**:
- 메뉴 생성/수정/삭제: 트랜잭션 필요
- 메뉴 조회: 읽기 전용

---

## Service Interaction Patterns

### Pattern 1: Service → Repository (Direct)
단일 Repository 호출, 단순 CRUD

```python
# AuthService → AdminRepository
admin = admin_repository.get_by_username(store_id, username)
```

### Pattern 2: Service → Multiple Repositories (Orchestration)
여러 Repository 조율, 비즈니스 로직 적용

```python
# OrderService → MenuRepository + OrderRepository
menu = menu_repository.get_by_id(menu_id)
validate_menu(menu)
order = order_repository.create(order_data)
```

### Pattern 3: Service → Service (Delegation)
다른 Service에 특정 책임 위임

```python
# TableService → OrderService
order_service.archive_orders(session_id)
```

### Pattern 4: Service → Utility (Helper)
유틸리티 함수 활용

```python
# AuthService → JWTUtil
token = jwt_util.encode_token(payload, secret_key, expiry_hours)
```

### Pattern 5: Service → External Service (Integration)
외부 서비스 통합 (SSE)

```python
# OrderService → SSEManager
sse_manager.broadcast(store_id, event_data)
```

---

## Transaction Management Strategy

### Transaction Scope

**트랜잭션 필요 (Write Operations)**:
- 주문 생성 (Order + OrderItems)
- 주문 삭제
- 주문 상태 변경
- 세션 종료 (Session + 주문 아카이빙)
- 메뉴 CRUD

**트랜잭션 불필요 (Read Operations)**:
- 주문 조회
- 메뉴 조회
- 테이블 상태 조회
- 인증 확인

### Transaction Implementation

```python
# Context Manager 패턴 사용
with database_session.get_session() as session:
    try:
        # 비즈니스 로직
        order = order_repository.create(order_data, session)
        order_items = order_repository.create_order_items(items, session)
        
        # 커밋
        database_session.commit_session(session)
        return order
    except Exception as e:
        # 롤백
        database_session.rollback_session(session)
        raise e
```

---

## Error Handling Strategy

### Error Types

1. **Validation Errors (400 Bad Request)**:
   - 필수 필드 누락
   - 잘못된 데이터 형식
   - 범위 초과 값

2. **Authentication Errors (401 Unauthorized)**:
   - 잘못된 인증 정보
   - 만료된 토큰

3. **Authorization Errors (403 Forbidden)**:
   - 권한 없음
   - 잘못된 세션

4. **Not Found Errors (404 Not Found)**:
   - 리소스 없음
   - 잘못된 ID

5. **Rate Limiting (429 Too Many Requests)**:
   - 로그인 시도 초과

6. **Server Errors (500 Internal Server Error)**:
   - 예상치 못한 에러
   - 데이터베이스 연결 실패

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_MENU_ID",
    "message": "Menu with ID 'abc123' does not exist",
    "details": {
      "menu_id": "abc123"
    }
  }
}
```

---

## Logging Strategy

### Log Levels

- **DEBUG**: 상세한 디버깅 정보
- **INFO**: 주요 이벤트 (주문 생성, 로그인 성공)
- **WARNING**: 경고 (로그인 실패 3회)
- **ERROR**: 에러 (예외 발생)
- **CRITICAL**: 치명적 에러 (서버 다운)

### Log Format

```python
logger.info(
    "Order created",
    extra={
        "order_id": order.id,
        "table_id": order.table_id,
        "total_amount": order.total_amount,
        "timestamp": datetime.now().isoformat()
    }
)
```

---

## Performance Optimization

### Caching Strategy

**캐시 대상 (읽기 빈도 높음)**:
- 메뉴 목록 (자주 변경되지 않음)
- 카테고리 목록

**캐시 불필요**:
- 주문 데이터 (실시간성 중요)
- 세션 데이터

### Database Query Optimization

- **Eager Loading**: 관련 데이터 함께 로드 (Order + OrderItems)
- **Indexing**: 자주 조회되는 컬럼 인덱스 (table_id, session_id, store_id)
- **Pagination**: 대량 데이터 조회 시 페이지네이션

---

## Service Layer Summary

| Service | Primary Responsibility | Key Dependencies | Transaction Needed |
|---|---|---|---|
| AuthService | 인증 및 권한 | AdminRepository, TableRepository, JWTUtil | No |
| OrderService | 주문 관리 및 SSE | OrderRepository, MenuRepository, SSEManager | Yes |
| TableService | 테이블 세션 관리 | TableRepository, OrderService | Yes |
| MenuService | 메뉴 관리 | MenuRepository | Yes (CRUD) |

**Total Services**: 4
**Total Orchestration Patterns**: 5
**Key Integration**: SSE (real-time events)
