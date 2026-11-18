#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backend-hostname>" >&2
  exit 2
fi

cd "$(dirname "$0")/.."
if [[ -e .env ]]; then
  echo ".env already exists; leaving it unchanged"
  exit 0
fi

umask 077
admin_password="$(openssl rand -base64 24 | tr -d '\n')"
jwt_secret="$(openssl rand -hex 32)"
cat > .env <<EOF
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${admin_password}
JWT_SECRET=${jwt_secret}
APP_BIND=127.0.0.1
APP_PORT=3000
DOMAIN=$1
PUBLIC_URL=
EOF

echo "Created private .env for $1. Read ADMIN_PASSWORD locally on the server when needed."
