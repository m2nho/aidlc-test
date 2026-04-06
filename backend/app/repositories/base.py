from sqlalchemy.orm import Session
from typing import TypeVar, Generic, Type, List

T = TypeVar('T')


class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model

    def create(self, obj: T) -> T:
        """Create object"""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: T) -> T:
        """Update object"""
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: T):
        """Delete object"""
        self.db.delete(obj)
        self.db.commit()

    def find_by_id(self, id: int) -> T:
        """Find object by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def find_all(self) -> List[T]:
        """Find all objects"""
        return self.db.query(self.model).all()
