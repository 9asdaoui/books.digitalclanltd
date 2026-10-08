"""Run database migrations only (use as a one-off init container in production)."""
import asyncio
import subprocess
import sys


def main() -> None:
    result = subprocess.run(["alembic", "upgrade", "head"], check=False)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
