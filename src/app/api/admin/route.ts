import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError} from "@/lib/api-auth";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "overview";

  if (resource === "users") {
    return NextResponse.json(
      await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          seller: { select: { id: true, isActive: true } },
        },
        take: 200,
      })
    );
  }

  if (resource === "sellers") {
    return NextResponse.json(
      await prisma.seller.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { books: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    );
  }

  if (resource === "books") {
    const status = searchParams.get("status");
    return NextResponse.json(
      await prisma.book.findMany({
        where: status ? { status: status as never } : undefined,
        include: {
          author: true,
          category: true,
          seller: { include: { user: true } },
        },
        orderBy: { updatedAt: "desc" },
      })
    );
  }

  if (resource === "payments") {
    return NextResponse.json(
      await prisma.order.findMany({
        where: {
          status: { in: ["PROOF_SENT", "PAYMENT_UNDER_REVIEW", "PAYMENT_APPROVED", "PAYMENT_REJECTED"] },
        },
        include: {
          payment: { include: { proof: true } },
          items: { include: { book: true } },
          user: true,
          seller: { include: { user: true } },
        },
        orderBy: { updatedAt: "desc" },
      })
    );
  }

  if (resource === "categories") {
    return NextResponse.json(
      await prisma.category.findMany({
        include: { subcategories: true, _count: { select: { books: true } } },
        orderBy: { sortOrder: "asc" },
      })
    );
  }

  if (resource === "pickup-points") {
    return NextResponse.json(
      await prisma.pickupPoint.findMany({ orderBy: { name: "asc" } })
    );
  }

  if (resource === "settings") {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return NextResponse.json(settings);
  }

  const [users, books, orders, pendingBooks, pendingPayments] = await Promise.all([
    prisma.user.count(),
    prisma.book.count({ where: { status: "PUBLISHED" } }),
    prisma.order.count(),
    prisma.book.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROOF_SENT" } }),
  ]);

  return NextResponse.json({ users, books, orders, pendingBooks, pendingPayments });
}

const pickupSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(3),
  province: z.string().min(2),
  municipality: z.string().min(2),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
});

const settingsSchema = z.object({
  contactEmail: z.string().email().optional().nullable(),
  contactWhatsapp: z.string().optional().nullable(),
  aboutText: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const body = await request.json();
  const action = body.action as string;

  if (action === "create-pickup") {
    const data = pickupSchema.parse(body);
    const row = await prisma.pickupPoint.create({ data });
    return NextResponse.json(row, { status: 201 });
  }

  if (action === "create-category") {
    const data = categorySchema.parse(body);
    const { slugify } = await import("@/lib/catalog-map");
    const row = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        sortOrder: (await prisma.category.count()) + 1,
      },
    });
    return NextResponse.json(row, { status: 201 });
  }

  if (action === "toggle-seller") {
    const seller = await prisma.seller.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json(seller);
  }

  if (action === "unpublish-book") {
    const book = await prisma.book.update({
      where: { id: body.id },
      data: { status: "REJECTED", rejectionReason: body.reason || "Removido pela administração" },
    });
    return NextResponse.json(book);
  }

  if (action === "publish-book") {
    const book = await prisma.book.update({
      where: { id: body.id },
      data: { status: "PUBLISHED", rejectionReason: null },
    });
    return NextResponse.json(book);
  }

  return NextResponse.json({ error: "Acção inválida." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const body = await request.json();
  if (body.action === "settings") {
    const data = settingsSchema.parse(body);
    const row = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    return NextResponse.json(row);
  }

  if (body.action === "update-pickup") {
    const { id, ...rest } = body;
    const data = pickupSchema.partial().parse(rest);
    const row = await prisma.pickupPoint.update({ where: { id }, data });
    return NextResponse.json(row);
  }

  return NextResponse.json({ error: "Acção inválida." }, { status: 400 });
}
