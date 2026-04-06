from .base import AppException


class AuthenticationException(AppException):
    """Base authentication exception"""
    pass


class InvalidCredentialsException(AuthenticationException):
    def __init__(self, details: dict = None):
        super().__init__(
            message="Invalid credentials",
            error_code="AUTH_INVALID_CREDENTIALS",
            status_code=401,
            details=details
        )


class TokenExpiredException(AuthenticationException):
    def __init__(self, details: dict = None):
        super().__init__(
            message="Token has expired",
            error_code="AUTH_TOKEN_EXPIRED",
            status_code=401,
            details=details
        )


class InvalidTokenException(AuthenticationException):
    def __init__(self, details: dict = None):
        super().__init__(
            message="Invalid token",
            error_code="AUTH_INVALID_TOKEN",
            status_code=401,
            details=details
        )


class AuthorizationException(AppException):
    """Base authorization exception"""
    pass


class InsufficientPermissionException(AuthorizationException):
    def __init__(self, details: dict = None):
        super().__init__(
            message="Insufficient permissions",
            error_code="AUTH_INSUFFICIENT_PERMISSION",
            status_code=403,
            details=details
        )
