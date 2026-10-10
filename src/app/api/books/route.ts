import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError} from "@/lib/api-auth";
import { slugify } from "@/lib/catalog-map";
import { saveUpload } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  author: z.string().min(2),
  authorBio: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  productType: z.enum(["EBOOK", "PHYSICAL", "BOTH"]),
  priceEbook: z.coerce.number().min(0).default(0),
  pricePhysical: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0).default(0),
  summary: z.string().optional(),
  isbn: z.string().optional(),
  year: z.coerce.number().optional(),
  publisher: z.string().optional(),
  keywords: z.string().optional(),
});

export async function GET() {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const seller =
    authz.session.user.role === "ADMIN"
      ? null
      : await getSellerForUser(authz.session.user.id);

  const books = await prisma.book.findMany({
    where: seller ? { sellerId: seller.id } : undefined,
    include: {
      author: true,
      category: true,
      seller: { include: { user: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    let seller = await getSellerForUser(authz.session.user.id);
    if (!seller && authz.session.user.role === "ADMIN") {
      seller = await prisma.seller.findFirst();
    }
    if (!seller) {
      return NextResponse.json({ error: "Perfil de profissional em falta." }, { status: 400 });
    }

    const form = await request.formData();
    const raw = Object.fromEntries(
      [...form.entries()].filter(([, v]) => typeof v === "string") as [string, string][]
    );
    const data = schema.parse({
      ...raw,
      priceEbook: raw.price ?? raw.priceEbook ?? 0,
      pricePhysical: raw.pricePhysical,
      stock: raw.stock ?? 0,
    });

    const category = await prisma.category.findUnique({ where: { slug: data.category } });
    if (!category) {
      return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
    }

    let subcategoryId: string | undefined;
    if (data.subcategory) {
      const sub =
        (await prisma.subcategory.findFirst({
          where: {
            categoryId: category.id,
            OR: [{ slug: slugify(data.subcategory) }, { name: { equals: data.subcategory, mode: "insensitive" } }],
          },
        })) ??
        (await prisma.subcategory.create({
          data: {
            name: data.subcategory,
            slug: slugify(data.subcategory),
            categoryId: category.id,
          },
        }));
      subcategoryId = sub.id;
    }

    const authorSlug = slugify(data.author);
    let author = await prisma.author.findUnique({ where: { slug: authorSlug } });
    if (!author) {
      const userAuthor = await prisma.author.findUnique({ where: { userId: authz.session.user.id } });
      if (userAuthor && userAuthor.name.toLowerCase() === data.author.toLowerCase()) {
        author = userAuthor;
      } else {
        author = await prisma.author.create({
          data: {
            name: data.author,
            slug: authorSlug,
            bio: data.authorBio,
            specialty: category.name,
            ...(userAuthor ? {} : { userId: authz.session.user.id }),
          },
        });
      }
    } else if (data.authorBio) {
      author = await prisma.author.update({
        where: { id: author.id },
        data: { bio: data.authorBio },
      });
    }

    let coverUrl: string | undefined;
    let pdfPath: string | undefined;
    const cover = form.get("cover");
    if (cover instanceof File && cover.size > 0) {
      const saved = await saveUpload("covers", cover);
      coverUrl = `/api/uploads/${saved.relativePath}`;
    }
    const pdf = form.get("pdf");
    if (pdf instanceof File && pdf.size > 0) {
      const saved = await saveUpload("ebooks", pdf);
      pdfPath = saved.relativePath;
    }

    let slug = slugify(data.title);
    const exists = await prisma.book.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;

    const priceEbook =
      data.productType === "PHYSICAL" ? 0 : Number(data.priceEbook || raw.price || 0);
    const pricePhysical =
      data.productType === "EBOOK"
        ? undefined
        : Number(data.pricePhysical ?? raw.price ?? 0) || undefined;

    const book = await prisma.book.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        summary: data.summary,
        authorId: author.id,
        sellerId: seller.id,
        categoryId: category.id,
        subcategoryId,
        productType: data.productType,
        status: "PUBLISHED",
        priceEbook,
        pricePhysical,
        stockQuantity: data.stock,
        coverUrl,
        pdfPath: pdfPath ?? (data.productType !== "PHYSICAL" ? "ebooks/demo.pdf" : undefined),
        isbn: data.isbn,
        publishYear: data.year,
        publisher: data.publisher,
        keywords: data.keywords
          ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } }).catch(() => []);
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "BOOK_APPROVED" as const,
          title: "Novo livro publicado",
          message: `"${book.title}" foi publicado na plataforma.`,
          link: `/livros/${book.slug}`,
        })),
      }).catch(() => {});
    }

    return NextResponse.json({ id: book.id, slug: book.slug, status: book.status }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erro ao publicar livro." }, { status: 500 });
  }
}
