#!/usr/bin/env bash
# Run on a fresh Linux VPS as root (Debian/Ubuntu, RHEL/CentOS/Rocky, or Alpine).
set -eu

APP_DIR="/opt/books.digitalclanltd"
mkdir -p "$APP_DIR"

if [ -f /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "==> OS: ${PRETTY_NAME:-unknown}"
else
  echo "==> OS: $(uname -srm)"
fi

detect_pkg_mgr() {
  if command -v apt-get >/dev/null 2>&1; then echo apt
  elif command -v dnf >/dev/null 2>&1; then echo dnf
  elif command -v yum >/dev/null 2>&1; then echo yum
  elif command -v apk >/dev/null 2>&1; then echo apk
  else echo unknown
  fi
}

PKG_MGR="$(detect_pkg_mgr)"
echo "==> Package manager: $PKG_MGR"

install_packages() {
  case "$PKG_MGR" in
    apt)
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -qq
      apt-get upgrade -y -qq
      apt-get install -y -qq git curl ca-certificates gnupg lsb-release ufw
      ;;
    dnf)
      dnf update -y -q || true
      dnf install -y -q git curl ca-certificates
      ;;
    yum)
      yum update -y -q || true
      yum install -y -q git curl ca-certificates
      ;;
    apk)
      apk update
      apk add --no-cache git curl ca-certificates bash openssh
      ;;
    *)
      echo "ERROR: Unsupported Linux — install git and curl manually, then re-run deploy-app.sh"
      exit 1
      ;;
  esac
}

configure_firewall() {
  if command -v ufw >/dev/null 2>&1; then
    ufw allow OpenSSH || true
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    echo "y" | ufw enable || true
  elif command -v firewall-cmd >/dev/null 2>&1; then
    systemctl enable --now firewalld 2>/dev/null || true
    firewall-cmd --permanent --add-service=ssh || true
    firewall-cmd --permanent --add-service=http || true
    firewall-cmd --permanent --add-service=https || true
    firewall-cmd --reload || true
  else
    echo "==> No ufw/firewalld found — open ports 80 and 443 in your provider panel if needed."
  fi
}

echo "==> Updating system packages..."
install_packages

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Starting Docker daemon..."
systemctl enable docker
systemctl start docker
sleep 2

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker is installed but the daemon is not running."
  systemctl status docker --no-pager || true
  exit 1
fi
echo "==> Docker ready: $(docker --version)"

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin not found after install."
  exit 1
fi

echo "==> Configuring firewall (SSH + HTTP)..."
configure_firewall

echo "==> App directory: $APP_DIR"
echo "==> Server setup complete."
