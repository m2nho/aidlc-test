from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import logging

from .base import AppException

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI):
    """Register global exception handlers"""

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

    @app.exception_handler(ValidationError)
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
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        )
