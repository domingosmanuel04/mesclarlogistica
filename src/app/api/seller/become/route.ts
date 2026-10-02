import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError} from "@/lib/api-auth";

export async function POST() {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const userId = authz.session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

  if (user.role === "ADMIN") {
    return NextResponse.json({ role: "ADMIN", ok: true });
  }

  if (user.role === "CUSTOMER") {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "SELLER" },
    });
  }

  const existing = await prisma.seller.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.seller.create({
      data: {
        userId,
        bio: "Profissional Mesclar",
        bankAccounts: {
          create: {
            bankName: "BAI",
            accountHolder: user.name,
            iban: "AO06004000000000000000000",
            accountNumber: "0000000000",
            isDefault: true,
          },
        },
      },
    });
  }

  return NextResponse.json({ ok: true, role: "SELLER" });
}
