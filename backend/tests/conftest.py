import os

# Minimal env for pytest when .env is not in backend/
os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://dcb_user:dcb_dev_password_2024@localhost:5432/digital_clan_books",
)
os.environ.setdefault("JWT_SECRET", "test_jwt_secret_for_pytest_only_32chars")
os.environ.setdefault("ADMIN_PASSWORD", "test_admin_pass_12")
