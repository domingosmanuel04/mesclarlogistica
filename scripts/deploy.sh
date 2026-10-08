#!/usr/bin/env bash
set -e

# Select best available Node binary (cPanel ea-nodejs20 / ea-nodejs18 / system nvm)
NODE_BIN=""
if [ -x "/opt/cpanel/ea-nodejs20/bin/node" ]; then
  NODE_BIN="/opt/cpanel/ea-nodejs20/bin/node"
  export PATH="/opt/cpanel/ea-nodejs20/bin:$PATH"
elif [ -x "/opt/cpanel/ea-nodejs18/bin/node" ]; then
  NODE_BIN="/opt/cpanel/ea-nodejs18/bin/node"
  export PATH="/opt/cpanel/ea-nodejs18/bin:$PATH"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  \. "$NVM_DIR/nvm.sh"
  NODE_BIN="$(command -v node)"
else
  NODE_BIN="$(command -v node || echo "node")"
fi

export PATH="$(dirname "$NODE_BIN"):$PATH"

ROOT_DIR="$(pwd)"
if [ -d "/mnt/home103/mesclarl/mesclar" ]; then
  ROOT_DIR="/mnt/home103/mesclarl/mesclar"
elif [ -d "/home/mesclarl/mesclar" ]; then
  ROOT_DIR="/home/mesclarl/mesclar"
elif [ -d "$HOME/mesclar" ]; then
  ROOT_DIR="$HOME/mesclar"
elif [ -d "$HOME/public_html/mesclar" ]; then
  ROOT_DIR="$HOME/public_html/mesclar"
fi

cd "$ROOT_DIR"

echo "=== 0. Immediate Sync of Web Root Proxy Files (.htaccess & index.php) ==="
for PUBLIC_DIR in "$HOME/public_html" "/home/mesclarl/public_html" "/mnt/home103/mesclarl/public_html" "$ROOT_DIR/public"; do
  if [ -d "$PUBLIC_DIR" ]; then
    cp -f "$ROOT_DIR/.htaccess" "$PUBLIC_DIR/.htaccess" 2>/dev/null || true
    cp -f "$ROOT_DIR/index.php" "$PUBLIC_DIR/index.php" 2>/dev/null || true
  fi
done

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
if ! grep -q '^DATABASE_URL=' "$ROOT_DIR/.env" 2>/dev/null; then
  echo "=== Configuring default DATABASE_URL in .env ==="
  echo 'DATABASE_URL="postgresql://mesclar:mesclar_secret@localhost:5432/mesclar_logistica?schema=public"' >> "$ROOT_DIR/.env"
fi

# Export environment variables for the build and server execution process
set -a
[ -f "$ROOT_DIR/.env" ] && . "$ROOT_DIR/.env"
export PORT=3000
set +a

echo "=== Using Node Binary: $NODE_BIN ($($NODE_BIN -v 2>/dev/null || true)) ==="

echo "=== 2. Installing all dependencies (including Tailwind & build packages) ==="
NODE_ENV=development "$NODE_BIN" $(command -v npm || echo "npm") ci --include=dev || NODE_ENV=development "$NODE_BIN" $(command -v npm || echo "npm") install --include=dev

echo "=== 3. Generating Prisma client & syncing database ==="
"$NODE_BIN" $(command -v npx || echo "npx") prisma generate || true
"$NODE_BIN" $(command -v npx || echo "npx") prisma db push --accept-data-loss || true

echo "=== 4. Building Next.js application ==="
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"
"$NODE_BIN" $(command -v npm || echo "npm") run build

echo "=== 5. Re-syncing web root proxy files (.htaccess & index.php) ==="
for PUBLIC_DIR in "$HOME/public_html" "/home/mesclarl/public_html" "/mnt/home103/mesclarl/public_html" "$ROOT_DIR/public"; do
  if [ -d "$PUBLIC_DIR" ]; then
    cp -f "$ROOT_DIR/.htaccess" "$PUBLIC_DIR/.htaccess" 2>/dev/null || true
    cp -f "$ROOT_DIR/index.php" "$PUBLIC_DIR/index.php" 2>/dev/null || true
  fi
done

echo "=== 6. Restarting Node / Passenger / PM2 Process ==="
# Touch tmp/restart.txt for cPanel Phusion Passenger / LiteSpeed
mkdir -p "$ROOT_DIR/tmp"
touch "$ROOT_DIR/tmp/restart.txt"
echo "=== Triggered cPanel Passenger reload via tmp/restart.txt ==="

if command -v pm2 &> /dev/null; then
  PORT=3000 pm2 restart mesclar-logistica --update-env 2>/dev/null || \
  PORT=3000 pm2 restart mesclar --update-env 2>/dev/null || \
  PORT=3000 pm2 start server.js --name "mesclar-logistica" || \
  PORT=3000 pm2 start npm --name "mesclar-logistica" -- start
  pm2 save || true
  pm2 status || true
else
  echo "=== Running server.js with $NODE_BIN in background ==="
  pkill -9 -f "server.js" 2>/dev/null || true
  pkill -9 -f "node server.js" 2>/dev/null || true
  sleep 1
  PORT=3000 NODE_ENV=production nohup "$NODE_BIN" server.js > server.log 2>&1 &
  echo "Server started with PID: $!"
  sleep 3
  echo "=== Server Log Output (server.log) ==="
  cat server.log || true
fi

echo "=== Deployment complete! ==="
