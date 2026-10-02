import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError} from "@/lib/api-auth";

export async function GET() {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const [downloads, notifications] = await Promise.all([
    prisma.download.findMany({
      where: { userId: authz.session.user.id },
      include: { book: true, order: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: authz.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ downloads, notifications });
}

export async function PATCH(request: Request) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const body = await request.json();
  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: authz.session.user.id, read: false },
      data: { read: true },
    });
  } else if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: authz.session.user.id },
      data: { read: true },
    });
  }
  return NextResponse.json({ ok: true });
}
