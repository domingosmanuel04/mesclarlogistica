#!/usr/bin/env bash
set -e

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
fi

ROOT_DIR="$(pwd)"
if [ -d "/mnt/home103/mesclarl/mesclar" ]; then
  ROOT_DIR="/mnt/home103/mesclarl/mesclar"
elif [ -d "$HOME/mesclar" ]; then
  ROOT_DIR="$HOME/mesclar"
fi

cd "$ROOT_DIR"

echo "=== 1. Pulling latest changes from main ==="
git fetch origin main
git reset --hard origin/main

if [ ! -f "$ROOT_DIR/.env" ] && [ -f "$ROOT_DIR/.env.example" ]; then
  echo "=== Creating .env from .env.example ==="
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
fi

# Ensure AUTH_SECRET is configured in .env
if ! grep -q '^AUTH_SECRET=' "$ROOT_DIR/.env" 2>/dev/null; then
  echo "=== Configuring AUTH_SECRET in .env ==="
  echo 'AUTH_SECRET="mesclar-logistica-secret-key-prod-2026-minimum-32-bytes"' >> "$ROOT_DIR/.env"
fi

# Ensure NEXTAUTH_URL is configured in .env
if ! grep -q '^NEXTAUTH_URL=' "$ROOT_DIR/.env" 2>/dev/null; then
  echo 'NEXTAUTH_URL="https://mesclarlogistica.com"' >> "$ROOT_DIR/.env"
fi

# Ensure DATABASE_URL is valid in .env to prevent Prisma validation errors
if ! grep -q '^DATABASE_URL=.*postgres' "$ROOT_DIR/.env" 2>/dev/null; then
  echo "=== Configuring DATABASE_URL in .env ==="
  sed -i '/^DATABASE_URL=/d' "$ROOT_DIR/.env" 2>/dev/null || true
  echo 'DATABASE_URL="postgresql://mesclar:mesclar_secret@localhost:5432/mesclar_logistica?schema=public"' >> "$ROOT_DIR/.env"
fi

# Export environment variables for the build process
set -a
[ -f "$ROOT_DIR/.env" ] && . "$ROOT_DIR/.env"
set +a

echo "=== 2. Installing dependencies ==="
npm ci || npm install

echo "=== 3. Generating Prisma client & syncing database ==="
npx prisma generate
npx prisma db push --accept-data-loss || true

echo "=== 4. Building Next.js application ==="
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

echo "=== 5. Syncing web root proxy files (.htaccess & index.php) ==="
for PUBLIC_DIR in "$HOME/public_html" "/mnt/home103/mesclarl/public_html" "$ROOT_DIR/public"; do
  if [ -d "$PUBLIC_DIR" ]; then
    cp -f "$ROOT_DIR/.htaccess" "$PUBLIC_DIR/.htaccess" 2>/dev/null || true
    cp -f "$ROOT_DIR/index.php" "$PUBLIC_DIR/index.php" 2>/dev/null || true
  fi
done

echo "=== 6. Restarting PM2 process ==="
PORT=3000 pm2 restart mesclar-logistica --update-env 2>/dev/null || PORT=3000 pm2 restart mesclar --update-env 2>/dev/null || PORT=3000 pm2 start npm --name "mesclar-logistica" -- start
pm2 save || true

echo "=== 7. Checking PM2 Status ==="
pm2 status || true

echo "=== Deployment complete! ==="
