from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.table_service import TableService
from app.schemas.table_schemas import (
    TableSessionResponse,
    CompleteSessionRequest,
    CompleteSessionResponse
)
from app.dependencies.auth import get_current_customer, get_current_admin

router = APIRouter(prefix="/api/tables", tags=["Tables"])


@router.get("/session", response_model=TableSessionResponse)
def get_table_session(
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Get or create table session (customer only)"""
    # For customer, table_id would be derived from login
    # Simplified: assuming we can get table_id from somewhere
    # In real implementation, might need to extract from token or request
    service = TableService(db)
    # This is simplified - actual implementation would need table_id from context
    return {"message": "Session endpoint - implementation depends on table_id context"}


@router.post("/session/complete", response_model=CompleteSessionResponse)
def complete_table_session(
    request: CompleteSessionRequest,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Complete table session (admin only)"""
    service = TableService(db)
    archived_count = service.complete_session(request.table_id)
    return CompleteSessionResponse(
        message="Session completed",
        archived_orders_count=archived_count
    )


@router.get("/active")
def get_active_tables(
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get active tables (admin only)"""
    service = TableService(db)
    active_tables = service.get_active_tables(current_user["store_id"])
    return active_tables


@router.get("/{table_id}/history")
def get_table_history(
    table_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get table order history (admin only)"""
    # Implementation would query OrderHistory
    return {"message": "History endpoint - implementation needed"}
