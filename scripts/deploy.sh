#!/usr/bin/env bash
set -e

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
fi

# Detect project directory on server
if [ -d "/mnt/home103/mesclarl/mesclar" ]; then
  cd /mnt/home103/mesclarl/mesclar
elif [ -d "$HOME/mesclar" ]; then
  cd "$HOME/mesclar"
elif [ -d "$HOME/public_html" ]; then
  cd "$HOME/public_html"
fi

echo "=== Pulling latest changes from main ==="
git fetch origin main
git reset --hard origin/main

echo "=== Installing dependencies ==="
npm ci || npm install

echo "=== Generating Prisma client & syncing database ==="
npx prisma generate
npx prisma db push --accept-data-loss || true

echo "=== Building Next.js application ==="
npm run build

echo "=== Restarting PM2 process ==="
pm2 restart mesclar-logistica || pm2 restart mesclar || pm2 start npm --name "mesclar-logistica" -- start
pm2 save || true

echo "=== Deployment complete ==="
