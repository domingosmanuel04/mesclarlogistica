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

export async function GET() {
  try {
    const authz = await requireRoles(["SELLER", "ADMIN"]);
    if (isAuthError(authz)) return authz.error;

    let seller = null;
    try {
      seller = await getSellerForUser(authz.session.user.id);
      if (!seller && authz.session.user.role === "ADMIN") {
        seller = await prisma.seller.findFirst();
      }
    } catch {
      seller = null;
    }

    if (!seller) {
      return NextResponse.json([]);
    }

    try {
      const articles = await prisma.article.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });
      return NextResponse.json(articles);
    } catch {
      return NextResponse.json([]);
    }
  } catch {
    return NextResponse.json([]);
  }
}

const createArticleSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10, "O conteúdo do artigo deve ter pelo menos 10 caracteres."),
  coverUrl: z.string().optional().nullable(),
  category: z.string().optional().default("Logística e Procurement"),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  readTime: z.number().int().positive().optional().default(5),
});

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  let seller = await getSellerForUser(authz.session.user.id);
  if (!seller && authz.session.user.role === "ADMIN") {
    // If admin doesn't have a seller profile yet, create or find one
    seller = await prisma.seller.findFirst();
    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          userId: authz.session.user.id,
          bio: "Administrador / Autor oficial Mesclar",
          isActive: true,
        },
      });
    }
  }
  if (!seller) {
    return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createArticleSchema.parse(body);

    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) baseSlug = `artigo-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Estimate reading time from content word count
    const words = data.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.ceil(words / 200));

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || data.content.replace(/<[^>]*>/g, " ").slice(0, 160).trim(),
        content: data.content,
        coverUrl: data.coverUrl || "/services/gestao-contratos.jpg",
        category: data.category || "Logística e Procurement",
        tags: data.tags || "Logística, Procurement, Cadeia de Abastecimento",
        status: data.status,
        readTime: data.readTime || estimatedMinutes,
        sellerId: seller.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    console.error("Erro ao criar artigo:", err);
    return NextResponse.json({ error: "Falha ao gravar o artigo." }, { status: 500 });
  }
}
