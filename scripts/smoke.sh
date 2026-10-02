#!/usr/bin/env bash
# Smoke test do fluxo Mesclar (API)
set -euo pipefail
BASE="${1:-http://localhost:3020}"

echo "== Mesclar smoke @ $BASE =="
curl -sf -o /dev/null "$BASE/" && echo "OK home"
curl -sf -o /dev/null "$BASE/ebooks" && echo "OK ebooks"
curl -sf -o /dev/null "$BASE/sitemap.xml" && echo "OK sitemap"
curl -sf "$BASE/api/catalog" | grep -q '"slug"' && echo "OK catalog"
curl -sf "$BASE/api/health" | grep -q '"healthy"' && echo "OK health"

if curl -sf -o /dev/null "$BASE/covers/kpi-logisticos.jpg"; then
  echo "OK cover jpg"
elif curl -sf "$BASE/covers/kpi-logisticos.svg" | grep -q '<svg'; then
  echo "OK cover svg"
else
  echo "FAIL cover"; exit 1
fi

BOOK_ID=$(curl -sf "$BASE/api/catalog" | python3 -c 'import sys,json; books=json.load(sys.stdin); print(next(b["id"] for b in books if b.get("priceEbook")==0))')
TOKEN=$(curl -sf -X POST "$BASE/api/books/free-download" -H 'Content-Type: application/json' -d "{\"bookId\":\"$BOOK_ID\"}" | python3 -c 'import sys,json; print(json.load(sys.stdin)["downloadToken"])')
curl -sf -o /dev/null "$BASE/api/download/$TOKEN" && echo "OK free download"

COUPON=$(curl -sf -X POST "$BASE/api/coupons" -H 'Content-Type: application/json' -d '{"code":"MESCLAR10","orderTotal":15000}')
echo "$COUPON" | grep -q '"discount"' && echo "OK coupon MESCLAR10"

echo "Smoke tests passed."
