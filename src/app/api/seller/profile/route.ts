import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError} from "@/lib/api-auth";

export async function GET() {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const seller = await getSellerForUser(authz.session.user.id);
  if (!seller && authz.session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem perfil profissional." }, { status: 404 });
  }

  const target = seller ?? (await prisma.seller.findFirst());
  if (!target) return NextResponse.json({ error: "Sem profissionais registados." }, { status: 404 });

  const full = await prisma.seller.findUnique({
    where: { id: target.id },
    include: {
      user: { select: { name: true, email: true, phone: true, whatsapp: true, registrationNumber: true } },
      bankAccounts: true,
      books: { select: { id: true, status: true, salesCount: true, priceEbook: true } },
      orders: {
        include: { payment: true },
        where: { status: { in: ["PAYMENT_APPROVED", "COMPLETED", "DELIVERED", "PICKED_UP"] } },
      },
    },
  });

  const received = full!.orders.reduce((s, o) => s + o.total, 0);
  return NextResponse.json({
    ...full,
    stats: {
      books: full!.books.length,
      published: full!.books.filter((b) => b.status === "PUBLISHED").length,
      pending: full!.books.filter((b) => b.status === "PENDING").length,
      sales: full!.books.reduce((s, b) => s + b.salesCount, 0),
      received,
    },
  });
}

const schema = z.object({
  bio: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  iban: z.string().optional(),
  expressPhone: z.string().optional(),
  accountNumber: z.string().optional(),
});

export async function PATCH(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const seller = await getSellerForUser(authz.session.user.id);
  if (!seller) return NextResponse.json({ error: "Sem perfil." }, { status: 404 });

  const data = schema.parse(await request.json());

  await prisma.seller.update({
    where: { id: seller.id },
    data: { bio: data.bio },
  });

  await prisma.user.update({
    where: { id: authz.session.user.id },
    data: { phone: data.phone, whatsapp: data.whatsapp },
  });

  if (data.bankName || data.accountHolder || data.iban || data.expressPhone || data.accountNumber) {
    const existing = await prisma.bankAccount.findFirst({
      where: { sellerId: seller.id, isDefault: true },
    });

    const updateData = {
      bankName: data.bankName || existing?.bankName || "BAI",
      accountHolder: data.accountHolder || existing?.accountHolder || authz.session.user.name || "Titular",
      iban: data.iban || existing?.iban || "AO06000000000000000000000",
      expressPhone: data.expressPhone !== undefined ? (data.expressPhone ? data.expressPhone.trim() : null) : existing?.expressPhone || null,
      accountNumber: data.accountNumber || existing?.accountNumber || "000000000",
    };

    if (existing) {
      await prisma.bankAccount.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      await prisma.bankAccount.create({
        data: {
          sellerId: seller.id,
          isDefault: true,
          ...updateData,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
