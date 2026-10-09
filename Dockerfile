# syntax=docker/dockerfile:1
# Production image (multi-stage). Dev keeps using docker-compose.yml + docker-entrypoint.sh.
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --include=dev

FROM deps AS build
WORKDIR /app
COPY . .
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat wget \
 && addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOST=0.0.0.0
COPY --from=build --chown=app:app /app/package.json /app/next.config.ts /app/server.js ./
COPY --from=build --chown=app:app /app/scripts ./scripts
COPY --from=build --chown=app:app /app/prisma ./prisma
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/.next ./.next
COPY --from=build --chown=app:app /app/node_modules ./node_modules
RUN mkdir -p /app/uploads && chown app:app /app/uploads
USER app
EXPOSE 3000

# Container is "healthy" only when the app AND the database answer
HEALTHCHECK --interval=10s --timeout=5s --start-period=90s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

STOPSIGNAL SIGTERM
CMD ["sh", "./scripts/docker-entrypoint.sh"]
