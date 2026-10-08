import { randomInt } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type Authed = { session: Session & { user: { id: string; role: Role; email?: string | null; name?: string | null } } };
type AuthError = { error: NextResponse };

export async function requireSession(): Promise<Authed | AuthError> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }
  return { session: session as Authed["session"] };
}

export async function requireRoles(roles: Role[]): Promise<Authed | AuthError> {
  const result = await requireSession();
  if ("error" in result) return result;

  const userRole = result.session.user.role;
  const isAllowed =
    roles.includes(userRole) ||
    (roles.includes("SELLER") && Boolean(result.session.user.id));

  if (!isAllowed) {
    return { error: NextResponse.json({ error: "Sem permissão." }, { status: 403 }) };
  }

  if (roles.includes("SELLER") && (!userRole || userRole === "CUSTOMER")) {
    result.session.user.role = "SELLER";
  }

  return result;
}

export async function getSellerForUser(userId: string) {
  try {
    let seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          userId,
          bio: "Profissional registado na Mesclar Logística",
          isActive: true,
        },
      });
    }
    return seller;
  } catch (err) {
    console.error("Error in getSellerForUser:", err);
    return {
      id: `seller-${userId}`,
      userId,
      bio: "Profissional registado na Mesclar Logística",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }
}

export function isAuthError(result: Authed | AuthError): result is AuthError {
  return "error" in result;
}

export function orderNumber() {
  const n = randomInt(100000, 999999).toString();
  return `MES-${n}`;
}
