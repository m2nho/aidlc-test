# Logical Components - Unit 1: Backend API & Database

Unit 1 (Backend)의 NFR 패턴을 구현하기 위한 논리적 컴포넌트와 유틸리티 클래스를 정의합니다.

---

## Document Overview

**Unit**: Unit 1 - Backend API & Database  
**Component Categories**: 7개 (Exception, Middleware, Authentication, SSE, Database, Configuration, Utilities)  
**Total Components**: 15개 논리적 컴포넌트

---

## 1. Exception Components

### 1.1 AppException (Base Exception)

**책임**: 모든 애플리케이션 예외의 기본 클래스

**속성**:
- `message: str` - 에러 메시지
- `error_code: str` - 에러 코드 (예: "ORDER_NOT_FOUND")
- `status_code: int` - HTTP 상태 코드
- `details: dict` - 추가 에러 상세 정보

**메서드**:
- `__init__(message, error_code, status_code, details)`

**파일 위치**: `app/exceptions/base.py`

---

### 1.2 AuthenticationException

**책임**: 인증 관련 예외

**서브 클래스**:
- `InvalidCredentialsException` - 잘못된 자격 증명
- `TokenExpiredException` - 토큰 만료
- `InvalidTokenException` - 유효하지 않은 토큰

**파일 위치**: `app/exceptions/auth.py`

---

### 1.3 AuthorizationException

**책임**: 권한 관련 예외

**서브 클래스**:
- `InsufficientPermissionException` - 권한 부족

**파일 위치**: `app/exceptions/auth.py`

---

### 1.4 BusinessRuleException

**책임**: 비즈니스 규칙 위반 예외

**서브 클래스**:
- `OrderNotFoundException` - 주문을 찾을 수 없음
- `OrderStatusConflictException` - 주문 상태 충돌
- `InvalidOrderStateException` - 유효하지 않은 주문 상태
- `MenuNotFoundException` - 메뉴를 찾을 수 없음
- `TableNotFoundException` - 테이블을 찾을 수 없음
- `SessionNotFoundException` - 세션을 찾을 수 없음

**파일 위치**: `app/exceptions/business.py`

---

### 1.5 ExceptionHandlerRegistry

**책임**: 글로벌 예외 핸들러 등록

**메서드**:
- `register_exception_handlers(app: FastAPI)` - 모든 예외 핸들러 등록

**파일 위치**: `app/exceptions/handlers.py`

---

## 2. Middleware Components

### 2.1 LoggingMiddleware

**책임**: 모든 HTTP 요청/응답 로깅

**기능**:
- 요청 시작 시 로깅 (메서드, 경로, 클라이언트 IP)
- 응답 완료 시 로깅 (상태 코드, 처리 시간)
- 민감 정보 필터링

**속성**:
- `logger: logging.Logger` - 로거 인스턴스

**메서드**:
- `dispatch(request, call_next)` - 미들웨어 로직

**파일 위치**: `app/middleware/logging.py`

---

### 2.2 CORSMiddleware (FastAPI 내장)

**책임**: CORS 설정 적용

**설정**:
- 개발 환경: 모든 origin 허용
- 프로덕션 환경: 특정 origin만 허용

**파일 위치**: `app/main.py` (설정)

---

## 3. Authentication Components

### 3.1 JWTManager

**책임**: JWT 토큰 생성 및 검증

**속성**:
- `secret_key: str` - JWT 시크릿 키
- `algorithm: str` - 서명 알고리즘 (HS256)
- `expire_hours: int` - 토큰 만료 시간 (16시간)

**메서드**:
- `create_token(subject: str, role: str, store_id: int) -> str` - JWT 생성
- `verify_token(token: str) -> dict` - JWT 검증 및 페이로드 반환

**의존성**: `python-jose[cryptography]`

**파일 위치**: `app/utils/jwt.py`

---

### 3.2 PasswordHasher

**책임**: 비밀번호 해싱 및 검증

**메서드**:
- `hash_password(password: str) -> str` - bcrypt 해싱
- `verify_password(plain_password: str, hashed_password: str) -> bool` - 비밀번호 검증

**파라미터**:
- bcrypt cost factor: 12

**의존성**: `bcrypt`

**파일 위치**: `app/utils/password.py`

---

### 3.3 AuthDependencies

**책임**: 인증 의존성 주입 함수

**함수**:
- `get_current_user(access_token: str = Cookie(None)) -> dict` - 현재 사용자 반환
- `get_current_customer(current_user: dict = Depends(get_current_user)) -> dict` - 고객 검증
- `get_current_admin(current_user: dict = Depends(get_current_user)) -> dict` - 관리자 검증

**반환 값**:
```python
{
    "sub": "1",           # store_id or admin_id
    "role": "customer",   # "customer" or "admin"
    "store_id": 1,
    "exp": 1234567890
}
```

**파일 위치**: `app/dependencies/auth.py`

---

## 4. SSE Components

### 4.1 SSEManager

**책임**: SSE 연결 관리 및 이벤트 브로드캐스트

**속성**:
- `connections: Dict[int, list[asyncio.Queue]]` - store_id별 연결 큐 리스트

**메서드**:
- `connect(store_id: int) -> asyncio.Queue` - 새 연결 생성
- `disconnect(store_id: int, queue: asyncio.Queue)` - 연결 제거
- `broadcast(store_id: int, event: dict)` - 이벤트 브로드캐스트

**이벤트 형식**:
```python
{
    "type": "order_created" | "order_status_updated" | "order_deleted",
    "order": {
        "id": 1,
        "order_number": 123,
        "table_number": 5,
        "status": "pending"
    }
}
```

**파일 위치**: `app/utils/sse.py`

---

### 4.2 SSEEventFormatter

**책임**: SSE 이벤트 포맷팅

**메서드**:
- `format_order_created(order: Order) -> dict` - 주문 생성 이벤트 포맷
- `format_order_status_updated(order: Order, old_status: str) -> dict` - 주문 상태 변경 이벤트 포맷
- `format_order_deleted(order_id: int) -> dict` - 주문 삭제 이벤트 포맷

**파일 위치**: `app/utils/sse.py`

---

## 5. Database Components

### 5.1 DatabaseSession

**책임**: 데이터베이스 세션 관리

**함수**:
- `get_db() -> Generator[Session, None, None]` - 세션 의존성 주입

**생명주기**:
1. `SessionLocal()` 생성
2. `yield db` (요청 처리)
3. `db.close()` (자동 정리)

**파일 위치**: `app/database/session.py`

---

### 5.2 BaseRepository

**책임**: 공통 Repository 로직

**제네릭 타입**: `T` (모델 타입)

**속성**:
- `db: Session` - 데이터베이스 세션
- `model: Type[T]` - 모델 클래스

**메서드**:
- `create(obj: T) -> T` - 생성 (자동 커밋)
- `update(obj: T) -> T` - 업데이트 (자동 커밋)
- `delete(obj: T)` - 삭제 (자동 커밋)
- `find_by_id(id: int) -> T` - ID로 조회
- `find_all() -> List[T]` - 전체 조회

**파일 위치**: `app/repositories/base.py`

---

## 6. Configuration Components

### 6.1 Settings

**책임**: 환경 설정 관리

**Base Class**: `pydantic_settings.BaseSettings`

**속성**:
```python
# Database
database_url: str = "sqlite:///./table_order.db"

# JWT
jwt_secret_key: str
jwt_algorithm: str = "HS256"
jwt_expire_hours: int = 16

# CORS
cors_origins: list[str] = ["http://localhost:3000"]

# Logging
log_level: str = "INFO"
log_file: str = "logs/app.log"

# Environment
environment: str = "development"
```

**Config**:
- `env_file = ".env"`
- `env_file_encoding = "utf-8"`

**싱글톤**: `settings = Settings()`

**파일 위치**: `app/config/settings.py`

---

### 6.2 LoggingConfig

**책임**: 로깅 설정 초기화

**함수**:
- `setup_logging(log_level: str, log_file: str)` - 로깅 설정

**설정 내용**:
- Console handler (stdout)
- File handler (rotating, 10MB, 7일 보관)
- 로그 포맷: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

**파일 위치**: `app/config/logging.py`

---

## 7. Utility Components

### 7.1 OrderNumberGenerator

**책임**: 주문 번호 생성

**메서드**:
- `generate(store_id: int, db: Session) -> int` - 스토어별 순차 번호 생성

**로직**:
1. 해당 스토어의 최대 order_number 조회
2. +1 하여 반환
3. 트랜잭션 내에서 안전하게 생성

**파일 위치**: `app/utils/order_number.py`

---

### 7.2 DateTimeUtils

**책임**: 날짜/시간 유틸리티

**메서드**:
- `utcnow() -> datetime` - 현재 UTC 시간
- `to_iso8601(dt: datetime) -> str` - ISO 8601 포맷 변환
- `from_iso8601(s: str) -> datetime` - ISO 8601 파싱

**파일 위치**: `app/utils/datetime.py`

---

### 7.3 SanitizeLogger

**책임**: 민감 정보 필터링

**메서드**:
- `sanitize_log_data(data: dict) -> dict` - 민감 정보 마스킹

**필터링 대상**:
- `password`
- `access_token`
- `jwt`
- `secret_key`

**파일 위치**: `app/utils/logging.py`

---

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                         FastAPI App                          │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
         ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
         │ Middleware  │ │  Exception  │ │   Router    │
         │             │ │  Handlers   │ │             │
         └─────────────┘ └─────────────┘ └─────────────┘
                 │                              │
                 ▼                              ▼
         ┌─────────────┐              ┌─────────────┐
         │   Logger    │              │  Service    │
         └─────────────┘              └─────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                         ▼                    ▼                    ▼
                 ┌─────────────┐    ┌─────────────┐      ┌─────────────┐
                 │ Repository  │    │ JWTManager  │      │ SSEManager  │
                 └─────────────┘    └─────────────┘      └─────────────┘
                         │                    │
                         ▼                    ▼
                 ┌─────────────┐    ┌─────────────┐
                 │ DB Session  │    │  Settings   │
                 └─────────────┘    └─────────────┘
```

---

## Component File Structure

```
app/
├── config/
│   ├── __init__.py
│   ├── settings.py          # Settings
│   └── logging.py           # LoggingConfig
├── database/
│   ├── __init__.py
│   ├── session.py           # DatabaseSession, get_db
│   └── base.py              # SQLAlchemy Base
├── models/
│   ├── __init__.py
│   ├── store.py             # Store model
│   ├── table.py             # Table, TableSession models
│   ├── admin.py             # Admin model
│   ├── menu.py              # MenuCategory, Menu models
│   └── order.py             # Order, OrderItem, OrderHistory models
├── repositories/
│   ├── __init__.py
│   ├── base.py              # BaseRepository
│   ├── store_repository.py
│   ├── order_repository.py
│   ├── table_repository.py
│   └── menu_repository.py
├── services/
│   ├── __init__.py
│   ├── auth_service.py
│   ├── order_service.py
│   ├── table_service.py
│   └── menu_service.py
├── routers/
│   ├── __init__.py
│   ├── auth_router.py
│   ├── order_router.py
│   ├── table_router.py
│   ├── menu_router.py
│   └── sse_router.py
├── schemas/
│   ├── __init__.py
│   ├── auth_schemas.py
│   ├── order_schemas.py
│   ├── table_schemas.py
│   └── menu_schemas.py
├── exceptions/
│   ├── __init__.py
│   ├── base.py              # AppException
│   ├── auth.py              # AuthenticationException, AuthorizationException
│   ├── business.py          # BusinessRuleException
│   └── handlers.py          # ExceptionHandlerRegistry
├── middleware/
│   ├── __init__.py
│   └── logging.py           # LoggingMiddleware
├── dependencies/
│   ├── __init__.py
│   └── auth.py              # AuthDependencies (get_current_user, etc.)
├── utils/
│   ├── __init__.py
│   ├── jwt.py               # JWTManager
│   ├── password.py          # PasswordHasher
│   ├── sse.py               # SSEManager, SSEEventFormatter
│   ├── order_number.py      # OrderNumberGenerator
│   ├── datetime.py          # DateTimeUtils
│   └── logging.py           # SanitizeLogger
└── main.py                  # FastAPI app 초기화
```

---

## Component Initialization Order

1. **Settings 로드** (`app/config/settings.py`)
   - .env 파일 로드
   - 환경 변수 검증

2. **Logging 설정** (`app/config/logging.py`)
   - 로깅 레벨 및 핸들러 설정

3. **Database 초기화** (`app/database/session.py`)
   - Engine 생성
   - SessionLocal 생성

4. **FastAPI App 생성** (`app/main.py`)
   - FastAPI 인스턴스 생성
   - 미들웨어 등록 (CORS, Logging)
   - 예외 핸들러 등록
   - 라우터 등록

5. **싱글톤 컴포넌트 초기화**
   - `SSEManager` 인스턴스 생성
   - `JWTManager` 인스턴스 생성 (Settings 의존)

---

## Component Testing Strategy

### Unit Testing
- **Exception Classes**: 각 예외 클래스의 속성 및 메서드 테스트
- **JWTManager**: 토큰 생성 및 검증 테스트
- **PasswordHasher**: 해싱 및 검증 테스트
- **OrderNumberGenerator**: 순차 번호 생성 테스트

### Integration Testing
- **LoggingMiddleware**: 요청/응답 로깅 테스트
- **AuthDependencies**: 인증 의존성 주입 테스트
- **SSEManager**: 연결 생성, 브로드캐스트, 연결 제거 테스트
- **BaseRepository**: CRUD 작업 테스트

---

## Component Summary Matrix

| Component | Type | Responsibility | Dependencies |
|-----------|------|----------------|--------------|
| **AppException** | Exception | 기본 예외 클래스 | - |
| **ExceptionHandlerRegistry** | Handler | 글로벌 예외 핸들러 등록 | FastAPI |
| **LoggingMiddleware** | Middleware | 요청/응답 로깅 | logging |
| **JWTManager** | Utility | JWT 생성/검증 | python-jose |
| **PasswordHasher** | Utility | 비밀번호 해싱/검증 | bcrypt |
| **AuthDependencies** | Dependency | 인증 의존성 주입 | JWTManager |
| **SSEManager** | Utility | SSE 연결 관리 | asyncio |
| **DatabaseSession** | Dependency | DB 세션 관리 | SQLAlchemy |
| **BaseRepository** | Repository | 공통 CRUD 로직 | SQLAlchemy |
| **Settings** | Config | 환경 설정 관리 | Pydantic |
| **LoggingConfig** | Config | 로깅 설정 초기화 | logging |
| **OrderNumberGenerator** | Utility | 주문 번호 생성 | SQLAlchemy |
| **DateTimeUtils** | Utility | 날짜/시간 유틸리티 | datetime |
| **SanitizeLogger** | Utility | 민감 정보 필터링 | - |

---

**Logical Components Complete**
