#!/usr/bin/env bash
# Run from project root on the server: bash scripts/deploy/deploy-app.sh
set -eu

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  sed -i 's/\r$//' .env
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ ! -f docker-compose.yml ]; then
  echo "ERROR: docker-compose.yml not found in $ROOT"
  exit 1
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.production.example..."
  cp .env.production.example .env

  DB_PASS="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)"
  JWT_SECRET="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)"
  ADMIN_PASS="$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9!@#' | head -c 16)!"
  READER_PASS="$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9!@#' | head -c 16)!"

  sed -i "s|CHANGE_ME_STRONG_DB_PASSWORD|${DB_PASS}|g" .env
  sed -i "s|CHANGE_ME_RANDOM_JWT_SECRET_AT_LEAST_32_CHARS|${JWT_SECRET}|g" .env
  sed -i "s|CHANGE_ME_STRONG_ADMIN_PASSWORD|${ADMIN_PASS}|g" .env
  sed -i "s|CHANGE_ME_STRONG_READER_PASSWORD|${READER_PASS}|g" .env

  echo ""
  echo "========== SAVE THESE CREDENTIALS =========="
  echo "Admin : admin@digitalclan.com / ${ADMIN_PASS}"
  echo "Reader: reader@digitalclan.com / ${READER_PASS}"
  echo "============================================="
  echo "(Also stored in $ROOT/.env)"
fi

if [ -n "${BOOKS_DOMAIN:-}" ] && [ -f .env ]; then
  sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://${BOOKS_DOMAIN},http://${BOOKS_DOMAIN}|" .env || true
  grep -q '^BOOKS_DOMAIN=' .env || echo "BOOKS_DOMAIN=${BOOKS_DOMAIN}" >> .env
fi

echo "==> Configuring host nginx for books subdomain..."
sed -i 's/\r$//' scripts/deploy/configure-books-subdomain.sh 2>/dev/null || true
chmod +x scripts/deploy/configure-books-subdomain.sh
bash scripts/deploy/configure-books-subdomain.sh

echo "==> Building and starting containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

echo "==> Waiting for backend..."
for i in $(seq 1 60); do
  if docker compose exec -T backend python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" 2>/dev/null; then
    break
  fi
  sleep 3
done

echo "==> Seeding database..."
docker compose exec -T backend python scripts/reset_database.py || true
docker compose exec -T backend python scripts/deploy_seed.py

echo ""
echo "==> Deployment complete!"
echo "    Open: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
