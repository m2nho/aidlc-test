from .base import AppException


class BusinessRuleException(AppException):
    """Base business rule exception"""
    pass


class OrderNotFoundException(BusinessRuleException):
    def __init__(self, order_id: int):
        super().__init__(
            message=f"Order {order_id} not found",
            error_code="ORDER_NOT_FOUND",
            status_code=404,
            details={"order_id": order_id}
        )


class OrderStatusConflictException(BusinessRuleException):
    def __init__(self, current_status: str, requested_status: str):
        super().__init__(
            message=f"Cannot transition from {current_status} to {requested_status}",
            error_code="ORDER_STATUS_CONFLICT",
            status_code=409,
            details={
                "current_status": current_status,
                "requested_status": requested_status
            }
        )


class InvalidOrderStateException(BusinessRuleException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            message=message,
            error_code="INVALID_ORDER_STATE",
            status_code=400,
            details=details
        )


class MenuNotFoundException(BusinessRuleException):
    def __init__(self, menu_id: int):
        super().__init__(
            message=f"Menu {menu_id} not found",
            error_code="MENU_NOT_FOUND",
            status_code=404,
            details={"menu_id": menu_id}
        )


class TableNotFoundException(BusinessRuleException):
    def __init__(self, table_id: int):
        super().__init__(
            message=f"Table {table_id} not found",
            error_code="TABLE_NOT_FOUND",
            status_code=404,
            details={"table_id": table_id}
        )


class SessionNotFoundException(BusinessRuleException):
    def __init__(self, session_id: int):
        super().__init__(
            message=f"Session {session_id} not found",
            error_code="SESSION_NOT_FOUND",
            status_code=404,
            details={"session_id": session_id}
        )
