#!/usr/bin/env bash
# Shared helpers for deploy.sh / start-server.sh (sourced, not executed).
# Requires ROOT_DIR to be set.

# --- Node binary (cPanel ea-nodejs / nvm / system) ---
NODE_BIN=""
for c in /opt/cpanel/ea-nodejs22/bin/node /opt/cpanel/ea-nodejs20/bin/node /opt/cpanel/ea-nodejs18/bin/node; do
  if [ -x "$c" ]; then NODE_BIN="$c"; break; fi
done
if [ -z "$NODE_BIN" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi
[ -z "$NODE_BIN" ] && NODE_BIN="$(command -v node || echo node)"
export PATH="$(dirname "$NODE_BIN"):/usr/local/bin:/usr/bin:/bin:$PATH"

# HTTP status of a URL ("000" when unreachable)
http_code() {
  if command -v curl >/dev/null 2>&1; then
    curl -s -o /dev/null -m 5 -w '%{http_code}' "$1" 2>/dev/null || echo 000
  else
    "$NODE_BIN" -e "require('http').get(process.argv[1],{timeout:5000},r=>{console.log(r.statusCode);process.exit(0)}).on('error',()=>{console.log('000');process.exit(0)})" "$1"
  fi
}

# Process is alive and serving HTTP (any status) - used by the watchdog
app_responds() {
  local code; code="$(http_code "http://127.0.0.1:$1/api/health")"
  [ "$code" != "000" ]
}

# Healthy = /api/health returns 200 (app + database OK)
is_healthy() {
  [ "$(http_code "http://127.0.0.1:$1/api/health")" = "200" ]
}

# wait_healthy <port> <timeout_seconds> - exponential backoff 1,2,4,5,5...
wait_healthy() {
  local port=$1 timeout=${2:-120} waited=0 delay=1
  while [ "$waited" -lt "$timeout" ]; do
    is_healthy "$port" && return 0
    sleep "$delay"; waited=$((waited + delay))
    delay=$((delay * 2)); [ "$delay" -gt 5 ] && delay=5
  done
  return 1
}

# PIDs of server.js instances bound to a given port (via PID files)
pid_for_port() { cat "$ROOT_DIR/tmp/server-$1.pid" 2>/dev/null; }

# Graceful stop: SIGTERM, wait up to 20s, then SIGKILL
stop_port() {
  local port=$1 pid; pid="$(pid_for_port "$port")"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill -TERM "$pid" 2>/dev/null
    for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
    kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null
  fi
  rm -f "$ROOT_DIR/tmp/server-$port.pid"
  # Legacy instances started before PID files existed
  local legacy=""
  if command -v lsof >/dev/null 2>&1; then
    legacy="$(lsof -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  elif command -v ss >/dev/null 2>&1; then
    legacy="$(ss -ltnp "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 || true)"
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k -TERM "$port/tcp" >/dev/null 2>&1 || true
  fi
  for p in $legacy; do kill -TERM "$p" 2>/dev/null || true; done
  [ -n "$legacy" ] && sleep 3
  for p in $legacy; do kill -KILL "$p" 2>/dev/null || true; done
  return 0
}

# launch_instance <port> <dist_dir> - fully detached from the caller
launch_instance() {
  local port=$1 dist=$2
  (
    set -a; [ -f "$ROOT_DIR/.env" ] && . "$ROOT_DIR/.env"; set +a
    export PORT="$port" NEXT_DIST_DIR="$dist" NODE_ENV=production
    cd "$ROOT_DIR"
    if command -v setsid >/dev/null 2>&1; then
      setsid nohup "$NODE_BIN" "$ROOT_DIR/server.js" >> "$ROOT_DIR/server.log" 2>&1 < /dev/null 9>&- &
    else
      nohup "$NODE_BIN" "$ROOT_DIR/server.js" >> "$ROOT_DIR/server.log" 2>&1 < /dev/null 9>&- &
    fi
    echo $! > "$ROOT_DIR/tmp/server-$port.pid"
  )
}

rotate_log() {
  local f=$1
  if [ -f "$f" ] && [ "$(wc -c < "$f")" -gt 5000000 ]; then
    tail -c 1000000 "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}
