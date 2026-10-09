#!/usr/bin/env bash
# Idempotent Next.js launcher / watchdog for cPanel shared hosting.
# - If the app already answers on 127.0.0.1:3000 it does nothing.
# - Otherwise it (re)starts server.js fully detached from the calling shell,
#   so it survives the end of SSH sessions, PHP requests and cron jobs.
# Usage: start-server.sh            -> start only if down (used by cron + index.php)
#        start-server.sh --restart  -> force restart (used by deploy.sh)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR" || exit 1

APP_PORT=3000
LOCK_FILE="$ROOT_DIR/tmp/start-server.lock"
LOG_FILE="$ROOT_DIR/server.log"
mkdir -p "$ROOT_DIR/tmp"

# Node binary detection (cPanel ea-nodejs / nvm / system)
NODE_BIN=""
for c in /opt/cpanel/ea-nodejs22/bin/node /opt/cpanel/ea-nodejs20/bin/node /opt/cpanel/ea-nodejs18/bin/node; do
  if [ -x "$c" ]; then NODE_BIN="$c"; break; fi
done
if [ -z "$NODE_BIN" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi
[ -z "$NODE_BIN" ] && NODE_BIN="$(command -v node || echo node)"
export PATH="$(dirname "$NODE_BIN"):/usr/local/bin:/usr/bin:/bin:$PATH"

is_up() {
  if command -v curl >/dev/null 2>&1; then
    curl -s -o /dev/null -m 5 "http://127.0.0.1:$APP_PORT/" && return 0
    return 1
  fi
  (exec 3<>"/dev/tcp/127.0.0.1/$APP_PORT") 2>/dev/null
}

# Single instance (avoid cron + php starting it twice at the same time)
exec 9>"$LOCK_FILE"
if command -v flock >/dev/null 2>&1; then
  flock -n 9 || exit 0
fi

if [ "$1" != "--restart" ] && is_up; then
  exit 0
fi

# Never start without a valid production build
if [ ! -f "$ROOT_DIR/.next/BUILD_ID" ]; then
  echo "[$(date)] .next/BUILD_ID missing - run scripts/deploy.sh first" >> "$LOG_FILE"
  exit 1
fi

# Stop old instances
pkill -f "$ROOT_DIR/server.js" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
sleep 2

set -a
[ -f "$ROOT_DIR/.env" ] && . "$ROOT_DIR/.env"
set +a
export PORT=$APP_PORT
export NODE_ENV=production

# Keep the log from growing forever
if [ -f "$LOG_FILE" ] && [ "$(wc -c < "$LOG_FILE")" -gt 5000000 ]; then
  tail -c 1000000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

echo "[$(date)] Starting server.js with $NODE_BIN" >> "$LOG_FILE"
if command -v setsid >/dev/null 2>&1; then
  setsid nohup "$NODE_BIN" "$ROOT_DIR/server.js" >> "$LOG_FILE" 2>&1 < /dev/null 9>&- &
else
  nohup "$NODE_BIN" "$ROOT_DIR/server.js" >> "$LOG_FILE" 2>&1 < /dev/null 9>&- &
fi
disown 2>/dev/null || true

# Wait until it answers (max ~60s)
for i in $(seq 1 30); do
  sleep 2
  if is_up; then
    echo "[$(date)] Server is up on port $APP_PORT" >> "$LOG_FILE"
    exit 0
  fi
done
echo "[$(date)] Server did not answer after 60s" >> "$LOG_FILE"
exit 1
