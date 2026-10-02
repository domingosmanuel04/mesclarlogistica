import { NextResponse } from "next/server";
import { requireSession, isAuthError } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const currentUserId = authRes.session.user.id;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        author: {
          select: { photoUrl: true },
        },
      },
      orderBy: [
        { role: "desc" }, // ADMINs e SELLERs primeiro
        { name: "asc" },
      ],
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      photoUrl: u.author?.photoUrl || null,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error("Erro ao pesquisar utilizadores para o chat:", error);
    return NextResponse.json({ error: "Erro ao buscar utilizadores." }, { status: 500 });
  }
}
