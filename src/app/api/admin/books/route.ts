import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const status = searchParams.get("status");

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      { isbn: { contains: q, mode: "insensitive" } },
      { seller: { user: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          specialty: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      seller: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          orderItems: true,
          reviews: true,
        },
      },
    },
    take: 250,
  });

  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const action = body.action as string;

    // 1. PUBLICAR LIVRO
    if (action === "publish") {
      const { bookId } = body;
      if (!bookId) return NextResponse.json({ error: "ID do livro em falta." }, { status: 400 });

      const updated = await prisma.book.update({
        where: { id: bookId },
        data: { status: "PUBLISHED", rejectionReason: null },
      });

      return NextResponse.json({ ok: true, status: updated.status });
    }

    // 2. REJEITAR / REMOVER LIVRO COM MOTIVO
    if (action === "reject") {
      const { bookId, reason } = body;
      if (!bookId) return NextResponse.json({ error: "ID do livro em falta." }, { status: 400 });

      const updated = await prisma.book.update({
        where: { id: bookId },
        data: {
          status: "REJECTED",
          rejectionReason: reason?.trim() || "Removido do catálogo pela administração.",
        },
      });

      return NextResponse.json({ ok: true, status: updated.status });
    }

    // 3. ALTERAR DESTAQUE (FEATURED)
    if (action === "toggle-feature") {
      const { bookId, featured } = body;
      if (!bookId) return NextResponse.json({ error: "ID do livro em falta." }, { status: 400 });

      const updated = await prisma.book.update({
        where: { id: bookId },
        data: { featured: Boolean(featured) },
      });

      return NextResponse.json({ ok: true, featured: updated.featured });
    }

    // 4. EDITAR VALORES E STOCK
    if (action === "edit") {
      const { bookId, title, priceEbook, pricePhysical, stockQuantity, status } = body;
      if (!bookId) return NextResponse.json({ error: "ID do livro em falta." }, { status: 400 });

      const updated = await prisma.book.update({
        where: { id: bookId },
        data: {
          title: title ? String(title).trim() : undefined,
          priceEbook: typeof priceEbook === "number" ? priceEbook : undefined,
          pricePhysical: typeof pricePhysical === "number" ? pricePhysical : undefined,
          stockQuantity: typeof stockQuantity === "number" ? stockQuantity : undefined,
          status: status || undefined,
        },
      });

      return NextResponse.json({ ok: true, book: updated });
    }

    // 5. ELIMINAR LIVRO
    if (action === "delete") {
      const { bookId } = body;
      if (!bookId) return NextResponse.json({ error: "ID do livro em falta." }, { status: 400 });

      await prisma.book.delete({ where: { id: bookId } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acção não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("[admin-books-api] Error:", error);
    return NextResponse.json({ error: "Erro ao processar acção de livro." }, { status: 500 });
  }
}
