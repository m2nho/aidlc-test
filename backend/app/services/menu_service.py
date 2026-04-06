from sqlalchemy.orm import Session
from app.models.menu import Menu
from app.repositories.menu_repository import MenuRepository
from app.schemas.menu_schemas import MenuCreate, MenuUpdate
from app.exceptions.business import MenuNotFoundException
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class MenuService:
    def __init__(self, db: Session):
        self.db = db
        self.menu_repo = MenuRepository(db)

    def get_menus(
        self,
        store_id: int,
        category_id: Optional[int] = None,
        available: Optional[bool] = None
    ) -> List[Menu]:
        """Get menus with filters"""
        return self.menu_repo.find_all_by_store(store_id, category_id, available)

    def create_menu(self, menu_data: MenuCreate, store_id: int) -> Menu:
        """Create new menu"""
        menu = Menu(
            store_id=store_id,
            category_id=menu_data.category_id,
            name=menu_data.name,
            description=menu_data.description,
            price=menu_data.price,
            is_available=menu_data.is_available
        )
        created_menu = self.menu_repo.create(menu)
        logger.info(f"Menu created: menu_id={created_menu.id}, name={created_menu.name}")
        return created_menu

    def update_menu(self, menu_id: int, menu_data: MenuUpdate) -> Menu:
        """Update menu"""
        menu = self.menu_repo.find_by_id(menu_id)
        if not menu:
            raise MenuNotFoundException(menu_id)

        if menu_data.name is not None:
            menu.name = menu_data.name
        if menu_data.price is not None:
            menu.price = menu_data.price
        if menu_data.description is not None:
            menu.description = menu_data.description
        if menu_data.is_available is not None:
            menu.is_available = menu_data.is_available

        updated_menu = self.menu_repo.update(menu)
        logger.info(f"Menu updated: menu_id={menu_id}")
        return updated_menu

    def delete_menu(self, menu_id: int):
        """Delete menu"""
        menu = self.menu_repo.find_by_id(menu_id)
        if not menu:
            raise MenuNotFoundException(menu_id)

        self.menu_repo.delete(menu)
        logger.info(f"Menu deleted: menu_id={menu_id}")
