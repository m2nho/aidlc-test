from fastapi import Depends, Cookie
from app.utils.jwt import JWTManager
from app.config import settings
from app.exceptions.auth import InvalidCredentialsException, InsufficientPermissionException

# JWT Manager instance
jwt_manager = JWTManager(
    secret_key=settings.jwt_secret_key,
    algorithm=settings.jwt_algorithm,
    expire_hours=settings.jwt_expire_hours
)


async def get_current_user(
    access_token: str = Cookie(None)
) -> dict:
    """Get current authenticated user from JWT cookie"""
    if not access_token:
        raise InvalidCredentialsException({"reason": "No access token provided"})

    payload = jwt_manager.verify_token(access_token)
    return payload


async def get_current_customer(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Verify customer role"""
    if current_user["role"] != "customer":
        raise InsufficientPermissionException({"required_role": "customer"})
    return current_user


async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Verify admin role"""
    if current_user["role"] != "admin":
        raise InsufficientPermissionException({"required_role": "admin"})
    return current_user
