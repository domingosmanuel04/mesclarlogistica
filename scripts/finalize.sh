#!/usr/bin/env bash
# Aplica schema, regenera client no contentor e verifica a app
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BASE="${1:-http://localhost:3020}"

echo "== Finalize Mesclar =="
docker compose up -d
docker exec mesclar-web sh -c 'npx prisma db push --accept-data-loss && npx prisma generate'
docker compose restart web
echo "Aguardando health..."
for i in $(seq 1 30); do
  if curl -sf "$BASE/api/health" >/dev/null; then
    curl -sf "$BASE/api/health"; echo
    break
  fi
  sleep 1
done

curl -sf -X POST "$BASE/api/coupons" \
  -H 'Content-Type: application/json' \
  -d '{"code":"MESCLAR10","orderTotal":15000}'
echo
curl -sf -o /dev/null -w 'cover jpg: %{http_code}\n' "$BASE/covers/kpi-logisticos.jpg" || true
bash "$ROOT/scripts/smoke.sh" "$BASE"
echo "Finalize OK."
