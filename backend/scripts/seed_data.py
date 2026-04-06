"""
Seed data script for Table Order Service
Run this to populate the database with initial data
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine, Base
from app.models import Store, Admin, Table, MenuCategory, Menu
from app.utils.password import PasswordHasher

def seed_data():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data already exists
        existing_store = db.query(Store).first()
        if existing_store:
            print("Data already exists. Skipping seed.")
            return

        # Create Store
        store = Store(
            name="맛있는 식당",
            table_count=10
        )
        db.add(store)
        db.flush()

        # Create Admin
        admin = Admin(
            store_id=store.id,
            username="admin",
            password_hash=PasswordHasher.hash_password("admin1234")
        )
        db.add(admin)

        # Create Tables
        for i in range(1, 11):
            table = Table(
                store_id=store.id,
                table_number=i,
                password_hash=PasswordHasher.hash_password("1234")
            )
            db.add(table)

        # Create Menu Categories
        categories = [
            MenuCategory(store_id=store.id, name="찌개류", display_order=1),
            MenuCategory(store_id=store.id, name="면류", display_order=2),
            MenuCategory(store_id=store.id, name="밥류", display_order=3),
            MenuCategory(store_id=store.id, name="음료", display_order=4),
        ]
        for cat in categories:
            db.add(cat)
        db.flush()

        # Create Menus
        menus = [
            Menu(store_id=store.id, category_id=categories[0].id, name="김치찌개", description="돼지고기가 들어간 김치찌개", price=8000, is_available=True),
            Menu(store_id=store.id, category_id=categories[0].id, name="된장찌개", description="두부와 채소가 들어간 된장찌개", price=7000, is_available=True),
            Menu(store_id=store.id, category_id=categories[0].id, name="순두부찌개", description="해산물이 들어간 순두부찌개", price=8500, is_available=True),
            Menu(store_id=store.id, category_id=categories[1].id, name="비빔국수", description="매콤한 양념의 비빔국수", price=6000, is_available=True),
            Menu(store_id=store.id, category_id=categories[1].id, name="칼국수", description="시원한 국물의 칼국수", price=7000, is_available=True),
            Menu(store_id=store.id, category_id=categories[2].id, name="비빔밥", description="고추장 양념의 비빔밥", price=8000, is_available=True),
            Menu(store_id=store.id, category_id=categories[2].id, name="돌솥비빔밥", description="돌솥에 나오는 비빔밥", price=9000, is_available=True),
            Menu(store_id=store.id, category_id=categories[3].id, name="콜라", description="시원한 콜라", price=2000, is_available=True),
            Menu(store_id=store.id, category_id=categories[3].id, name="사이다", description="시원한 사이다", price=2000, is_available=True),
            Menu(store_id=store.id, category_id=categories[3].id, name="맥주", description="시원한 맥주", price=4000, is_available=False),
        ]
        for menu in menus:
            db.add(menu)

        db.commit()
        print("Seed data created successfully!")
        print(f"Store: {store.name} (ID: {store.id})")
        print(f"Admin: {admin.username} / admin1234")
        print(f"Tables: 1-10 (password: 1234)")
        print(f"Menus: {len(menus)} items")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
