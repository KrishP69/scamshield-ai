from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application
    PROJECT_NAME: str = "ScamShield AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Security & Cryptography
    SECRET_KEY: str = "dev-insecure-secret-key-replace-in-production-min-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Default 32-byte Fernet key for local development
    ENCRYPTION_KEY: str = "dGhpc19pc19hX2R1bW15XzMyX2J5dGVfZmVybmV0X2tleV9mb3JfZGV2IQ=="

    # Databases
    DATABASE_URL: str = "sqlite+aiosqlite:///./scamshield.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Rate Limiting
    RATE_LIMIT_ANONYMOUS_PER_MIN: int = 15
    RATE_LIMIT_AUTHENTICATED_PER_MIN: int = 60

    # Threat Intelligence API Keys (optional; adapters fall back to offline mode when missing)
    GOOGLE_SAFE_BROWSING_KEY: Optional[str] = None
    VIRUSTOTAL_KEY: Optional[str] = None
    PHISHTANK_KEY: Optional[str] = None
    SERPAPI_KEY: Optional[str] = None

    # Storage & Uploads
    UPLOAD_DIR: str = "./uploads"
    QUARANTINE_DIR: str = "./uploads/quarantine"
    MAX_FILE_SIZE_MB: int = 10
    FILE_RETENTION_HOURS: int = 24

    # Authority & Emergency Contacts (Blueprint Section 8.5)
    CYBER_HELPLINE_NUMBER: str = "1930"
    CYBER_PORTAL_URL: str = "https://cybercrime.gov.in"
    RBI_KEHTA_HAI_URL: str = "https://rbikehtahai.rbi.org.in"


settings = Settings()
