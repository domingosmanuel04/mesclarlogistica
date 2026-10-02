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
  if (!roles.includes(result.session.user.role)) {
    return { error: NextResponse.json({ error: "Sem permissão." }, { status: 403 }) };
  }
  return result;
}

export async function getSellerForUser(userId: string) {
  return prisma.seller.findUnique({ where: { userId } });
}

export function isAuthError(result: Authed | AuthError): result is AuthError {
  return "error" in result;
}

export function orderNumber() {
  const n = randomInt(100000, 999999).toString();
  return `MES-${n}`;
}
