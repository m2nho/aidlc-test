from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.menu_service import MenuService
from app.schemas.menu_schemas import MenuCreate, MenuUpdate, MenuResponse
from app.dependencies.auth import get_current_customer, get_current_admin
from typing import List, Optional

router = APIRouter(prefix="/api/menus", tags=["Menus"])


@router.get("", response_model=List[MenuResponse])
def get_menus(
    category_id: Optional[int] = None,
    available: Optional[bool] = None,
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Get menus (customer only)"""
    service = MenuService(db)
    menus = service.get_menus(
        store_id=current_user["store_id"],
        category_id=category_id,
        available=available
    )
    return menus


@router.post("", response_model=MenuResponse, status_code=201)
def create_menu(
    menu_data: MenuCreate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create menu (admin only)"""
    service = MenuService(db)
    menu = service.create_menu(menu_data, current_user["store_id"])
    return menu


@router.patch("/{menu_id}", response_model=MenuResponse)
def update_menu(
    menu_id: int,
    menu_data: MenuUpdate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update menu (admin only)"""
    service = MenuService(db)
    menu = service.update_menu(menu_id, menu_data)
    return menu


@router.delete("/{menu_id}", status_code=204)
def delete_menu(
    menu_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete menu (admin only)"""
    service = MenuService(db)
    service.delete_menu(menu_id)
