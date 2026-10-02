import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/api-auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { bookId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(reviews);
}

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request, { params }: Params) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const { id: bookId } = await params;
  const body = schema.parse(await request.json());

  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
  });
  if (!book) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 });

  const owned = await prisma.orderItem.findFirst({
    where: {
      bookId,
      order: {
        userId: authz.session.user.id,
        status: { in: ["PAYMENT_APPROVED", "COMPLETED", "DELIVERED", "PICKED_UP"] },
      },
    },
  });

  // allow review if purchased OR free ebook download
  const downloaded = await prisma.download.findFirst({
    where: { bookId, userId: authz.session.user.id },
  });

  if (!owned && !downloaded && book.priceEbook > 0) {
    return NextResponse.json(
      { error: "Só pode avaliar após compra ou download." },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: {
      userId_bookId: { userId: authz.session.user.id, bookId },
    },
    update: { rating: body.rating, comment: body.comment },
    create: {
      userId: authz.session.user.id,
      bookId,
      rating: body.rating,
      comment: body.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.book.update({
    where: { id: bookId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
