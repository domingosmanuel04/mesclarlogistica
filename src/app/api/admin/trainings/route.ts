import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();
    const status = searchParams.get("status");

    const where: any = {};

    if (status === "ACTIVE") {
      where.active = true;
    } else if (status === "INACTIVE") {
      where.active = false;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { linkUrl: { contains: q, mode: "insensitive" } },
        { seller: { user: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const trainings = await prisma.training.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        seller: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                author: {
                  select: {
                    id: true,
                    slug: true,
                    photoUrl: true,
                    specialty: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 250,
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("[admin-trainings-api-get] Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const action = body.action as string;

    // 1. ALTERAR ESTADO (ACTIVO / INACTIVO)
    if (action === "toggle-active") {
      const { trainingId, active } = body;
      if (!trainingId) {
        return NextResponse.json({ error: "ID da formação em falta." }, { status: 400 });
      }

      const updated = await prisma.training.update({
        where: { id: trainingId },
        data: { active: Boolean(active) },
      });

      return NextResponse.json({ ok: true, active: updated.active });
    }

    // 2. EDITAR FORMAÇÃO
    if (action === "edit") {
      const { trainingId, title, description, bannerUrl, linkUrl, sortOrder, active } = body;
      if (!trainingId || !title || !linkUrl) {
        return NextResponse.json({ error: "Título e link de destino são obrigatórios." }, { status: 400 });
      }

      const updated = await prisma.training.update({
        where: { id: trainingId },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          bannerUrl: bannerUrl?.trim() || undefined,
          linkUrl: linkUrl.trim(),
          sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
          active: typeof active === "boolean" ? active : undefined,
        },
      });

      return NextResponse.json({ ok: true, training: updated });
    }

    // 3. ELIMINAR FORMAÇÃO
    if (action === "delete") {
      const { trainingId } = body;
      if (!trainingId) {
        return NextResponse.json({ error: "ID da formação em falta." }, { status: 400 });
      }

      await prisma.training.delete({ where: { id: trainingId } });
      return NextResponse.json({ ok: true });
    }

    // 4. CRIAR NOVA FORMAÇÃO
    if (action === "create") {
      const { title, description, bannerUrl, linkUrl, sortOrder, active, sellerId } = body;
      if (!title || !linkUrl) {
        return NextResponse.json({ error: "Título e link são obrigatórios." }, { status: 400 });
      }

      let targetSellerId = sellerId;
      if (!targetSellerId) {
        const firstSeller = await prisma.seller.findFirst();
        targetSellerId = firstSeller?.id;
      }

      if (!targetSellerId) {
        return NextResponse.json({ error: "Nenhum profissional registado encontrado para associar." }, { status: 400 });
      }

      const newTraining = await prisma.training.create({
        data: {
          sellerId: targetSellerId,
          title: title.trim(),
          description: description?.trim() || null,
          bannerUrl: bannerUrl?.trim() || "/covers/supply-chain.jpg",
          linkUrl: linkUrl.trim(),
          sortOrder: sortOrder ? Number(sortOrder) : 0,
          active: active !== undefined ? Boolean(active) : true,
        },
      });

      return NextResponse.json({ ok: true, training: newTraining }, { status: 201 });
    }

    return NextResponse.json({ error: "Acção não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("[admin-trainings-api] Error:", error);
    return NextResponse.json({ error: "Erro ao processar acção de formação." }, { status: 500 });
  }
}
