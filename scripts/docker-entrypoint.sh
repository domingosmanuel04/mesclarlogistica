#!/bin/sh
set -e

# Wait for PostgreSQL with exponential backoff (fails the container after ~3 min)
node scripts/wait-for-db.js

if [ "$NODE_ENV" = "production" ]; then
  echo "Sincronizando schema Prisma..."
  npx prisma db push --skip-generate || echo "WARNING: prisma db push failed"
  if [ "${RUN_SEED:-0}" = "1" ]; then npx prisma db seed || true; fi
  echo "Iniciando Mesclar Logística (produção)..."
  exec node server.js
fi

echo "Gerando cliente Prisma..."
npx prisma generate

echo "Sincronizando schema Prisma..."
npx prisma db push --skip-generate

echo "Seed (se aplicável)..."
npx tsx prisma/seed.ts || echo "Seed ignorado ou já executado."

echo "Iniciando Mesclar Logística (dev)..."
exec npm run dev -- -H 0.0.0.0 -p 3000
