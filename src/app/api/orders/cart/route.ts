import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession, orderNumber } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";

const itemSchema = z.object({
  bookId: z.string(),
  productType: z.enum(["EBOOK", "PHYSICAL"]),
  quantity: z.number().int().min(1),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  deliveryMethod: z.enum(["EMAIL", "WHATSAPP"]).optional(),
  physicalFulfillment: z.enum(["DELIVERY", "PICKUP"]).optional(),
  pickupPointId: z.string().optional(),
  couponCode: z.string().optional(),
  buyer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    whatsapp: z.string().optional(),
  }),
  address: z
    .object({
      fullName: z.string(),
      phone: z.string(),
      province: z.string(),
      municipality: z.string(),
      neighborhood: z.string(),
      street: z.string(),
      houseNumber: z.string(),
      whatsapp: z.string().optional(),
      referencePoint: z.string().optional(),
    })
    .optional(),
});

async function resolveCoupon(code: string | undefined, orderTotal: number) {
  if (!code?.trim()) return { discount: 0, code: null as string | null };
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !coupon.active) {
    throw new Error("Cupão inválido ou inactivo.");
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("Cupão expirado.");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Cupão esgotado.");
  }
  if (orderTotal < coupon.minOrderTotal) {
    throw new Error(`Pedido mínimo para o cupão: ${coupon.minOrderTotal} Kz`);
  }
  let discount = 0;
  if (coupon.percentOff) {
    discount = Math.floor((orderTotal * coupon.percentOff) / 100);
  } else if (coupon.amountOff) {
    discount = coupon.amountOff;
  }
  discount = Math.min(discount, orderTotal);
  return { discount, code: coupon.code };
}

export async function POST(request: Request) {
  const authz = await requireSession();
  const session = "session" in authz ? authz.session : null;

  try {
    const data = schema.parse(await request.json());

    let userId = session?.user?.id;
    if (!userId) {
      const existing = await prisma.user.findUnique({
        where: { email: data.buyer.email.toLowerCase() },
      });
      if (existing) userId = existing.id;
      else {
        const created = await prisma.user.create({
          data: {
            name: data.buyer.name,
            email: data.buyer.email.toLowerCase(),
            phone: data.buyer.phone,
            whatsapp: data.buyer.whatsapp,
            passwordHash: await bcrypt.hash(randomUUID(), 10),
            role: "SELLER",
            seller: {
              create: {
                bio: "Profissional registado na Mesclar Logística",
                isActive: true,
              },
            },
          },
        });
        userId = created.id;
      }
    }

    const books = await prisma.book.findMany({
      where: {
        id: { in: data.items.map((i) => i.bookId) },
        status: "PUBLISHED",
      },
      include: { seller: { include: { bankAccounts: true, user: true } } },
    });

    if (books.length !== data.items.length) {
      return NextResponse.json({ error: "Um ou mais livros indisponíveis." }, { status: 400 });
    }

    const bySeller = new Map<string, typeof data.items>();
    for (const item of data.items) {
      const book = books.find((b) => b.id === item.bookId)!;
      const list = bySeller.get(book.sellerId) ?? [];
      list.push(item);
      bySeller.set(book.sellerId, list);
    }

    const sellerTotals = new Map<string, number>();
    let grandTotal = 0;
    for (const [sellerId, items] of bySeller) {
      const sellerBooks = books.filter((b) => b.sellerId === sellerId);
      let total = 0;
      for (const item of items) {
        const book = sellerBooks.find((b) => b.id === item.bookId)!;
        const unit =
          item.productType === "PHYSICAL" ? (book.pricePhysical ?? 0) : book.priceEbook;
        total += unit * item.quantity;
      }
      sellerTotals.set(sellerId, total);
      grandTotal += total;
    }

    let couponDiscount = 0;
    let appliedCoupon: string | null = null;
    try {
      const resolved = await resolveCoupon(data.couponCode, grandTotal);
      couponDiscount = resolved.discount;
      appliedCoupon = resolved.code;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cupão inválido." },
        { status: 400 }
      );
    }

    const createdOrders: {
      orderId: string;
      orderNumber: string;
      sellerId: string;
      total: number;
      bank: unknown;
      free?: boolean;
      downloadTokens?: string[];
    }[] = [];

    let remainingDiscount = couponDiscount;
    const sellerIds = [...bySeller.keys()];

    for (let si = 0; si < sellerIds.length; si++) {
      const sellerId = sellerIds[si]!;
      const items = bySeller.get(sellerId)!;
      const sellerBooks = books.filter((b) => b.sellerId === sellerId);
      const seller = sellerBooks[0]!.seller;

      let total = sellerTotals.get(sellerId) ?? 0;
      const lineItems = items.map((item) => {
        const book = sellerBooks.find((b) => b.id === item.bookId)!;
        const unit =
          item.productType === "PHYSICAL" ? (book.pricePhysical ?? 0) : book.priceEbook;
        const line = unit * item.quantity;
        return { item, book, unit, line };
      });

      // Distribute discount proportionally; last seller gets remainder
      let orderDiscount = 0;
      if (couponDiscount > 0 && grandTotal > 0) {
        if (si === sellerIds.length - 1) {
          orderDiscount = remainingDiscount;
        } else {
          orderDiscount = Math.floor((total / grandTotal) * couponDiscount);
          remainingDiscount -= orderDiscount;
        }
      }
      orderDiscount = Math.min(orderDiscount, total);
      const payable = Math.max(0, total - orderDiscount);

      const allFree =
        payable === 0 && lineItems.every((l) => l.item.productType === "EBOOK");

      const num = orderNumber();

      if (allFree) {
        const order = await prisma.order.create({
          data: {
            orderNumber: num,
            userId,
            sellerId,
            status: "COMPLETED",
            customerName: data.buyer.name,
            customerEmail: data.buyer.email,
            customerPhone: data.buyer.phone,
            customerWhatsapp: data.buyer.whatsapp,
            subtotal: total,
            total: 0,
            couponCode: appliedCoupon,
            discountAmount: orderDiscount,
            items: {
              create: lineItems.map((l) => ({
                bookId: l.book.id,
                productType: "EBOOK",
                quantity: l.item.quantity,
                unitPrice: l.unit,
                totalPrice: l.line,
                deliveryMethod: data.deliveryMethod ?? "EMAIL",
              })),
            },
            payment: {
              create: { amount: 0, reference: num, approvedAt: new Date() },
            },
          },
        });

        const tokens: string[] = [];
        for (const l of lineItems) {
          const token = randomUUID();
          await prisma.download.create({
            data: {
              userId,
              bookId: l.book.id,
              orderId: order.id,
              token,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
          tokens.push(token);
          await prisma.book.update({
            where: { id: l.book.id },
            data: { salesCount: { increment: l.item.quantity } },
          });
        }

        createdOrders.push({
          orderId: order.id,
          orderNumber: num,
          sellerId,
          total: 0,
          bank: null,
          free: true,
          downloadTokens: tokens,
        });
        continue;
      }

      const hasPhysical = lineItems.some((l) => l.item.productType === "PHYSICAL");
      const order = await prisma.order.create({
        data: {
          orderNumber: num,
          userId,
          sellerId,
          status: "AWAITING_PAYMENT",
          customerName: data.buyer.name,
          customerEmail: data.buyer.email,
          customerPhone: data.buyer.phone,
          customerWhatsapp: data.buyer.whatsapp,
          subtotal: total,
          total: payable,
          couponCode: appliedCoupon,
          discountAmount: orderDiscount,
          items: {
            create: lineItems.map((l) => ({
              bookId: l.book.id,
              productType: l.item.productType,
              quantity: l.item.quantity,
              unitPrice: l.unit,
              totalPrice: l.line,
              deliveryMethod:
                l.item.productType === "EBOOK" ? (data.deliveryMethod ?? "EMAIL") : undefined,
              physicalFulfillment:
                l.item.productType === "PHYSICAL" ? data.physicalFulfillment : undefined,
            })),
          },
          payment: { create: { amount: payable, reference: num } },
          physicalDelivery: hasPhysical
            ? {
                create: {
                  fulfillment: data.physicalFulfillment ?? "PICKUP",
                  pickupPointId:
                    data.physicalFulfillment === "PICKUP" ? data.pickupPointId : undefined,
                  fullName: data.address?.fullName ?? data.buyer.name,
                  phone: data.address?.phone ?? data.buyer.phone,
                  whatsapp: data.address?.whatsapp ?? data.buyer.whatsapp,
                  province: data.address?.province,
                  municipality: data.address?.municipality,
                  neighborhood: data.address?.neighborhood,
                  street: data.address?.street,
                  houseNumber: data.address?.houseNumber,
                  referencePoint: data.address?.referencePoint,
                },
              }
            : undefined,
        },
      });

      await prisma.notification.create({
        data: {
          userId: seller.userId,
          type: "NEW_ORDER",
          title: "Novo pedido (carrinho)",
          message: `Pedido ${num} — ${lineItems.length} item(ns)`,
          link: "/profissional/pedidos",
        },
      });

      await sendEmail({
        to: data.buyer.email,
        template: "order_created",
        data: {
          orderNumber: num,
          total: `${payable} Kz`,
        },
      });

      const bank =
        seller.bankAccounts.find((b) => b.isDefault) ?? seller.bankAccounts[0] ?? null;

      createdOrders.push({
        orderId: order.id,
        orderNumber: num,
        sellerId,
        total: payable,
        bank: bank
          ? {
              bankName: bank.bankName,
              accountHolder: bank.accountHolder,
              iban: bank.iban,
              expressPhone: bank.expressPhone || seller.user?.phone || seller.user?.whatsapp || null,
              accountNumber: bank.accountNumber,
            }
          : null,
      });
    }

    if (appliedCoupon && couponDiscount > 0) {
      await prisma.coupon.update({
        where: { code: appliedCoupon },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ orders: createdOrders });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erro no checkout do carrinho." }, { status: 500 });
  }
}
