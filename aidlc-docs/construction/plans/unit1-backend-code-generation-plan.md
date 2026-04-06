# Code Generation Plan - Unit 1: Backend API & Database

Unit 1 (Backend API & Database)의 상세 코드 생성 계획입니다.

---

## Plan Overview

**Unit**: Unit 1 - Backend API & Database  
**Technology Stack**: Python 3.9+, FastAPI, SQLAlchemy, SQLite  
**Total Components**: 26개 (Models 9, Services 4, Repositories 4, Routers 4, Utils 5)  
**Total Steps**: 45개

**Code Location**: `backend/` (멀티 유닛 프로젝트 구조)

---

## User Stories Coverage

This unit implements the following user stories:
- TECH-001: 시드 데이터 생성
- (Backend는 모든 API를 제공하여 Customer/Admin Frontend 지원)

---

## Unit Dependencies

- **Day 0 Contract**: ✅ Complete (API Contract, Database Schema, Mock Data)
- **Functional Design**: ✅ Complete (Domain Entities, Business Logic, Business Rules)
- **NFR Design**: ✅ Complete (Design Patterns, Logical Components)

---

## Code Generation Steps

### Phase 1: Project Structure Setup (6 steps)

- [ ] **Step 1**: Create backend directory structure
  - Create `backend/` root directory
  - Create subdirectories: `app/`, `tests/`, `alembic/`, `logs/`
  - Create `backend/requirements.txt`
  - Create `backend/.env.example`
  - Create `backend/.gitignore`

- [ ] **Step 2**: Create app subdirectories
  - Create `backend/app/config/`
  - Create `backend/app/database/`
  - Create `backend/app/models/`
  - Create `backend/app/schemas/`
  - Create `backend/app/repositories/`
  - Create `backend/app/services/`
  - Create `backend/app/routers/`
  - Create `backend/app/utils/`
  - Create `backend/app/middleware/`
  - Create `backend/app/dependencies/`
  - Create `backend/app/exceptions/`

- [ ] **Step 3**: Create Python package init files
  - Create `backend/app/__init__.py`
  - Create `backend/app/config/__init__.py`
  - Create `backend/app/database/__init__.py`
  - Create `backend/app/models/__init__.py`
  - Create `backend/app/schemas/__init__.py`
  - Create `backend/app/repositories/__init__.py`
  - Create `backend/app/services/__init__.py`
  - Create `backend/app/routers/__init__.py`
  - Create `backend/app/utils/__init__.py`
  - Create `backend/app/middleware/__init__.py`
  - Create `backend/app/dependencies/__init__.py`
  - Create `backend/app/exceptions/__init__.py`

- [ ] **Step 4**: Create requirements.txt with dependencies
  - fastapi==0.104.1
  - uvicorn[standard]==0.24.0
  - sqlalchemy==2.0.23
  - alembic==1.12.1
  - pydantic==2.5.0
  - pydantic-settings==2.1.0
  - python-jose[cryptography]==3.3.0
  - bcrypt==4.1.1
  - python-dotenv==1.0.0
  - pytest==7.4.3
  - pytest-asyncio==0.21.1
  - httpx==0.25.2

- [ ] **Step 5**: Create .env.example
  - DATABASE_URL
  - JWT_SECRET_KEY
  - JWT_ALGORITHM
  - JWT_EXPIRE_HOURS
  - CORS_ORIGINS
  - LOG_LEVEL
  - LOG_FILE
  - ENVIRONMENT

- [ ] **Step 6**: Create .gitignore
  - `.env`, `__pycache__/`, `*.pyc`, `*.db`, `logs/`, `venv/`, `.pytest_cache/`

---

### Phase 2: Configuration & Settings (3 steps)

- [ ] **Step 7**: Create Settings configuration (app/config/settings.py)
  - Pydantic BaseSettings class
  - Environment variables loading
  - Database URL, JWT config, CORS config, Logging config

- [ ] **Step 8**: Create Logging configuration (app/config/logging.py)
  - setup_logging() function
  - Console + File handlers
  - Rotating file handler (10MB, 7 days)

- [ ] **Step 9**: Generate config __init__.py exports

---

### Phase 3: Database Setup (3 steps)

- [ ] **Step 10**: Create database session management (app/database/session.py)
  - Engine creation
  - SessionLocal factory
  - get_db() dependency

- [ ] **Step 11**: Create database base (app/database/base.py)
  - SQLAlchemy declarative base
  - Base class for all models

- [ ] **Step 12**: Generate database __init__.py exports

---

### Phase 4: Database Models (9 steps)

- [ ] **Step 13**: Create Store model (app/models/store.py)
  - id, name, table_count, created_at

- [ ] **Step 14**: Create Admin model (app/models/admin.py)
  - id, store_id, username, password_hash, created_at

- [ ] **Step 15**: Create Table model (app/models/table.py)
  - id, store_id, table_number, password_hash, created_at

- [ ] **Step 16**: Create TableSession model (app/models/table_session.py)
  - id, table_id, started_at, ended_at

- [ ] **Step 17**: Create MenuCategory model (app/models/menu_category.py)
  - id, store_id, name, display_order

- [ ] **Step 18**: Create Menu model (app/models/menu.py)
  - id, store_id, category_id, name, description, price, is_available, created_at, updated_at

- [ ] **Step 19**: Create Order model (app/models/order.py)
  - id, store_id, table_id, order_number, status, created_at
  - Relationships to OrderItem, Table

- [ ] **Step 20**: Create OrderItem model (app/models/order_item.py)
  - id, order_id, menu_id, quantity, price
  - Relationships to Order, Menu

- [ ] **Step 21**: Create OrderHistory model (app/models/order_history.py)
  - id, session_id, order_number, status, total_amount, completed_at, order_data_json

---

### Phase 5: Pydantic Schemas (4 steps)

- [ ] **Step 22**: Create auth schemas (app/schemas/auth_schemas.py)
  - CustomerLoginRequest, AdminLoginRequest
  - LoginResponse, LogoutResponse

- [ ] **Step 23**: Create order schemas (app/schemas/order_schemas.py)
  - OrderCreate, OrderUpdate, OrderResponse
  - OrderItemCreate, OrderItemResponse

- [ ] **Step 24**: Create table schemas (app/schemas/table_schemas.py)
  - TableSessionResponse, CompleteSessionRequest
  - ActiveTableResponse

- [ ] **Step 25**: Create menu schemas (app/schemas/menu_schemas.py)
  - MenuCreate, MenuUpdate, MenuResponse
  - MenuCategoryResponse

---

### Phase 6: Exceptions (4 steps)

- [ ] **Step 26**: Create base exception (app/exceptions/base.py)
  - AppException base class

- [ ] **Step 27**: Create auth exceptions (app/exceptions/auth.py)
  - InvalidCredentialsException, TokenExpiredException, InvalidTokenException
  - InsufficientPermissionException

- [ ] **Step 28**: Create business exceptions (app/exceptions/business.py)
  - OrderNotFoundException, OrderStatusConflictException
  - MenuNotFoundException, TableNotFoundException, SessionNotFoundException

- [ ] **Step 29**: Create exception handlers (app/exceptions/handlers.py)
  - register_exception_handlers() function
  - Global exception handlers for AppException, ValidationError, Exception

---

### Phase 7: Utilities (5 steps)

- [ ] **Step 30**: Create JWT manager (app/utils/jwt.py)
  - JWTManager class with create_token(), verify_token()

- [ ] **Step 31**: Create password hasher (app/utils/password.py)
  - PasswordHasher class with hash_password(), verify_password()

- [ ] **Step 32**: Create SSE manager (app/utils/sse.py)
  - SSEManager class with connect(), disconnect(), broadcast()

- [ ] **Step 33**: Create order number generator (app/utils/order_number.py)
  - OrderNumberGenerator class with generate()

- [ ] **Step 34**: Create datetime utils (app/utils/datetime.py)
  - DateTimeUtils with utcnow(), to_iso8601(), from_iso8601()

---

### Phase 8: Middleware (1 step)

- [ ] **Step 35**: Create logging middleware (app/middleware/logging.py)
  - LoggingMiddleware class for request/response logging

---

### Phase 9: Dependencies (1 step)

- [ ] **Step 36**: Create auth dependencies (app/dependencies/auth.py)
  - get_current_user(), get_current_customer(), get_current_admin()

---

### Phase 10: Repositories (4 steps)

- [ ] **Step 37**: Create base repository (app/repositories/base.py)
  - BaseRepository with CRUD methods

- [ ] **Step 38**: Create store repository (app/repositories/store_repository.py)
  - find_by_table_password()

- [ ] **Step 39**: Create order repository (app/repositories/order_repository.py)
  - find_by_id(), find_all_by_store(), create(), update(), delete()
  - generate_order_number()

- [ ] **Step 40**: Create menu repository (app/repositories/menu_repository.py)
  - find_all_by_store(), find_by_category(), create(), update(), delete()

---

### Phase 11: Services (4 steps)

- [ ] **Step 41**: Create auth service (app/services/auth_service.py)
  - authenticate_customer(), authenticate_admin()

- [ ] **Step 42**: Create order service (app/services/order_service.py)
  - create_order(), update_order_status(), delete_order(), get_orders()

- [ ] **Step 43**: Create table service (app/services/table_service.py)
  - get_or_create_session(), complete_session(), get_active_tables()

- [ ] **Step 44**: Create menu service (app/services/menu_service.py)
  - get_menus(), create_menu(), update_menu(), delete_menu()

---

### Phase 12: Routers (5 steps)

- [ ] **Step 45**: Create auth router (app/routers/auth_router.py)
  - POST /api/auth/login/customer
  - POST /api/auth/login/admin
  - POST /api/auth/logout

- [ ] **Step 46**: Create order router (app/routers/order_router.py)
  - GET /api/orders
  - POST /api/orders
  - GET /api/orders/{order_id}
  - PATCH /api/orders/{order_id}/status
  - DELETE /api/orders/{order_id}

- [ ] **Step 47**: Create table router (app/routers/table_router.py)
  - GET /api/tables/session
  - POST /api/tables/session/complete
  - GET /api/tables/active
  - GET /api/tables/{table_id}/history

- [ ] **Step 48**: Create menu router (app/routers/menu_router.py)
  - GET /api/menus
  - POST /api/menus
  - PATCH /api/menus/{menu_id}
  - DELETE /api/menus/{menu_id}

- [ ] **Step 49**: Create SSE router (app/routers/sse_router.py)
  - GET /api/sse/orders

---

### Phase 13: Main Application (1 step)

- [ ] **Step 50**: Create main application (backend/app/main.py)
  - FastAPI app initialization
  - CORS middleware setup
  - Logging middleware registration
  - Exception handlers registration
  - Routers registration
  - Settings initialization

---

### Phase 14: Database Migration (3 steps)

- [ ] **Step 51**: Initialize Alembic
  - Run `alembic init alembic` (in backend/)
  - Configure alembic.ini
  - Configure alembic/env.py

- [ ] **Step 52**: Create initial migration
  - Generate migration for all 9 models
  - Create `alembic/versions/001_initial_schema.py`

- [ ] **Step 53**: Create seed data script
  - Create `backend/scripts/seed_data.py`
  - Generate seed data based on mock-data-samples.json

---

### Phase 15: Testing (6 steps)

- [ ] **Step 54**: Create test fixtures (tests/conftest.py)
  - Test database setup
  - Test client fixture
  - Sample data fixtures

- [ ] **Step 55**: Create auth service tests (tests/test_auth_service.py)
  - Test customer login
  - Test admin login
  - Test invalid credentials

- [ ] **Step 56**: Create order service tests (tests/test_order_service.py)
  - Test create order
  - Test update order status
  - Test delete order

- [ ] **Step 57**: Create API integration tests (tests/test_api_integration.py)
  - Test login flow
  - Test order creation flow
  - Test SSE connection

- [ ] **Step 58**: Create repository tests (tests/test_repositories.py)
  - Test CRUD operations
  - Test query methods

- [ ] **Step 59**: Create utils tests (tests/test_utils.py)
  - Test JWT manager
  - Test password hasher
  - Test order number generator

---

### Phase 16: Documentation (3 steps)

- [ ] **Step 60**: Create README.md (backend/README.md)
  - Project overview
  - Setup instructions
  - Running instructions
  - Testing instructions

- [ ] **Step 61**: Create API documentation summary (aidlc-docs/construction/unit1-backend/code/api-documentation.md)
  - Endpoint summary
  - Authentication guide
  - Error codes reference

- [ ] **Step 62**: Create code summary (aidlc-docs/construction/unit1-backend/code/code-summary.md)
  - Component overview
  - File structure
  - Key design decisions

---

### Phase 17: Deployment Artifacts (2 steps)

- [ ] **Step 63**: Create run script (backend/run.sh)
  - Uvicorn startup script
  - Environment variable loading

- [ ] **Step 64**: Create Docker support (backend/Dockerfile) [Optional]
  - Dockerfile for containerization
  - docker-compose.yml for local development

---

## Success Criteria

- [ ] All 64 steps completed
- [ ] All 26 components implemented
- [ ] All models, services, repositories, routers functional
- [ ] Unit tests created (80%+ coverage target)
- [ ] Integration tests created
- [ ] API documentation generated
- [ ] Seed data script functional
- [ ] Application runnable with `uvicorn app.main:app`

---

## Story Traceability

- TECH-001 (시드 데이터): Step 53 (seed_data.py)
- Customer Login API: Steps 45, 41 (auth router, auth service)
- Order Management API: Steps 46, 42 (order router, order service)
- Menu Management API: Steps 48, 44 (menu router, menu service)
- SSE Real-time Updates: Steps 49, 32 (SSE router, SSE manager)

---

**Plan Complete** - 사용자 승인 대기 중
