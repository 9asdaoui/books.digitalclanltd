"""Basic backend tests — run with: pytest tests/"""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_liveness(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_admin_books_requires_auth(client):
    response = await client.post("/admin/books")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_invalid_jwt_returns_401(client):
    response = await client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_malformed_jwt_sub_returns_401(client):
    token = create_access_token("not-a-uuid")
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
