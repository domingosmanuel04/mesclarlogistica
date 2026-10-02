import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { slugify } from "@/lib/catalog-map";

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
      { excerpt: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
      { seller: { user: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              author: {
                select: {
                  id: true,
                  slug: true,
                  photoUrl: true,
                  specialty: true,
                },
              },
            },
          },
        },
      },
    },
    take: 250,
  });

  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const action = body.action as string;

    // 1. ALTERAR ESTADO (PUBLISHED, DRAFT, ARCHIVED)
    if (action === "toggle-status") {
      const { articleId, status } = body;
      if (!articleId || !["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status)) {
        return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
      }

      const updated = await prisma.article.update({
        where: { id: articleId },
        data: {
          status,
          publishedAt: status === "PUBLISHED" ? new Date() : undefined,
        },
      });

      return NextResponse.json({ ok: true, status: updated.status });
    }

    // 2. EDITAR ARTIGO
    if (action === "edit") {
      const { articleId, title, excerpt, content, category, tags, readTime, status } = body;
      if (!articleId || !title || !content) {
        return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
      }

      const existing = await prisma.article.findUnique({ where: { id: articleId } });
      if (!existing) {
        return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
      }

      let slug = existing.slug;
      if (title.trim() !== existing.title) {
        slug = slugify(title);
        const slugExists = await prisma.article.findFirst({
          where: { slug, NOT: { id: articleId } },
        });
        if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      }

      const updated = await prisma.article.update({
        where: { id: articleId },
        data: {
          title: title.trim(),
          slug,
          excerpt: excerpt?.trim() || null,
          content: content.trim(),
          category: category?.trim() || "Logística e Procurement",
          tags: tags?.trim() || null,
          readTime: readTime ? Number(readTime) : 5,
          status: status || existing.status,
          publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
        },
      });

      return NextResponse.json({ ok: true, article: updated });
    }

    // 3. ELIMINAR ARTIGO
    if (action === "delete") {
      const { articleId } = body;
      if (!articleId) {
        return NextResponse.json({ error: "ID do artigo em falta." }, { status: 400 });
      }

      await prisma.article.delete({ where: { id: articleId } });
      return NextResponse.json({ ok: true });
    }

    // 4. CRIAR NOVO ARTIGO
    if (action === "create") {
      const { title, excerpt, content, category, tags, readTime, status, sellerId } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
      }

      let targetSellerId = sellerId;
      if (!targetSellerId) {
        const firstSeller = await prisma.seller.findFirst();
        targetSellerId = firstSeller?.id;
      }

      if (!targetSellerId) {
        return NextResponse.json({ error: "É necessário ter pelo menos um profissional registado." }, { status: 400 });
      }

      let slug = slugify(title);
      const slugExists = await prisma.article.findUnique({ where: { slug } });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

      const newArticle = await prisma.article.create({
        data: {
          sellerId: targetSellerId,
          title: title.trim(),
          slug,
          excerpt: excerpt?.trim() || null,
          content: content.trim(),
          category: category?.trim() || "Logística e Procurement",
          tags: tags?.trim() || null,
          readTime: readTime ? Number(readTime) : 5,
          status: status || "PUBLISHED",
          publishedAt: status === "DRAFT" ? null : new Date(),
        },
      });

      return NextResponse.json({ ok: true, article: newArticle }, { status: 201 });
    }

    return NextResponse.json({ error: "Acção não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("[admin-articles-api] Error:", error);
    return NextResponse.json({ error: "Erro ao processar acção de artigo." }, { status: 500 });
  }
}
