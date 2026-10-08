# Digital Clan Books

Production-ready Docker stack for the Digital Clan Books eBook platform.

## Stack

- **Backend:** FastAPI + SQLModel (async PostgreSQL)
- **Frontend:** React (Vite) + Tailwind CSS + PWA
- **Database:** PostgreSQL 16
- **Proxy:** Nginx (edge reverse proxy)

## Production deployment

Set `APP_ENV=production` and use strong secrets (see `.env.example`). Production startup **fails** if:

- `JWT_SECRET` is under 32 chars or a known default
- `ADMIN_PASSWORD` is under 12 chars or a known default
- `DATABASE_URL` contains placeholder values
- `CORS_ORIGINS` includes `localhost`

### Recommended production flow

```bash
# 1. Configure secrets
cp .env.example .env   # edit for production

# 2. Run migrations (one-off)
docker compose run --rm backend python migrate.py

# 3. Seed only on first deploy
docker compose run --rm backend python seed.py

# 4. Start stack
docker compose up -d
```

### Health endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Liveness |
| `GET /api/ready` | Readiness (DB + storage) |

### PayPal

Configure `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`. Webhook URL:

`https://yourdomain.com/api/subscriptions/webhooks/paypal`

Pass `custom_id` = user UUID when creating PayPal subscriptions so webhooks map to users.


```bash
cp .env.example .env
# Edit .env with your secrets

docker compose up --build
```

Open [http://localhost](http://localhost) — the frontend calls `/api/health` through the edge nginx proxy.

Default admin (from seed):

- Email: `admin@digitalclan.com`
- Password: `Admin123!`

## Project structure

```
backend/     FastAPI app, Alembic migrations, seed script
frontend/    React PWA, multi-stage Docker build
nginx/       Edge reverse proxy (ports 80/443)
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB check |
| POST | `/api/auth/login` | JWT login |
| GET | `/api/books` | Published books |
| GET | `/api/books/{id}/pages/{n}` | Protected page (402 paywall) |
| GET | `/api/genres` | Genre list |
