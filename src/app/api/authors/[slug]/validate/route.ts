import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const { slug } = await params;
  const author = await prisma.author.findUnique({
    where: { slug },
  });

  if (!author) {
    return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
  }

  const userId = authz.session.user.id;
  const isAdmin = authz.session.user.role === "ADMIN";
  const isOwner =
    author.userId === userId ||
    isAdmin ||
    (!author.userId && authz.session.user.email?.toLowerCase() === author.contactEmail?.toLowerCase());

  if (!isOwner) {
    return NextResponse.json(
      { error: "Apenas o dono deste perfil pode validar o currículo." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const targetValidated = body.action === "unvalidate" ? false : true;

  const updated = await prisma.author.update({
    where: { id: author.id },
    data: {
      isValidated: targetValidated,
      validatedAt: targetValidated ? new Date() : null,
      ...(!author.userId ? { userId } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    isValidated: updated.isValidated,
    validatedAt: updated.validatedAt,
  });
}
