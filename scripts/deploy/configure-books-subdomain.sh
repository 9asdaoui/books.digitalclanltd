#!/usr/bin/env bash
# Configure host web server to proxy books subdomain to Docker (127.0.0.1:8080).
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

BOOKS_DOMAIN="${BOOKS_DOMAIN:-books.digitalclanltd.com}"
CPANEL_USER="${CPANEL_USER:-digitalclanltd}"
DOCROOT="/home/${CPANEL_USER}/public_html/books.digitalclanltd.com"

echo "==> Books subdomain: $BOOKS_DOMAIN"

if command -v httpd >/dev/null 2>&1 || command -v apachectl >/dev/null 2>&1; then
  echo "==> Configuring Apache (cPanel) reverse proxy..."

  STD_DIR="/etc/apache2/conf.d/userdata/std/2_4/${CPANEL_USER}/${BOOKS_DOMAIN}"
  SSL_DIR="/etc/apache2/conf.d/userdata/ssl/2_4/${CPANEL_USER}/${BOOKS_DOMAIN}"
  mkdir -p "$STD_DIR" "$SSL_DIR"
  install -m 644 scripts/deploy/books-apache-proxy.conf.template "${STD_DIR}/proxy.conf"
  install -m 644 scripts/deploy/books-apache-proxy.conf.template "${SSL_DIR}/proxy.conf"

  if [ -f "${DOCROOT}/index.html" ]; then
    mv "${DOCROOT}/index.html" "${DOCROOT}/index.html.coming-soon.bak.$(date +%s)"
    echo "    Backed up Coming Soon index.html"
  fi

  if [ -x /scripts/rebuildhttpdconf ]; then
    /scripts/rebuildhttpdconf
  elif [ -x /usr/local/cpanel/scripts/rebuildhttpdconf ]; then
    /usr/local/cpanel/scripts/rebuildhttpdconf
  fi

  if [ -x /scripts/restartsrv_httpd ]; then
    /scripts/restartsrv_httpd
  else
    systemctl reload httpd || apachectl graceful
  fi

  echo "==> Apache proxying ${BOOKS_DOMAIN} -> 127.0.0.1:8080"
  exit 0
fi

if command -v nginx >/dev/null 2>&1; then
  echo "==> Configuring nginx reverse proxy..."
  CONF_DEST="/etc/nginx/conf.d/books-app.conf"
  sed "s/__BOOKS_DOMAIN__/${BOOKS_DOMAIN}/g" scripts/deploy/books-subdomain.conf.template > /tmp/books-app.conf
  install -m 644 /tmp/books-app.conf "$CONF_DEST"
  rm -f /tmp/books-app.conf
  nginx -t
  systemctl reload nginx || systemctl start nginx
  echo "==> nginx proxying ${BOOKS_DOMAIN} -> 127.0.0.1:8080"
  exit 0
fi

echo "ERROR: No Apache or nginx found on the host."
exit 1
