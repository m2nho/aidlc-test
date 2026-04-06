from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    database_url: str = "sqlite:///./table_order.db"

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 16

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton instance
settings = Settings()
