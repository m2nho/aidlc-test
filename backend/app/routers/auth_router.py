from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth_schemas import (
    CustomerLoginRequest,
    AdminLoginRequest,
    LoginResponse,
    LogoutResponse
)
from app.dependencies.auth import jwt_manager
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login/customer", response_model=LoginResponse)
def customer_login(
    credentials: CustomerLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Customer login by table number and password"""
    service = AuthService(db)
    store = service.authenticate_customer(
        credentials.table_number,
        credentials.password
    )

    # Create JWT token
    token = jwt_manager.create_token(
        subject=str(store.id),
        role="customer",
        store_id=store.id
    )

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=(settings.environment == "production"),
        samesite="lax",
        max_age=settings.jwt_expire_hours * 3600
    )

    return LoginResponse(message="Login successful")


@router.post("/login/admin", response_model=LoginResponse)
def admin_login(
    credentials: AdminLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Admin login by username and password"""
    service = AuthService(db)
    admin = service.authenticate_admin(
        credentials.username,
        credentials.password
    )

    # Create JWT token
    token = jwt_manager.create_token(
        subject=str(admin.id),
        role="admin",
        store_id=admin.store_id
    )

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=(settings.environment == "production"),
        samesite="lax",
        max_age=settings.jwt_expire_hours * 3600
    )

    return LoginResponse(message="Login successful")


@router.post("/logout", response_model=LogoutResponse)
def logout(response: Response):
    """Logout by deleting cookie"""
    response.delete_cookie(key="access_token")
    return LogoutResponse(message="Logout successful")
