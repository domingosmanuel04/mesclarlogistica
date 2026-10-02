import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError, orderNumber } from "@/lib/api-auth";

const schema = z.object({
  bookId: z.string().min(1),
});

/** Free published eBook → download token (login recommended, guest ok with session or anonymous). */
export async function POST(request: Request) {
  try {
    const { bookId } = schema.parse(await request.json());
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        status: "PUBLISHED",
        productType: { in: ["EBOOK", "BOTH"] },
        priceEbook: 0,
      },
      include: { author: true, seller: true },
    });
    if (!book) {
      return NextResponse.json({ error: "eBook gratuito indisponível." }, { status: 404 });
    }

    const authz = await requireSession();
    let userId: string;
    if (!isAuthError(authz)) {
      userId = authz.session.user.id;
    } else {
      // guest free download user
      const guest = await prisma.user.upsert({
        where: { email: "guest-downloads@mesclar.ao" },
        update: {},
        create: {
          name: "Downloads gratuitos",
          email: "guest-downloads@mesclar.ao",
          passwordHash: await (await import("bcryptjs")).hash(randomUUID(), 10),
          role: "SELLER",
        },
      });
      userId = guest.id;
    }

    const num = orderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber: num,
        userId,
        sellerId: book.sellerId,
        status: "COMPLETED",
        customerName: "Download gratuito",
        customerEmail: "guest@mesclar.ao",
        customerPhone: "—",
        subtotal: 0,
        total: 0,
        items: {
          create: {
            bookId: book.id,
            productType: "EBOOK",
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            deliveryMethod: "EMAIL",
          },
        },
        payment: {
          create: { amount: 0, reference: num, approvedAt: new Date() },
        },
      },
    });

    const token = randomUUID();
    await prisma.download.create({
      data: {
        userId,
        bookId: book.id,
        orderId: order.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.book.update({
      where: { id: book.id },
      data: { salesCount: { increment: 1 } },
    });

    return NextResponse.json({ downloadToken: token, url: `/api/download/${token}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao libertar download." }, { status: 500 });
  }
}
