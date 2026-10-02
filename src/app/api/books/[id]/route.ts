import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError} from "@/lib/api-auth";

interface Params {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]),
  reason: z.string().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { id } = await params;
  const body = patchSchema.parse(await request.json());

  const book = await prisma.book.findUnique({
    where: { id },
    include: { seller: true },
  });
  if (!book) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 });

  const status =
    body.action === "approve"
      ? "PUBLISHED"
      : body.action === "reject"
        ? "REJECTED"
        : "CHANGES_REQUESTED";

  const updated = await prisma.book.update({
    where: { id },
    data: {
      status,
      rejectionReason: body.reason || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: book.seller.userId,
      type: body.action === "approve" ? "BOOK_APPROVED" : "BOOK_REJECTED",
      title: body.action === "approve" ? "Livro aprovado" : "Livro precisa de revisão",
      message:
        body.action === "approve"
          ? `"${book.title}" foi publicado na Mesclar.`
          : `"${book.title}": ${body.reason || "Solicite alterações e reenvie."}`,
      link: "/profissional/livros",
    },
  });

  return NextResponse.json(updated);
}
