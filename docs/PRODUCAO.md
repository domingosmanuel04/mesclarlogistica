# Produção — Mesclar Logística

## Checklist

1. **Domínio + HTTPS** — proxy (Caddy/Nginx/Traefik) para a porta `3020` ou contentor `web`.
2. **Variáveis** (`.env` / secrets):
   - `DATABASE_URL`
   - `AUTH_SECRET` (longo, aleatório)
   - `NEXTAUTH_URL=https://seu-dominio`
   - `RESEND_API_KEY` + `EMAIL_FROM` (emails reais)
   - `WHATSAPP_API_URL` + `WHATSAPP_API_TOKEN` (opcional)
   - `NEXT_PUBLIC_SENTRY_DSN` (opcional)
3. **Base de dados**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
4. **Backups** — `pg_dump` diário do volume `mesclar_pg_data`.
5. **Healthcheck** — `GET /api/health` (usado por orquestradores).
6. **Smoke**
   ```bash
   npm run smoke
   npx playwright test
   ```

## Docker

```bash
docker compose up -d --build
```

Portas: app `3020`, Postgres host `5439`.

## Cupões demo

| Código | Efeito |
|--------|--------|
| `MESCLAR10` | 10% de desconto (mín. 5.000 Kz) |
| `FRETE0` | 2.000 Kz de desconto (mín. 10.000 Kz) |

Criados no seed. Gestão em `/admin/cupoes`.

## Suporte

Chat flutuante no site → tickets em `/admin/suporte`.

## Sync pós-deploy

```bash
bash scripts/finalize.sh
```

