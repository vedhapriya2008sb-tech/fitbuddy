"""Application Configuration."""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Application settings class."""
    APP_NAME: str = os.getenv("APP_NAME", "FitBuddy AI")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes", "t")

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "fitbuddy-dev-super-secret-key-32chars-min-hash"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fitbuddy.db")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:4200,http://127.0.0.1:4200,http://localhost:3000",
        )
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


settings = Settings()
