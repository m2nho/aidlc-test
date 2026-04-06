# Table Order Service - Backend API

Unit 1: Backend API & Database for MVP 테이블오더 서비스

## Overview

Python FastAPI 기반 RESTful API 서버
- **Technology**: Python 3.9+, FastAPI, SQLAlchemy, SQLite
- **Architecture**: Layered (Router → Service → Repository → Database)
- **Authentication**: JWT (HTTP-only Cookie)
- **Real-time**: Server-Sent Events (SSE)

## Features

- ✅ Customer/Admin Authentication
- ✅ Menu Management
- ✅ Order Management  
- ✅ Table Session Management
- ✅ Real-time Order Updates (SSE)
- ✅ RESTful API (OpenAPI 3.0)

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET_KEY
```

### 3. Create Database & Seed Data

```bash
python scripts/seed_data.py
```

## Running the Server

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Testing

### Run Tests

```bash
pytest
```

### Test Coverage

```bash
pytest --cov=app --cov-report=html
```

## API Endpoints

### Authentication
- `POST /api/auth/login/customer` - Customer login
- `POST /api/auth/login/admin` - Admin login
- `POST /api/auth/logout` - Logout

### Orders
- `GET /api/orders` - Get orders (admin)
- `POST /api/orders` - Create order (customer)
- `GET /api/orders/{order_id}` - Get order
- `PATCH /api/orders/{order_id}/status` - Update status (admin)
- `DELETE /api/orders/{order_id}` - Delete order (admin)

### Tables
- `GET /api/tables/session` - Get/create session
- `POST /api/tables/session/complete` - Complete session (admin)
- `GET /api/tables/active` - Get active tables (admin)
- `GET /api/tables/{table_id}/history` - Get history (admin)

### Menus
- `GET /api/menus` - Get menus
- `POST /api/menus` - Create menu (admin)
- `PATCH /api/menus/{menu_id}` - Update menu (admin)
- `DELETE /api/menus/{menu_id}` - Delete menu (admin)

### SSE
- `GET /api/sse/orders` - Real-time order stream (admin)

## Default Credentials

After running seed_data.py:
- **Admin**: username=`admin`, password=`admin1234`
- **Customer (Tables 1-10)**: table_number=`1-10`, password=`1234`

## Directory Structure

```
backend/
├── app/
│   ├── config/          # Settings & logging
│   ├── database/        # DB session & base
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic
│   ├── routers/         # API endpoints
│   ├── utils/           # JWT, password, SSE
│   ├── middleware/      # Logging middleware
│   ├── dependencies/    # Auth dependencies
│   ├── exceptions/      # Custom exceptions
│   └── main.py          # FastAPI application
├── tests/               # Unit & integration tests
├── scripts/             # Seed data scripts
├── logs/                # Log files
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## Development

### Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/
```

### Database Migrations

(Alembic setup - to be implemented)

## Deployment

### Docker (Optional)

```bash
docker build -t table-order-backend .
docker run -p 8000:8000 table-order-backend
```

## Troubleshooting

### Database locked error
- SQLite has limited concurrent write support
- Restart the server or delete `table_order.db` and re-seed

### JWT secret key error
- Make sure `.env` file has `JWT_SECRET_KEY` set

### Port already in use
- Change port: `uvicorn app.main:app --port 8001`

## License

MVP Project - Internal Use
