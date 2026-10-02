import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

const MAX_BANNER_MB = 5;

/** Público: banners activos. Seller/Admin: ?mine=1 lista as próprias. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "1";

  if (mine) {
    const authz = await requireRoles(["SELLER", "ADMIN"]);
    if (isAuthError(authz)) return authz.error;

    const seller =
      authz.session.user.role === "ADMIN"
        ? null
        : await getSellerForUser(authz.session.user.id);

    const rows = await prisma.training.findMany({
      where: seller ? { sellerId: seller.id } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rows);
  }

  const rows = await prisma.training.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      bannerUrl: true,
      linkUrl: true,
      sortOrder: true,
    },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    let seller = await getSellerForUser(authz.session.user.id);
    if (!seller && authz.session.user.role === "ADMIN") {
      seller = await prisma.seller.findFirst();
    }
    if (!seller) {
      return NextResponse.json({ error: "Perfil de profissional em falta." }, { status: 400 });
    }

    const form = await request.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim() || undefined;
    const linkUrl = String(form.get("linkUrl") || "").trim();
    const sortOrder = Number(form.get("sortOrder") || 0) || 0;
    const active = form.get("active") !== "false";

    const parsed = z
      .object({
        title: z.string().min(3),
        description: z.string().optional(),
        linkUrl: z.string().url(),
        sortOrder: z.number().int(),
        active: z.boolean(),
      })
      .safeParse({ title, description, linkUrl, sortOrder, active });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Preencha título e um link válido (https://...)." },
        { status: 400 }
      );
    }

    const banner = form.get("banner");
    if (!(banner instanceof File) || banner.size === 0) {
      return NextResponse.json({ error: "Envie a imagem do banner." }, { status: 400 });
    }
    if (!banner.type.startsWith("image/")) {
      return NextResponse.json({ error: "O banner deve ser uma imagem." }, { status: 400 });
    }
    if (banner.size > MAX_BANNER_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Banner no máximo ${MAX_BANNER_MB} MB.` },
        { status: 400 }
      );
    }

    const saved = await saveUpload("banners", banner);
    const row = await prisma.training.create({
      data: {
        sellerId: seller.id,
        title: parsed.data.title,
        description: parsed.data.description,
        linkUrl: parsed.data.linkUrl,
        bannerUrl: `/api/uploads/${saved.relativePath}`,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar formação." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const contentType = request.headers.get("content-type") || "";

  try {
    const seller =
      authz.session.user.role === "ADMIN"
        ? null
        : await getSellerForUser(authz.session.user.id);

    // 1. SUPORTE A MULTIPART/FORM-DATA (COM NOVO BANNER)
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const id = String(form.get("id") || "");
      if (!id) {
        return NextResponse.json({ error: "ID em falta." }, { status: 400 });
      }

      const existing = await prisma.training.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
      }
      if (seller && existing.sellerId !== seller.id) {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      }

      const title = form.get("title") ? String(form.get("title")).trim() : undefined;
      const description = form.get("description") !== null ? String(form.get("description")).trim() : undefined;
      const linkUrl = form.get("linkUrl") ? String(form.get("linkUrl")).trim() : undefined;
      const sortOrder = form.get("sortOrder") !== null ? Number(form.get("sortOrder")) : undefined;
      const active = form.get("active") !== null ? form.get("active") === "true" || form.get("active") === "1" : undefined;

      let bannerUrl: string | undefined = undefined;
      const banner = form.get("banner");
      if (banner instanceof File && banner.size > 0) {
        if (!banner.type.startsWith("image/")) {
          return NextResponse.json({ error: "O banner deve ser uma imagem." }, { status: 400 });
        }
        if (banner.size > MAX_BANNER_MB * 1024 * 1024) {
          return NextResponse.json(
            { error: `Banner no máximo ${MAX_BANNER_MB} MB.` },
            { status: 400 }
          );
        }
        const saved = await saveUpload("banners", banner);
        bannerUrl = `/api/uploads/${saved.relativePath}`;
      }

      const updated = await prisma.training.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(linkUrl ? { linkUrl } : {}),
          ...(bannerUrl ? { bannerUrl } : {}),
          ...(sortOrder !== undefined && !isNaN(sortOrder) ? { sortOrder } : {}),
          ...(active !== undefined ? { active } : {}),
        },
      });

      return NextResponse.json(updated);
    }

    // 2. SUPORTE A JSON
    const body = z
      .object({
        id: z.string(),
        active: z.boolean().optional(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        linkUrl: z.string().url().optional(),
        bannerUrl: z.string().optional(),
        sortOrder: z.number().int().optional(),
      })
      .parse(await request.json());

    const existing = await prisma.training.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }
    if (seller && existing.sellerId !== seller.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const row = await prisma.training.update({
      where: { id: body.id },
      data: {
        active: body.active,
        title: body.title,
        description: body.description,
        linkUrl: body.linkUrl,
        bannerUrl: body.bannerUrl,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erro ao actualizar." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const seller =
    authz.session.user.role === "ADMIN"
      ? null
      : await getSellerForUser(authz.session.user.id);

  const existing = await prisma.training.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
  if (seller && existing.sellerId !== seller.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.training.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
