from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

WEAK_JWT_SECRETS = frozenset(
    {
        "dev_secret",
        "change_me_to_a_long_random_secret",
        "dev_jwt_secret_change_in_production_32chars",
    }
)
WEAK_ADMIN_PASSWORDS = frozenset(
    {
        "Admin123!",
        "change_me_admin_password",
    }
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    admin_email: str = "admin@digitalclan.com"
    admin_password: str
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_webhook_id: str = ""
    ebook_storage_path: str = "/app/storage/secure/ebooks"
    public_covers_path: str = "/app/storage/public/covers"
    secure_ebooks_path: str = "/app/storage/secure/ebooks"
    public_covers_url_prefix: str = "/storage/public/covers"
    cors_origins: str = "http://localhost"
    max_upload_size_mb: int = 100

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if not self.is_production:
            return self

        errors: list[str] = []
        if len(self.jwt_secret) < 32 or self.jwt_secret in WEAK_JWT_SECRETS:
            errors.append("JWT_SECRET must be at least 32 characters and not a known default")
        if self.admin_password in WEAK_ADMIN_PASSWORDS or len(self.admin_password) < 12:
            errors.append("ADMIN_PASSWORD must be at least 12 characters and not a known default")
        if "dcb_dev_password" in self.database_url or "change_me" in self.database_url:
            errors.append("DATABASE_URL must not contain development placeholders in production")
        if not self.cors_origin_list or any("localhost" in o for o in self.cors_origin_list):
            errors.append("CORS_ORIGINS must list production domains only (no localhost)")

        if errors:
            raise ValueError("Production configuration invalid: " + "; ".join(errors))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
