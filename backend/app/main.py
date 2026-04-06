from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, setup_logging
from app.middleware.logging import LoggingMiddleware
from app.exceptions.handlers import register_exception_handlers
from app.routers import auth_router, order_router, table_router, menu_router, sse_router
from app.database import engine, Base
import logging

# Setup logging
setup_logging(settings.log_level, settings.log_file)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Table Order Service API",
    description="MVP 테이블오더 서비스 Backend API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
app.add_middleware(LoggingMiddleware)

# Register exception handlers
register_exception_handlers(app)

# Register routers
app.include_router(auth_router.router)
app.include_router(order_router.router)
app.include_router(table_router.router)
app.include_router(menu_router.router)
app.include_router(sse_router.router)


@app.on_event("startup")
def startup_event():
    """Startup event - create tables"""
    logger.info("Application startup")
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
