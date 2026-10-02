import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { id } = await params;
  const seller = await getSellerForUser(authz.session.user.id);

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  // Permission check: owner or ADMIN
  if (authz.session.user.role !== "ADMIN" && article.sellerId !== seller?.id) {
    return NextResponse.json({ error: "Sem permissão para este artigo." }, { status: 403 });
  }

  return NextResponse.json(article);
}

const updateArticleSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10).optional(),
  coverUrl: z.string().optional().nullable(),
  category: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  readTime: z.number().int().positive().optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { id } = await params;
  const seller = await getSellerForUser(authz.session.user.id);

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  if (authz.session.user.role !== "ADMIN" && article.sellerId !== seller?.id) {
    return NextResponse.json({ error: "Sem permissão para alterar este artigo." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateArticleSchema.parse(body);

    let updatedSlug = article.slug;
    if (data.slug && data.slug !== article.slug) {
      const baseSlug = slugify(data.slug);
      let candidate = baseSlug;
      let counter = 1;
      while (
        await prisma.article.findFirst({
          where: { slug: candidate, id: { not: id } },
        })
      ) {
        candidate = `${baseSlug}-${counter++}`;
      }
      updatedSlug = candidate;
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.slug ? { slug: updatedSlug } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        ...(data.content ? { content: data.content } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.readTime ? { readTime: data.readTime } : {}),
        ...(data.status === "PUBLISHED" && !article.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar artigo." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { id } = await params;
  const seller = await getSellerForUser(authz.session.user.id);

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  if (authz.session.user.role !== "ADMIN" && article.sellerId !== seller?.id) {
    return NextResponse.json({ error: "Sem permissão para eliminar este artigo." }, { status: 403 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true, id });
}
