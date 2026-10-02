import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, getSellerForUser, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";
import { randomUUID } from "crypto";
import { z } from "zod";
import { sendEmail, sendEbookDownloadEmail } from "@/lib/email";
import { sendEbookWhatsApp, sendOrderStatusWhatsApp } from "@/lib/whatsapp";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { clientIp, rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`proof:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Limite de uploads. Tente em ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const { id } = await params;
  const form = await request.formData();
  const file = form.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Comprovativo em falta." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true, seller: true },
  });
  if (!order?.payment) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const saved = await saveUpload("proofs", file);
  await prisma.paymentProof.upsert({
    where: { paymentId: order.payment.id },
    update: {
      filePath: saved.relativePath,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
    },
    create: {
      paymentId: order.payment.id,
      filePath: saved.relativePath,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
    },
  });

  await prisma.order.update({
    where: { id },
    data: { status: "PROOF_SENT" },
  });

  await prisma.notification.create({
    data: {
      userId: order.seller.userId,
      type: "NEW_PROOF",
      title: "Comprovativo recebido",
      message: `Pedido ${order.orderNumber} — analisar pagamento.`,
      link: "/profissional/pedidos",
    },
  });

  await sendEmail({
    to: order.customerEmail,
    template: "proof_received",
    data: { orderNumber: order.orderNumber },
  });

  return NextResponse.json({ ok: true, status: "PROOF_SENT" });
}

const patchSchema = z.object({
  action: z.enum([
    "approve",
    "reject",
    "ship",
    "pickup_ready",
    "deliver",
    "picked_up",
    "complete",
  ]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const { id } = await params;
  const body = patchSchema.parse(await request.json());

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      payment: true,
      items: { include: { book: { include: { author: true } } } },
      seller: true,
      physicalDelivery: { include: { pickupPoint: true } },
      downloads: true,
    },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const isAdmin = authz.session.user.role === "ADMIN";
  const seller = await getSellerForUser(authz.session.user.id);
  if (!isAdmin && (!seller || seller.id !== order.sellerId)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3020";

  if (body.action === "reject") {
    await prisma.order.update({
      where: { id },
      data: { status: "PAYMENT_REJECTED" },
    });
    await prisma.payment.update({
      where: { orderId: id },
      data: { rejectionReason: body.reason || "Comprovativo rejeitado" },
    });
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "PAYMENT_REJECTED",
        title: "Pagamento rejeitado",
        message: body.reason || `Pedido ${order.orderNumber} — envie novo comprovativo.`,
        link: "/conta/pedidos",
      },
    });
    return NextResponse.json({ status: "PAYMENT_REJECTED" });
  }

  if (body.action === "ship") {
    await prisma.order.update({ where: { id }, data: { status: "SHIPPED" } });
    if (order.physicalDelivery) {
      await prisma.physicalDelivery.update({
        where: { orderId: id },
        data: { trackingNotes: body.notes || "Enviado" },
      });
    }
    await sendEmail({
      to: order.customerEmail,
      template: "book_shipped",
      data: { orderNumber: order.orderNumber, notes: body.notes || "" },
    });
    if (order.customerWhatsapp) {
      await sendOrderStatusWhatsApp({
        to: order.customerWhatsapp,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        message: "O seu livro físico foi enviado.",
      });
    }
    return NextResponse.json({ status: "SHIPPED" });
  }

  if (body.action === "pickup_ready") {
    await prisma.order.update({ where: { id }, data: { status: "AVAILABLE_PICKUP" } });
    const pickup = order.physicalDelivery?.pickupPoint;
    const pickupText = pickup
      ? `${pickup.name} — ${pickup.address}, ${pickup.municipality}`
      : "ponto de recolha Mesclar";
    await sendEmail({
      to: order.customerEmail,
      template: "pickup_ready",
      data: { orderNumber: order.orderNumber, pickup: pickupText },
    });
    if (order.customerWhatsapp) {
      await sendOrderStatusWhatsApp({
        to: order.customerWhatsapp,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        message: `Pronto para levantamento em ${pickupText}.`,
      });
    }
    return NextResponse.json({ status: "AVAILABLE_PICKUP" });
  }

  if (body.action === "deliver") {
    await prisma.order.update({ where: { id }, data: { status: "DELIVERED" } });
    return NextResponse.json({ status: "DELIVERED" });
  }

  if (body.action === "picked_up") {
    await prisma.order.update({ where: { id }, data: { status: "PICKED_UP" } });
    return NextResponse.json({ status: "PICKED_UP" });
  }

  if (body.action === "complete") {
    await prisma.order.update({ where: { id }, data: { status: "COMPLETED" } });
    return NextResponse.json({ status: "COMPLETED" });
  }

  // approve payment
  await prisma.order.update({
    where: { id },
    data: { status: "PAYMENT_APPROVED" },
  });
  await prisma.payment.update({
    where: { orderId: id },
    data: { approvedAt: new Date(), rejectionReason: null },
  });

  for (const item of order.items) {
    if (item.productType === "EBOOK" || item.productType === "BOTH") {
      const token = randomUUID();
      await prisma.download.create({
        data: {
          userId: order.userId,
          bookId: item.bookId,
          orderId: order.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      const downloadUrl = `${base}/api/download/${token}`;
      await sendEbookDownloadEmail({
        to: order.customerEmail,
        bookTitle: item.book.title,
        authorName: item.book.author.name,
        orderNumber: order.orderNumber,
        downloadUrl,
      });
      if (order.customerWhatsapp) {
        await sendEbookWhatsApp({
          to: order.customerWhatsapp,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          bookTitle: item.book.title,
          downloadUrl,
        });
      }
    }
    await prisma.book.update({
      where: { id: item.bookId },
      data: {
        salesCount: { increment: item.quantity },
        ...(item.productType === "PHYSICAL" || item.productType === "BOTH"
          ? { stockQuantity: { decrement: item.quantity } }
          : {}),
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: "PAYMENT_APPROVED",
      title: "Pagamento aprovado",
      message: `Pedido ${order.orderNumber} confirmado. Aceda aos seus eBooks em Minha conta.`,
      link: "/conta/ebooks",
    },
  });

  await sendEmail({
    to: order.customerEmail,
    template: "payment_approved",
    data: {
      orderNumber: order.orderNumber,
      message: "Obrigado pela compra na Mesclar Logística.",
    },
  });

  return NextResponse.json({ status: "PAYMENT_APPROVED" });
}
