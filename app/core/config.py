from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Encrypted Note Sharing"
    database_url: str = "sqlite+aiosqlite:///./notes.db"
    default_ttl_seconds: int = 86400
    default_max_views: int = 1
    cleanup_interval_seconds: int = 300
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    database_busy_timeout_seconds: float = 15.0
    create_secret_rate_limit: str = "20/minute"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: str | list[str]) -> str | list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("cors_origins")
    @classmethod
    def _reject_wildcard_with_credentials(cls, value: list[str]) -> list[str]:
        if "*" in value:
            raise ValueError(
                "cors_origins cannot contain '*': the app always sends "
                "allow_credentials=True, and browsers reject wildcard origins "
                "combined with credentialed requests"
            )
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
