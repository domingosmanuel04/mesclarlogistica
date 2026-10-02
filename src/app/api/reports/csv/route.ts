import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "orders";

  let rows: Record<string, string | number>[] = [];

  if (authz.session.user.role === "ADMIN" && type === "orders") {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { book: true } },
        seller: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    rows = orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      customer: o.customerName,
      email: o.customerEmail,
      seller: o.seller.user.name,
      total: o.total,
      items: o.items.map((i) => i.book.title).join(" | "),
      createdAt: o.createdAt.toISOString(),
    }));
  } else {
    const seller =
      authz.session.user.role === "ADMIN"
        ? await prisma.seller.findFirst()
        : await getSellerForUser(authz.session.user.id);
    if (!seller) return NextResponse.json({ error: "Sem perfil profissional." }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: { in: ["PAYMENT_APPROVED", "COMPLETED", "DELIVERED", "PICKED_UP", "SHIPPED"] },
      },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    rows = orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      customer: o.customerName,
      total: o.total,
      items: o.items.map((i) => `${i.book.title} x${i.quantity}`).join(" | "),
      createdAt: o.createdAt.toISOString(),
    }));
  }

  if (!rows.length) {
    return new NextResponse("orderNumber,status,total\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mesclar-relatorio.csv"',
      },
    });
  }

  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mesclar-relatorio.csv"',
    },
  });
}
