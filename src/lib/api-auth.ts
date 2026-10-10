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
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        seller = await prisma.seller.create({
          data: {
            userId: user.id,
            bio: "Profissional registado na Mesclar Logística",
            isActive: true,
          },
        });
        if (user.role === "CUSTOMER") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "SELLER" },
          }).catch(() => null);
        }
      }
    }
    return seller;
  } catch (err) {
    console.error("Error in getSellerForUser:", err);
    return null;
  }
}

export async function getAuthorForUser(userId: string) {
  try {
    let author = await prisma.author.findUnique({ where: { userId } });
    if (!author) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        let baseSlug = user.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        if (!baseSlug) baseSlug = `autor-${userId.slice(-6)}`;
        let finalSlug = baseSlug;
        const exists = await prisma.author.findUnique({ where: { slug: finalSlug } });
        if (exists) finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

        author = await prisma.author.create({
          data: {
            userId: user.id,
            name: user.name,
            slug: finalSlug,
            bio: "Profissional e Especialista em Logística registado na Mesclar Logística.",
            specialty: "Logística e Procurement",
            photoUrl: "/authors/default.jpg",
            isValidated: true,
            validatedAt: new Date(),
          },
        });
      }
    }
    return author;
  } catch (err) {
    console.error("Error in getAuthorForUser:", err);
    return null;
  }
}

export function isAuthError(result: Authed | AuthError): result is AuthError {
  return "error" in result;
}

export function orderNumber() {
  const n = randomInt(100000, 999999).toString();
  return `MES-${n}`;
}
