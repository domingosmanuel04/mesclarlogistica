#!/bin/sh
set -e

echo "Aguardando base de dados..."
sleep 2

echo "Gerando cliente Prisma..."
npx prisma generate

echo "Sincronizando schema Prisma..."
npx prisma db push --skip-generate

echo "Seed (se aplicável)..."
npx tsx prisma/seed.ts || echo "Seed ignorado ou já executado."

echo "Iniciando Mesclar Logística..."
exec npm run dev -- -H 0.0.0.0 -p 3000
