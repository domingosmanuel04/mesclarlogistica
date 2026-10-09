#!/usr/bin/env bash
# Blue/green zero-downtime deploy for docker-compose.prod.yml (VPS).
#  1. build new image          (old container keeps serving)
#  2. start the idle colour    -> wait until Docker reports "healthy"
#  3. nginx: new = primary, old = backup -> reload (no dropped connections)
#  4. stop old colour gracefully (SIGTERM, 30s grace)
#  Rollback: if the new colour never becomes healthy it is removed and nginx is untouched.
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml --profile green"
STATE_FILE="deploy/.active-colour"
ACTIVE="$(cat "$STATE_FILE" 2>/dev/null || echo blue)"
if [ "$ACTIVE" = "blue" ]; then NEW=green; else NEW=blue; fi
OLD_SVC="web_$ACTIVE"; NEW_SVC="web_$NEW"

write_upstream() { # <primary> [backup]
  {
    echo "# Managed by scripts/deploy-docker.sh"
    echo "upstream mesclar_web {"
    echo "    server $1:3000 max_fails=2 fail_timeout=5s;"
    [ -n "${2:-}" ] && echo "    server $2:3000 max_fails=2 fail_timeout=5s backup;"
    echo "    keepalive 32;"
    echo "}"
  } > deploy/upstream.conf
}
reload_nginx() { $COMPOSE exec -T nginx nginx -t && $COMPOSE exec -T nginx nginx -s reload; }

echo "=== Building image ==="
$COMPOSE build "$NEW_SVC"

echo "=== Ensuring db + nginx are up ==="
$COMPOSE up -d db
$COMPOSE up -d "$OLD_SVC" nginx

echo "=== Starting $NEW_SVC (active: $OLD_SVC) ==="
$COMPOSE up -d --no-deps --force-recreate "$NEW_SVC"
CID="$($COMPOSE ps -q "$NEW_SVC")"

echo "=== Waiting for $NEW_SVC to be healthy (max 240s) ==="
for i in $(seq 1 48); do
  STATUS="$(docker inspect --format '{{.State.Health.Status}}' "$CID" 2>/dev/null || echo unknown)"
  echo "  [$i] $STATUS"
  [ "$STATUS" = "healthy" ] && break
  if [ "$STATUS" = "unhealthy" ] || [ "$i" = 48 ]; then
    echo "::error:: $NEW_SVC not healthy - ROLLBACK, $OLD_SVC keeps serving"
    docker logs --tail 80 "$CID" || true
    $COMPOSE stop -t 30 "$NEW_SVC" || true
    $COMPOSE rm -f "$NEW_SVC" || true
    exit 1
  fi
  sleep 5
done

echo "=== Switching nginx: $NEW_SVC primary, $OLD_SVC backup ==="
write_upstream "$NEW_SVC" "$OLD_SVC"
reload_nginx
sleep 10   # drain in-flight requests on the old colour

echo "=== Stopping $OLD_SVC gracefully ==="
write_upstream "$NEW_SVC"
reload_nginx
$COMPOSE stop -t 30 "$OLD_SVC"
echo "$NEW" > "$STATE_FILE"

docker image prune -f >/dev/null 2>&1 || true
echo "=== Deploy complete: $NEW_SVC live ==="
