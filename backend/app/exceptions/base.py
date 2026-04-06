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
