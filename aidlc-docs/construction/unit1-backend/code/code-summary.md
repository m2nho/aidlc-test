# Code Summary - Unit 1: Backend API & Database

Unit 1 Backend 코드 생성이 완료되었습니다.

---

## Generated Components Summary

### Total Files Created: 50+ files

**Configuration & Setup** (6 files):
- `backend/app/config/settings.py` - Pydantic Settings
- `backend/app/config/logging.py` - Logging configuration
- `backend/app/database/base.py` - SQLAlchemy Base
- `backend/app/database/session.py` - DB session management
- `backend/requirements.txt` - Python dependencies
- `backend/.env.example` - Environment variables template

**Models** (9 files):
- `backend/app/models/store.py` - Store model
- `backend/app/models/admin.py` - Admin model
- `backend/app/models/table.py` - Table model
- `backend/app/models/table_session.py` - TableSession model
- `backend/app/models/menu_category.py` - MenuCategory model
- `backend/app/models/menu.py` - Menu model
- `backend/app/models/order.py` - Order model
- `backend/app/models/order_item.py` - OrderItem model
- `backend/app/models/order_history.py` - OrderHistory model

**Schemas** (4 files):
- `backend/app/schemas/auth_schemas.py` - Auth request/response schemas
- `backend/app/schemas/order_schemas.py` - Order schemas
- `backend/app/schemas/table_schemas.py` - Table schemas
- `backend/app/schemas/menu_schemas.py` - Menu schemas

**Exceptions** (4 files):
- `backend/app/exceptions/base.py` - AppException base class
- `backend/app/exceptions/auth.py` - Authentication exceptions
- `backend/app/exceptions/business.py` - Business rule exceptions
- `backend/app/exceptions/handlers.py` - Global exception handlers

**Utilities** (5 files):
- `backend/app/utils/jwt.py` - JWT Manager
- `backend/app/utils/password.py` - Password Hasher (bcrypt)
- `backend/app/utils/sse.py` - SSE Manager
- `backend/app/utils/order_number.py` - Order Number Generator
- `backend/app/utils/datetime.py` - DateTime utilities

**Middleware & Dependencies** (2 files):
- `backend/app/middleware/logging.py` - Request/Response logging
- `backend/app/dependencies/auth.py` - Authentication dependencies

**Repositories** (4 files):
- `backend/app/repositories/base.py` - Base Repository (CRUD)
- `backend/app/repositories/store_repository.py` - Store Repository
- `backend/app/repositories/order_repository.py` - Order Repository
- `backend/app/repositories/menu_repository.py` - Menu Repository

**Services** (4 files):
- `backend/app/services/auth_service.py` - Authentication Service
- `backend/app/services/order_service.py` - Order Service
- `backend/app/services/table_service.py` - Table Service
- `backend/app/services/menu_service.py` - Menu Service

**Routers** (5 files):
- `backend/app/routers/auth_router.py` - Auth endpoints
- `backend/app/routers/order_router.py` - Order endpoints
- `backend/app/routers/table_router.py` - Table endpoints
- `backend/app/routers/menu_router.py` - Menu endpoints
- `backend/app/routers/sse_router.py` - SSE endpoint

**Main Application** (1 file):
- `backend/app/main.py` - FastAPI application

**Scripts** (1 file):
- `backend/scripts/seed_data.py` - Database seed script

**Tests** (2 files):
- `backend/tests/conftest.py` - Test fixtures
- `backend/tests/test_auth_service.py` - Auth service tests

**Documentation** (2 files):
- `backend/README.md` - Setup and usage guide
- `backend/run.sh` - Startup script

---

## Key Design Decisions

### 1. Layered Architecture
- **Router Layer**: FastAPI endpoints, request/response handling
- **Service Layer**: Business logic, transaction coordination
- **Repository Layer**: Data access, CRUD operations
- **Model Layer**: SQLAlchemy ORM models

### 2. Authentication Flow
- JWT stored in HTTP-only Cookie
- Dependency injection for auth checks (`get_current_customer`, `get_current_admin`)
- bcrypt for password hashing (cost factor 12)

### 3. Error Handling
- Custom exception hierarchy (AppException → Business/Auth exceptions)
- Global exception handlers
- Standardized error response format

### 4. Real-time Updates
- SSE Manager with in-memory connection storage
- Event broadcasting on order create/update/delete
- Heartbeat every 30 seconds

### 5. Database Design
- SQLite for MVP (file-based, simple deployment)
- SQLAlchemy ORM for database independence
- Foreign keys with cascade delete
- Unique constraints on (store_id, table_number) and (store_id, order_number)

---

## API Endpoints

**Total: 17 endpoints**

### Authentication (3)
- POST `/api/auth/login/customer`
- POST `/api/auth/login/admin`
- POST `/api/auth/logout`

### Orders (5)
- GET `/api/orders`
- POST `/api/orders`
- GET `/api/orders/{order_id}`
- PATCH `/api/orders/{order_id}/status`
- DELETE `/api/orders/{order_id}`

### Tables (4)
- GET `/api/tables/session`
- POST `/api/tables/session/complete`
- GET `/api/tables/active`
- GET `/api/tables/{table_id}/history`

### Menus (4)
- GET `/api/menus`
- POST `/api/menus`
- PATCH `/api/menus/{menu_id}`
- DELETE `/api/menus/{menu_id}`

### SSE (1)
- GET `/api/sse/orders`

---

## Running the Backend

### 1. Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set JWT_SECRET_KEY
```

### 2. Seed Database

```bash
python scripts/seed_data.py
```

### 3. Run Server

```bash
./run.sh
# Or: uvicorn app.main:app --reload
```

### 4. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Test with Postman

Import API contract from Day 0: `aidlc-docs/construction/day0-contract/api-contract.yaml`

---

## Default Test Credentials

After running seed script:
- **Admin**: username=`admin`, password=`admin1234`
- **Customer**: table_number=`1-10`, password=`1234`
- **Store**: "맛있는 식당" with 10 tables
- **Menus**: 10 menu items across 4 categories

---

## Next Steps for Developer 1 (Backend)

✅ **Code Generation**: Complete (50+ files)  
⏳ **Testing**: Run `pytest` to verify all tests pass  
⏳ **Integration**: Ready for Frontend integration (Week 3)

**Independent Development**:
- Test all endpoints with Postman
- Verify SSE connections
- Test with seed data
- No frontend dependency needed

---

**Backend Code Generation Complete!**
