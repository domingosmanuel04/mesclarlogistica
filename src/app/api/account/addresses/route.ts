import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/api-auth";

export async function GET() {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const rows = await prisma.address.findMany({
    where: { userId: authz.session.user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(rows);
}

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  whatsapp: z.string().optional(),
  province: z.string().min(2),
  municipality: z.string().min(2),
  neighborhood: z.string().min(1),
  street: z.string().min(1),
  houseNumber: z.string().min(1),
  reference: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const data = schema.parse(await request.json());
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: authz.session.user.id },
      data: { isDefault: false },
    });
  }

  const row = await prisma.address.create({
    data: {
      userId: authz.session.user.id,
      ...data,
      isDefault: data.isDefault ?? false,
    },
  });
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(request: Request) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id em falta" }, { status: 400 });
  await prisma.address.deleteMany({ where: { id, userId: authz.session.user.id } });
  return NextResponse.json({ ok: true });
}
