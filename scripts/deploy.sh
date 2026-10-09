#!/usr/bin/env bash
# Zero-downtime (blue/green) deploy for cPanel shared hosting.
#
#   1. install deps + prisma
#   2. build into a NEW release dir (.releases/<timestamp>) - live site untouched
#   3. start the new release on the idle port (3000 <-> 3001)
#   4. wait until /api/health == 200
#   5. switch tmp/active-port (index.php proxy follows instantly)
#   6. gracefully stop the old instance
#   Any failure before step 5 => new instance killed, old one keeps serving (rollback).
#
# NOTE: the code must already be updated (the GitHub workflow runs
# `git fetch && git reset --hard origin/main` BEFORE calling this script; we do
# not reset here because rewriting a running bash script corrupts its execution).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
. "$ROOT_DIR/scripts/lib-node.sh"
NPM_BIN="$(command -v npm || echo npm)"
NPX_BIN="$(command -v npx || echo npx)"
TMP_DIR="$ROOT_DIR/tmp"
mkdir -p "$TMP_DIR" "$ROOT_DIR/.releases"

step() { echo; echo "=== $* ==="; }

rm -f "$ROOT_DIR/postcss.config.mjs" 2>/dev/null || true

sync_proxy_files() {
  for PUBLIC_DIR in "$HOME/public_html" "/home/mesclarl/public_html" "/mnt/home103/mesclarl/public_html"; do
    if [ -d "$PUBLIC_DIR" ]; then
      cp -f "$ROOT_DIR/.htaccess" "$PUBLIC_DIR/.htaccess" 2>/dev/null || true
      cp -f "$ROOT_DIR/index.php" "$PUBLIC_DIR/index.php" 2>/dev/null || true
    fi
  done
}

step "0. Sync web root proxy files"
sync_proxy_files

step "1. Environment (.env)"
if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi
grep -q '^AUTH_SECRET=' .env 2>/dev/null || echo 'AUTH_SECRET="mesclar-logistica-secret-key-prod-2026-minimum-32-bytes"' >> .env
grep -q '^NEXTAUTH_URL=' .env 2>/dev/null || echo 'NEXTAUTH_URL="https://mesclarlogistica.com"' >> .env
sed -i 's/localhost:5432/127.0.0.1:5432/g' .env 2>/dev/null || true
grep -q '^DATABASE_URL=' .env 2>/dev/null || echo 'DATABASE_URL="postgresql://mesclar:mesclar_secret@127.0.0.1:5432/mesclar_logistica?schema=public"' >> .env
set -a; . ./.env; set +a
echo "Node: $NODE_BIN ($("$NODE_BIN" -v 2>/dev/null || true))"

step "2. Install dependencies"
"$NODE_BIN" "$NPM_BIN" config set omit "" 2>/dev/null || true
NODE_ENV=development "$NODE_BIN" "$NPM_BIN" install --include=dev --production=false --no-audit --no-fund

step "3. Prisma generate + schema sync"
"$NODE_BIN" "$NPX_BIN" prisma generate
"$NODE_BIN" scripts/wait-for-db.js || echo "WARNING: database not reachable"
"$NODE_BIN" "$NPX_BIN" prisma db push --skip-generate || echo "WARNING: prisma db push failed"
if [ "${RUN_SEED:-0}" = "1" ]; then "$NODE_BIN" "$NPX_BIN" prisma db seed || true; fi

step "4. Build new release (live site untouched)"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
NEW_DIST=".releases/$RELEASE_ID"
export NODE_ENV=production NODE_OPTIONS="--max-old-space-size=2048"
if ! NEXT_DIST_DIR="$NEW_DIST" "$NODE_BIN" "$NPM_BIN" run build || [ ! -f "$NEW_DIST/BUILD_ID" ]; then
  echo "::error:: Build FAILED - previous version stays online"
  rm -rf "$NEW_DIST"
  bash scripts/start-server.sh || true
  exit 1
fi

OLD_PORT="$(cat "$TMP_DIR/active-port" 2>/dev/null || echo 3000)"
OLD_DIST="$(cat "$TMP_DIR/active-dist" 2>/dev/null || echo .next)"
if [ "$OLD_PORT" = "3000" ]; then NEW_PORT=3001; else NEW_PORT=3000; fi

step "5. Start release $RELEASE_ID on port $NEW_PORT (old: $OLD_PORT)"
stop_port "$NEW_PORT"   # leftovers from a failed deploy
launch_instance "$NEW_PORT" "$NEW_DIST"

if ! wait_healthy "$NEW_PORT" 180; then
  echo "::error:: New release not healthy on port $NEW_PORT - ROLLBACK (old version keeps serving)"
  tail -n 60 server.log || true
  stop_port "$NEW_PORT"
  rm -rf "$NEW_DIST"
  exit 1
fi

step "6. Switch traffic to port $NEW_PORT"
echo "$NEW_PORT" > "$TMP_DIR/active-port.tmp" && mv "$TMP_DIR/active-port.tmp" "$TMP_DIR/active-port"
echo "$NEW_DIST" > "$TMP_DIR/active-dist.tmp" && mv "$TMP_DIR/active-dist.tmp" "$TMP_DIR/active-dist"
sync_proxy_files
sleep 5   # let in-flight requests on the old instance finish routing

step "7. Gracefully stop old instance (port $OLD_PORT)"
stop_port "$OLD_PORT"
rm -f "$TMP_DIR/restarts.log" "$TMP_DIR/watchdog-paused-until"

step "8. Cleanup old releases (keep active + 1 previous)"
{ ls -1dt .releases/*/ 2>/dev/null | sed 's#/$##' | grep -v "^$NEW_DIST$" | tail -n +2 | xargs -r rm -rf; } || true
[ "$OLD_DIST" = ".next" ] && rm -rf .next 2>/dev/null || true

step "9. Cron watchdog"
if command -v crontab >/dev/null 2>&1; then
  CRON_LINE="* * * * * /bin/bash $ROOT_DIR/scripts/start-server.sh >/dev/null 2>&1"
  ( crontab -l 2>/dev/null | grep -v "scripts/start-server.sh" ; echo "$CRON_LINE" ) | crontab - || true
  crontab -l 2>/dev/null | grep "start-server.sh" || echo "WARNING: could not install cron watchdog"
fi

echo
echo "=== Deployment complete: release $RELEASE_ID live on port $NEW_PORT ==="
curl -s -m 5 "http://127.0.0.1:$NEW_PORT/api/health" || true
echo
