#!/usr/bin/env bash
# Issue trusted Let's Encrypt cert for books.digitalclanltd.com
set -eu
export HOME=/root

DOMAIN="books.digitalclanltd.com"
WEBROOT="/home/digitalclanltd/public_html/books.digitalclanltd.com"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
CPANEL_SSL="/var/cpanel/ssl/apache_tls/${DOMAIN}"

if [ ! -f /root/.acme.sh/acme.sh ]; then
  curl -s https://get.acme.sh | sh -s email=admin@digitalclanltd.com
fi

mkdir -p "${WEBROOT}/.well-known/acme-challenge"
echo ok > "${WEBROOT}/.well-known/acme-challenge/ping.txt"
chown -R digitalclanltd:digitalclanltd "${WEBROOT}/.well-known" 2>/dev/null || true
chmod -R a+rX "${WEBROOT}/.well-known"

# ACME challenge must not be proxied to Docker
PROXY_STD="/etc/apache2/conf.d/userdata/std/2_4/digitalclanltd/${DOMAIN}"
PROXY_SSL="/etc/apache2/conf.d/userdata/ssl/2_4/digitalclanltd/${DOMAIN}"
mkdir -p "$PROXY_STD" "$PROXY_SSL"

cat > "${PROXY_STD}/acme-challenge.conf" <<'EOF'
Alias /.well-known/acme-challenge/ /home/digitalclanltd/public_html/books.digitalclanltd.com/.well-known/acme-challenge/
<Directory "/home/digitalclanltd/public_html/books.digitalclanltd.com/.well-known/acme-challenge/">
    Options None
    AllowOverride None
    Require all granted
</Directory>
ProxyPass /.well-known/acme-challenge/ !
EOF
cp "${PROXY_STD}/acme-challenge.conf" "${PROXY_SSL}/acme-challenge.conf"

# Ensure existing books Docker proxy still excludes ACME if present
if [ -f "${PROXY_STD}/proxy.conf" ] && ! grep -q 'acme-challenge' "${PROXY_STD}/proxy.conf"; then
  sed -i '1i ProxyPass /.well-known/acme-challenge/ !' "${PROXY_STD}/proxy.conf" || true
fi
if [ -f "${PROXY_SSL}/proxy.conf" ] && ! grep -q 'acme-challenge' "${PROXY_SSL}/proxy.conf"; then
  sed -i '1i ProxyPass /.well-known/acme-challenge/ !' "${PROXY_SSL}/proxy.conf" || true
fi

httpd -t
if [ -x /scripts/restartsrv_httpd ]; then
  /scripts/restartsrv_httpd >/dev/null
else
  systemctl reload httpd
fi

CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://${DOMAIN}/.well-known/acme-challenge/ping.txt" || true)
echo "ACME challenge HTTP ${CODE}"

/root/.acme.sh/acme.sh --set-default-ca --server letsencrypt

echo "==> Issuing certificate for ${DOMAIN} + www..."
/root/.acme.sh/acme.sh --issue \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  -w "${WEBROOT}" \
  --force

mkdir -p "${CERT_DIR}"
/root/.acme.sh/acme.sh --install-cert -d "${DOMAIN}" \
  --fullchain-file "${CERT_DIR}/fullchain.pem" \
  --key-file "${CERT_DIR}/privkey.pem" \
  --reloadcmd "/scripts/restartsrv_httpd"

# Replace cPanel self-signed combined cert with LE cert+key
if [ -f "${CPANEL_SSL}/combined" ]; then
  cp -a "${CPANEL_SSL}/combined" "${CPANEL_SSL}/combined.selfsigned.bak"
fi
mkdir -p "${CPANEL_SSL}"
# cPanel combined format: private key first, then fullchain
cat "${CERT_DIR}/privkey.pem" "${CERT_DIR}/fullchain.pem" > "${CPANEL_SSL}/combined"
cp -f "${CERT_DIR}/fullchain.pem" "${CPANEL_SSL}/certificates" 2>/dev/null || true

httpd -t
if [ -x /scripts/restartsrv_httpd ]; then
  /scripts/restartsrv_httpd
else
  systemctl reload httpd
fi

echo "==> Verifying served certificate..."
echo | openssl s_client -connect 129.121.97.148:443 -servername "${DOMAIN}" 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates

echo ""
echo "==> Done. Open https://${DOMAIN} in a private window."
