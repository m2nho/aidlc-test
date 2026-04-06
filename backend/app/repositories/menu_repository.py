from sqlalchemy.orm import Session
from app.models.menu import Menu
from typing import List, Optional


class MenuRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all_by_store(
        self,
        store_id: int,
        category_id: Optional[int] = None,
        available: Optional[bool] = None
    ) -> List[Menu]:
        """Find all menus by store with optional filters"""
        query = self.db.query(Menu).filter(Menu.store_id == store_id)

        if category_id is not None:
            query = query.filter(Menu.category_id == category_id)

        if available is not None:
            query = query.filter(Menu.is_available == available)

        return query.all()

    def find_by_id(self, menu_id: int) -> Optional[Menu]:
        """Find menu by ID"""
        return self.db.query(Menu).filter(Menu.id == menu_id).first()

    def create(self, menu: Menu) -> Menu:
        """Create menu"""
        self.db.add(menu)
        self.db.commit()
        self.db.refresh(menu)
        return menu

    def update(self, menu: Menu) -> Menu:
        """Update menu"""
        self.db.commit()
        self.db.refresh(menu)
        return menu

    def delete(self, menu: Menu):
        """Delete menu"""
        self.db.delete(menu)
        self.db.commit()
