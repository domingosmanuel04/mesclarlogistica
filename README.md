# Mesclar Logística | Procurement

Biblioteca digital e marketplace especializado em livros, eBooks e conteúdos da **cadeia logística** (logística, procurement, compras, importação, armazém, frotas, supply chain).

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js App Router (API Routes)
- **Base de dados:** PostgreSQL + Prisma ORM
- **Autenticação:** Auth.js (NextAuth v5) com JWT e roles `ADMIN`, `SELLER`, `CUSTOMER`

## Começar

### Docker (recomendado)

```bash
docker compose up --build -d
docker compose logs -f web   # ver logs
```

Abrir **[http://localhost:3020](http://localhost:3020)** (porta dedicada — evita conflito com outros projectos).

Parar: `docker compose down`

### Local (sem Docker)

```bash
cp .env.example .env
# Edite DATABASE_URL e AUTH_SECRET

npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Contas demo (após seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@mesclar.ao | admin123 |
| Vendedor | vendedor@mesclar.ao | vendedor123 |

## Versão actual

- **UI completa** com identidade preto/dourado/branco, homepage, biblioteca de eBooks, detalhes, autores, carrinho, modal de checkout, áreas de conta/vendedor/admin.
- **Dados fictícios:** 10 livros, 5 autores, 8 categorias, 3 vendedores (`src/data/mock-data.ts`).
- **Prisma schema** com todas as entidades solicitadas.
- **Auth + registo** via API (requer PostgreSQL).
- **Download protegido** em `/api/download/[token]` (autenticação + pedido aprovado + link temporário).
- **Stubs** de email e WhatsApp para entrega automática de eBooks após aprovação de pagamento.

## Logo

Substitua o componente textual em `src/components/layout/logo.tsx` por imagem em `public/logo.png` quando tiver o ficheiro oficial.

## Estrutura

```
src/
  app/          # Páginas e API
  components/   # UI reutilizável
  contexts/     # Carrinho e checkout
  data/         # Mock demo
  lib/          # Auth, Prisma, email, storage
prisma/         # Schema e seed
uploads/        # Capas, PDFs, comprovativos (privados)
```

## Próximos passos

1. Ligar formulários de publicação e pedidos à API Prisma.
2. Upload real de capa/PDF/comprovativo (`src/lib/storage.ts`).
3. Fluxo vendedor: aprovar/rejeitar comprovativo e disparar email/WhatsApp.
4. Middleware de permissões por role nas rotas `/admin` e `/vendedor`.
