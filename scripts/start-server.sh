#!/usr/bin/env bash
# Watchdog / launcher for the Next.js server on cPanel (run by cron every minute
# and by index.php when the app is unreachable).
# - Serves the ACTIVE release recorded by deploy.sh in tmp/active-port + tmp/active-dist
# - Does nothing if the app answers
# - Crash-loop protection: max 5 restarts per 10 minutes, then pauses 10 minutes
# Usage: start-server.sh [--restart]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR" || exit 1
. "$SCRIPT_DIR/lib-node.sh"

TMP_DIR="$ROOT_DIR/tmp"
LOG_FILE="$ROOT_DIR/server.log"
RESTART_LOG="$TMP_DIR/restarts.log"
PAUSE_FILE="$TMP_DIR/watchdog-paused-until"
mkdir -p "$TMP_DIR"

MAX_RESTARTS=5
WINDOW_SECONDS=600
PAUSE_SECONDS=600

log() { echo "[$(date '+%F %T')] [watchdog] $*" >> "$LOG_FILE"; }

APP_PORT="$(cat "$TMP_DIR/active-port" 2>/dev/null || echo 3000)"
APP_DIST="$(cat "$TMP_DIR/active-dist" 2>/dev/null || echo .next)"

exec 9>"$TMP_DIR/start-server.lock"
command -v flock >/dev/null 2>&1 && { flock -n 9 || exit 0; }

if [ "$1" != "--restart" ] && app_responds "$APP_PORT"; then
  exit 0
fi

now=$(date +%s)
if [ -f "$PAUSE_FILE" ] && [ "$now" -lt "$(cat "$PAUSE_FILE")" ]; then
  exit 0
fi

# Crash-loop protection
touch "$RESTART_LOG"
awk -v min=$((now - WINDOW_SECONDS)) '$1 >= min' "$RESTART_LOG" > "$RESTART_LOG.tmp" && mv "$RESTART_LOG.tmp" "$RESTART_LOG"
if [ "$(wc -l < "$RESTART_LOG")" -ge "$MAX_RESTARTS" ]; then
  echo $((now + PAUSE_SECONDS)) > "$PAUSE_FILE"
  log "ALERT: $MAX_RESTARTS restarts in $((WINDOW_SECONDS/60)) min - crash loop detected, pausing $((PAUSE_SECONDS/60)) min. Check the errors above."
  exit 1
fi
echo "$now" >> "$RESTART_LOG"

if [ ! -f "$ROOT_DIR/$APP_DIST/BUILD_ID" ]; then
  log "no build found in $APP_DIST - run scripts/deploy.sh"
  exit 1
fi

rotate_log "$LOG_FILE"
stop_port "$APP_PORT"
log "starting port=$APP_PORT dist=$APP_DIST"
launch_instance "$APP_PORT" "$APP_DIST"

if wait_healthy "$APP_PORT" 90; then
  log "server up on port $APP_PORT"
  exit 0
fi
log "server did not become healthy on port $APP_PORT"
exit 1
