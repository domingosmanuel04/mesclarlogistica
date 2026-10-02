import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, orderNumber, isAuthError} from "@/lib/api-auth";
import { randomUUID } from "crypto";

const schema = z.object({
  bookId: z.string().min(1),
  productType: z.enum(["EBOOK", "PHYSICAL"]),
  quantity: z.number().int().min(1).default(1),
  deliveryMethod: z.enum(["EMAIL", "WHATSAPP"]).optional(),
  physicalFulfillment: z.enum(["DELIVERY", "PICKUP"]).optional(),
  pickupPointId: z.string().optional(),
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
      whatsapp: z.string().optional(),
      province: z.string(),
      municipality: z.string(),
      neighborhood: z.string(),
      street: z.string(),
      houseNumber: z.string(),
      referencePoint: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const authz = await requireSession();
  // Guest checkout allowed — use buyer email to attach or create sessionless order with user if logged in
  const session = "session" in authz ? authz.session : null;

  try {
    const data = schema.parse(await request.json());
    const book = await prisma.book.findFirst({
      where: { id: data.bookId, status: "PUBLISHED" },
      include: { seller: { include: { bankAccounts: true, user: true } } },
    });
    if (!book) {
      return NextResponse.json({ error: "Livro indisponível." }, { status: 404 });
    }

    const unitPrice =
      data.productType === "PHYSICAL" ? (book.pricePhysical ?? 0) : book.priceEbook;
    const total = unitPrice * data.quantity;

    let userId = session?.user?.id;
    if (!userId) {
      const existing = await prisma.user.findUnique({
        where: { email: data.buyer.email.toLowerCase() },
      });
      if (existing) {
        userId = existing.id;
      } else {
        const created = await prisma.user.create({
          data: {
            name: data.buyer.name,
            email: data.buyer.email.toLowerCase(),
            phone: data.buyer.phone,
            whatsapp: data.buyer.whatsapp,
            passwordHash: await (await import("bcryptjs")).hash(randomUUID(), 10),
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

    // Free eBook → complete immediately
    if (data.productType === "EBOOK" && unitPrice === 0) {
      const num = orderNumber();
      const order = await prisma.order.create({
        data: {
          orderNumber: num,
          userId,
          sellerId: book.sellerId,
          status: "COMPLETED",
          customerName: data.buyer.name,
          customerEmail: data.buyer.email,
          customerPhone: data.buyer.phone,
          customerWhatsapp: data.buyer.whatsapp,
          subtotal: 0,
          total: 0,
          items: {
            create: {
              bookId: book.id,
              productType: "EBOOK",
              quantity: 1,
              unitPrice: 0,
              totalPrice: 0,
              deliveryMethod: data.deliveryMethod ?? "EMAIL",
            },
          },
          payment: {
            create: {
              amount: 0,
              reference: num,
              approvedAt: new Date(),
            },
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
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.book.update({
        where: { id: book.id },
        data: { salesCount: { increment: 1 } },
      });

      return NextResponse.json({
        orderId: order.id,
        orderNumber: num,
        status: "COMPLETED",
        downloadToken: token,
        free: true,
      });
    }

    const num = orderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber: num,
        userId,
        sellerId: book.sellerId,
        status: "AWAITING_PAYMENT",
        customerName: data.buyer.name,
        customerEmail: data.buyer.email,
        customerPhone: data.buyer.phone,
        customerWhatsapp: data.buyer.whatsapp,
        subtotal: total,
        total,
        items: {
          create: {
            bookId: book.id,
            productType: data.productType,
            quantity: data.quantity,
            unitPrice,
            totalPrice: total,
            deliveryMethod:
              data.productType === "EBOOK" ? (data.deliveryMethod ?? "EMAIL") : undefined,
            physicalFulfillment:
              data.productType === "PHYSICAL" ? data.physicalFulfillment : undefined,
          },
        },
        payment: {
          create: {
            amount: total,
            reference: num,
          },
        },
        physicalDelivery:
          data.productType === "PHYSICAL"
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
      include: {
        payment: true,
        seller: { include: { bankAccounts: true, user: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: book.seller.userId,
        type: "NEW_ORDER",
        title: "Novo pedido",
        message: `Pedido ${num} — ${book.title}`,
        link: "/profissional/pedidos",
      },
    });

    const bank =
      order.seller.bankAccounts.find((b) => b.isDefault) ?? order.seller.bankAccounts[0];

    return NextResponse.json({
      orderId: order.id,
      orderNumber: num,
      status: order.status,
      total,
      bank: bank
        ? {
            bankName: bank.bankName,
            accountHolder: bank.accountHolder,
            iban: bank.iban,
            expressPhone: bank.expressPhone || order.seller.user?.phone || order.seller.user?.whatsapp || null,
            accountNumber: bank.accountNumber,
          }
        : null,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar pedido." }, { status: 500 });
  }
}

export async function GET() {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const role = authz.session.user.role;
  const userId = authz.session.user.id;

  if (role === "ADMIN") {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { book: true } },
        payment: { include: { proof: true } },
        user: true,
        seller: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(orders);
  }

  if (role === "SELLER") {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return NextResponse.json([]);
    const orders = await prisma.order.findMany({
      where: { sellerId: seller.id },
      include: {
        items: { include: { book: true } },
        payment: { include: { proof: true } },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { book: true } },
      payment: { include: { proof: true } },
      downloads: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
