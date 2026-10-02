import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const validateSchema = z.object({
  code: z.string().min(2),
  orderTotal: z.number().int().min(0),
});

export async function POST(request: Request) {
  const rl = rateLimit(`coupon:${clientIp(request)}`, 30, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados pedidos." }, { status: 429 });
  }

  try {
    const body = validateSchema.parse(await request.json());
    const coupon = await prisma.coupon.findUnique({
      where: { code: body.code.trim().toUpperCase() },
    });
    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Cupão inválido." }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "Cupão expirado." }, { status: 400 });
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Cupão esgotado." }, { status: 400 });
    }
    if (body.orderTotal < coupon.minOrderTotal) {
      return NextResponse.json(
        { error: `Pedido mínimo: ${coupon.minOrderTotal} Kz` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.percentOff) {
      discount = Math.floor((body.orderTotal * coupon.percentOff) / 100);
    } else if (coupon.amountOff) {
      discount = coupon.amountOff;
    }
    discount = Math.min(discount, body.orderTotal);

    return NextResponse.json({
      code: coupon.code,
      discount,
      total: body.orderTotal - discount,
      percentOff: coupon.percentOff,
      amountOff: coupon.amountOff,
    });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}

/** Admin: list / create coupons */
export async function GET() {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

const createSchema = z.object({
  code: z.string().min(2),
  description: z.string().optional(),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOff: z.number().int().min(1).optional(),
  minOrderTotal: z.number().int().min(0).default(0),
  maxUses: z.number().int().min(1).optional(),
});

export async function PUT(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;
  const data = createSchema.parse(await request.json());
  const row = await prisma.coupon.upsert({
    where: { code: data.code.toUpperCase() },
    update: {
      description: data.description,
      percentOff: data.percentOff,
      amountOff: data.amountOff,
      minOrderTotal: data.minOrderTotal,
      maxUses: data.maxUses,
      active: true,
    },
    create: {
      code: data.code.toUpperCase(),
      description: data.description,
      percentOff: data.percentOff,
      amountOff: data.amountOff,
      minOrderTotal: data.minOrderTotal,
      maxUses: data.maxUses,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
