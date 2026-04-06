# NFR Design Patterns - Unit 1: Backend API & Database

Unit 1 (Backend)의 비기능적 요구사항을 구현하기 위한 설계 패턴을 정의합니다.

---

## Document Overview

**Unit**: Unit 1 - Backend API & Database  
**Pattern Categories**: 8개 (Error Handling, Logging, Authentication, Transaction, SSE, DB Session, Configuration, Password Hashing)  
**Design Approach**: 계층 분리, 의존성 주입, 재사용 가능한 유틸리티

---

## 1. Error Handling Pattern

### 1.1 Custom Exception Class Hierarchy

**설계 원칙**: 비즈니스 예외와 HTTP 계층 분리

**예외 클래스 계층 구조**:
```
AppException (Base)
├── AuthenticationException
│   ├── InvalidCredentialsException
│   ├── TokenExpiredException
│   └── InvalidTokenException
├── AuthorizationException
│   └── InsufficientPermissionException
├── BusinessRuleException
│   ├── OrderNotFoundException
│   ├── OrderStatusConflictException
│   ├── InvalidOrderStateException
│   ├── MenuNotFoundException
│   ├── TableNotFoundException
│   └── SessionNotFoundException
└── ValidationException
    ├── InvalidInputException
    └── MissingRequiredFieldException
```

**Base Exception 설계**:
```python
class AppException(Exception):
    """Base exception for all application exceptions"""
    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int = 500,
        details: dict = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)
```

**구체적 예외 예시**:
```python
class InvalidCredentialsException(AuthenticationException):
    def __init__(self, details: dict = None):
        super().__init__(
            message="Invalid credentials",
            error_code="AUTH_INVALID_CREDENTIALS",
            status_code=401,
            details=details
        )

class OrderNotFoundException(BusinessRuleException):
    def __init__(self, order_id: int):
        super().__init__(
            message=f"Order {order_id} not found",
            error_code="ORDER_NOT_FOUND",
            status_code=404,
            details={"order_id": order_id}
        )
```

---

### 1.2 Global Exception Handler

**설계**: FastAPI의 exception_handler 데코레이터 활용

**글로벌 핸들러 구조**:
```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        )
    
    @app.exception_handler(ValidationError)  # Pydantic
    async def validation_exception_handler(request: Request, exc: ValidationError):
        return JSONResponse(
            status_code=400,
            content={
                "error": "VALIDATION_ERROR",
                "message": "Invalid request data",
                "details": exc.errors()
            }
        )
    
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        # Log the exception
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        )
```

**에러 응답 표준 형식**:
```json
{
  "error": "ORDER_NOT_FOUND",
  "message": "Order 123 not found",
  "details": {
    "order_id": 123
  }
}
```

---

### 1.3 Exception Usage in Layers

**Service Layer**:
```python
class OrderService:
    def get_order(self, order_id: int) -> Order:
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise OrderNotFoundException(order_id)
        return order
```

**Router Layer** (예외는 자동으로 글로벌 핸들러에서 처리):
```python
@router.get("/orders/{order_id}")
def get_order(order_id: int, service: OrderService = Depends()):
    # 예외는 Service에서 발생, 글로벌 핸들러가 처리
    return service.get_order(order_id)
```

---

## 2. Logging Pattern

### 2.1 Logging Configuration

**환경별 로깅 레벨**:
- 개발 환경: `DEBUG`
- 프로덕션 환경: `INFO`

**로깅 설정 구조**:
```python
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(log_level: str, log_file: str):
    # Root logger 설정
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # File handler (로테이션)
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=7  # 7일 보관
    )
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    ))
    
    # Root logger에 핸들러 추가
    logging.getLogger().addHandler(file_handler)
```

---

### 2.2 Request/Response Logging Middleware

**미들웨어 설계**:
```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 요청 시작 시간
        start_time = time.time()
        
        # 요청 로그
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host}"
        )
        
        # 요청 처리
        response = await call_next(request)
        
        # 응답 시간 계산
        process_time = time.time() - start_time
        
        # 응답 로그
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code} "
            f"duration={process_time:.3f}s"
        )
        
        return response
```

**민감 정보 필터링**:
```python
SENSITIVE_FIELDS = ["password", "access_token", "jwt"]

def sanitize_log_data(data: dict) -> dict:
    """민감 정보를 마스킹"""
    sanitized = data.copy()
    for key in SENSITIVE_FIELDS:
        if key in sanitized:
            sanitized[key] = "***REDACTED***"
    return sanitized
```

---

### 2.3 Business Event Logging

**비즈니스 이벤트 로깅 예시**:
```python
class OrderService:
    def create_order(self, order_data: OrderCreate) -> Order:
        order = self.order_repo.create(order_data)
        logger.info(
            f"Order created: order_id={order.id}, "
            f"table_id={order.table_id}, "
            f"order_number={order.order_number}"
        )
        return order
    
    def update_order_status(self, order_id: int, status: OrderStatus):
        order = self.get_order(order_id)
        old_status = order.status
        order.status = status
        self.order_repo.update(order)
        logger.info(
            f"Order status updated: order_id={order_id}, "
            f"{old_status} -> {status}"
        )
```

---

## 3. Authentication & Authorization Pattern

### 3.1 JWT Utility Class

**JWT Manager 설계**:
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str, expire_hours: int):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expire_hours = expire_hours
    
    def create_token(self, subject: str, role: str, store_id: int) -> str:
        """JWT 토큰 생성"""
        expire = datetime.utcnow() + timedelta(hours=self.expire_hours)
        payload = {
            "sub": subject,  # store_id or admin_id
            "role": role,    # "customer" or "admin"
            "store_id": store_id,
            "exp": expire
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        """JWT 토큰 검증 및 페이로드 반환"""
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[self.algorithm]
            )
            return payload
        except JWTError as e:
            raise InvalidTokenException(str(e))
```

---

### 3.2 Authentication Dependency

**인증 의존성 주입**:
```python
from fastapi import Depends, Cookie, HTTPException

async def get_current_user(
    access_token: str = Cookie(None),
    jwt_manager: JWTManager = Depends()
) -> dict:
    """현재 인증된 사용자 정보 반환"""
    if not access_token:
        raise AuthenticationException("No access token provided")
    
    payload = jwt_manager.verify_token(access_token)
    return payload

async def get_current_customer(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Customer 역할 검증"""
    if current_user["role"] != "customer":
        raise AuthorizationException("Customer access required")
    return current_user

async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Admin 역할 검증"""
    if current_user["role"] != "admin":
        raise AuthorizationException("Admin access required")
    return current_user
```

**라우터에서 사용**:
```python
@router.post("/orders")
def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_customer),
    service: OrderService = Depends()
):
    # current_user는 인증된 고객 정보
    return service.create_order(order_data, current_user["store_id"])

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: OrderStatus,
    current_user: dict = Depends(get_current_admin),
    service: OrderService = Depends()
):
    # current_user는 인증된 관리자 정보
    return service.update_order_status(order_id, status)
```

---

### 3.3 HTTP-only Cookie Setting

**로그인 응답에서 쿠키 설정**:
```python
from fastapi import Response

@router.post("/auth/login/customer")
def customer_login(
    credentials: CustomerLoginRequest,
    response: Response,
    service: AuthService = Depends(),
    jwt_manager: JWTManager = Depends()
):
    # 인증 검증
    store = service.authenticate_customer(credentials)
    
    # JWT 생성
    token = jwt_manager.create_token(
        subject=str(store.id),
        role="customer",
        store_id=store.id
    )
    
    # HTTP-only Cookie 설정
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # 개발: False, 프로덕션: True
        samesite="lax",
        max_age=jwt_manager.expire_hours * 3600
    )
    
    return {"message": "Login successful"}
```

---

## 4. Transaction Management Pattern

### 4.1 Repository-Level Transaction

**설계 원칙**: Repository 메서드가 트랜잭션 경계

**Database Session Dependency**:
```python
from sqlalchemy.orm import Session

def get_db() -> Session:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Repository Base Class**:
```python
from sqlalchemy.orm import Session
from typing import TypeVar, Generic, Type

T = TypeVar('T')

class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model
    
    def create(self, obj: T) -> T:
        """생성 (자동 트랜잭션)"""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def update(self, obj: T) -> T:
        """업데이트 (자동 트랜잭션)"""
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def delete(self, obj: T):
        """삭제 (자동 트랜잭션)"""
        self.db.delete(obj)
        self.db.commit()
    
    def find_by_id(self, id: int) -> T:
        """조회 (읽기 전용)"""
        return self.db.query(self.model).filter(self.model.id == id).first()
```

---

### 4.2 Multi-Step Transaction Handling

**Service Layer에서 여러 Repository 호출 시**:
```python
class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.order_item_repo = OrderItemRepository(db)
    
    def create_order_with_items(
        self, order_data: OrderCreate
    ) -> Order:
        """주문 및 주문 항목 생성 (단일 트랜잭션)"""
        try:
            # Order 생성
            order = Order(
                table_id=order_data.table_id,
                store_id=order_data.store_id,
                status="pending"
            )
            self.db.add(order)
            self.db.flush()  # ID 생성 (커밋 전)
            
            # OrderItems 생성
            for item_data in order_data.items:
                order_item = OrderItem(
                    order_id=order.id,
                    menu_id=item_data.menu_id,
                    quantity=item_data.quantity,
                    price=item_data.price
                )
                self.db.add(order_item)
            
            # 커밋
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception as e:
            # 롤백
            self.db.rollback()
            logger.error(f"Failed to create order: {e}")
            raise
```

---

## 5. SSE Connection Management Pattern

### 5.1 In-Memory Connection Storage

**SSE Manager 설계**:
```python
from typing import Dict
from fastapi import Response
from starlette.responses import StreamingResponse
import asyncio

class SSEManager:
    def __init__(self):
        # store_id -> list of queues
        self.connections: Dict[int, list] = {}
    
    def connect(self, store_id: int) -> asyncio.Queue:
        """새 SSE 연결 생성"""
        queue = asyncio.Queue()
        if store_id not in self.connections:
            self.connections[store_id] = []
        self.connections[store_id].append(queue)
        logger.info(f"SSE connection added for store {store_id}")
        return queue
    
    def disconnect(self, store_id: int, queue: asyncio.Queue):
        """SSE 연결 제거"""
        if store_id in self.connections:
            self.connections[store_id].remove(queue)
            if not self.connections[store_id]:
                del self.connections[store_id]
        logger.info(f"SSE connection removed for store {store_id}")
    
    async def broadcast(self, store_id: int, event: dict):
        """특정 store의 모든 연결에 이벤트 브로드캐스트"""
        if store_id not in self.connections:
            return
        
        for queue in self.connections[store_id]:
            await queue.put(event)
```

---

### 5.2 SSE Endpoint Implementation

**SSE 엔드포인트**:
```python
@router.get("/sse/orders")
async def sse_orders(
    current_user: dict = Depends(get_current_admin),
    sse_manager: SSEManager = Depends()
):
    """Admin용 실시간 주문 스트림"""
    store_id = current_user["store_id"]
    queue = sse_manager.connect(store_id)
    
    async def event_generator():
        try:
            while True:
                # Heartbeat (30초마다)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat 전송
                    yield f": heartbeat\n\n"
        except asyncio.CancelledError:
            # 연결 종료
            sse_manager.disconnect(store_id, queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

---

### 5.3 Event Broadcasting

**Service에서 이벤트 브로드캐스트**:
```python
class OrderService:
    def __init__(self, db: Session, sse_manager: SSEManager):
        self.db = db
        self.sse_manager = sse_manager
    
    async def create_order(self, order_data: OrderCreate) -> Order:
        order = self.order_repo.create(order_data)
        
        # SSE 이벤트 브로드캐스트
        await self.sse_manager.broadcast(order.store_id, {
            "type": "order_created",
            "order": {
                "id": order.id,
                "order_number": order.order_number,
                "table_number": order.table.table_number,
                "status": order.status
            }
        })
        
        return order
```

---

## 6. Database Session Management Pattern

### 6.1 Dependency Injection for DB Session

**세션 의존성 주입**:
```python
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine

# Engine 및 SessionLocal 초기화
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**라우터에서 사용**:
```python
@router.get("/orders")
def get_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    orders = db.query(Order).filter(
        Order.store_id == current_user["store_id"]
    ).all()
    return orders
```

---

## 7. Configuration Management Pattern

### 7.1 Pydantic Settings

**Settings 클래스 설계**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
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
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# 싱글톤 인스턴스
settings = Settings()
```

**의존성 주입으로 사용**:
```python
def get_settings() -> Settings:
    return settings

@router.get("/config")
def get_config(settings: Settings = Depends(get_settings)):
    return {"environment": settings.environment}
```

---

## 8. Password Hashing Pattern

### 8.1 Password Utility Class

**bcrypt 래퍼 유틸리티**:
```python
import bcrypt

class PasswordHasher:
    @staticmethod
    def hash_password(password: str) -> str:
        """비밀번호 해싱"""
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """비밀번호 검증"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
```

**Service에서 사용**:
```python
class AuthService:
    def authenticate_customer(self, credentials: CustomerLoginRequest) -> Store:
        store = self.store_repo.find_by_table_password(
            credentials.table_number,
            credentials.password
        )
        if not store:
            raise InvalidCredentialsException()
        
        # 비밀번호 검증
        if not PasswordHasher.verify_password(
            credentials.password,
            store.table_password_hash
        ):
            raise InvalidCredentialsException()
        
        return store
```

---

## Pattern Summary Matrix

| Pattern | Implementation | Key Component | Layer |
|---------|----------------|---------------|-------|
| Error Handling | Custom Exception Classes + Global Handler | AppException, exception_handler | Cross-cutting |
| Logging | Custom Middleware + Business Logging | LoggingMiddleware, logger | Cross-cutting |
| Authentication | JWT + Dependency Injection | JWTManager, get_current_user | Router, Service |
| Authorization | Role-based Depends | get_current_customer, get_current_admin | Router |
| Transaction | Repository-level Auto-commit | BaseRepository, get_db | Repository |
| SSE | In-Memory Queue + Broadcast | SSEManager, asyncio.Queue | Service, Router |
| DB Session | Dependency Injection | get_db, SessionLocal | Repository |
| Configuration | Pydantic Settings | Settings, get_settings | Cross-cutting |
| Password | bcrypt Utility | PasswordHasher | Service |

---

**NFR Design Patterns Complete**
