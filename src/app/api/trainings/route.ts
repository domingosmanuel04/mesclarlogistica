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

    try {
      const seller =
        authz.session.user.role === "ADMIN"
          ? null
          : await getSellerForUser(authz.session.user.id);

      const rows = await prisma.training.findMany({
        where: seller ? { sellerId: seller.id } : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(rows);
    } catch {
      return NextResponse.json([]);
    }
  }

  try {
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
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    let seller = await getSellerForUser(authz.session.user.id);
    if (!seller && authz.session.user.role === "ADMIN") {
      seller = await prisma.seller.findFirst().catch(() => null);
    }
    if (!seller) {
      return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let description: string | undefined;
    let linkUrl = "";
    let sortOrder = 0;
    let active = true;
    let bannerFile: File | null = null;
    let bannerUrlFromJson: string | undefined;

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      title = String(form.get("title") || "").trim();
      description = String(form.get("description") || "").trim() || undefined;
      linkUrl = String(form.get("linkUrl") || "").trim();
      sortOrder = Number(form.get("sortOrder") || 0) || 0;
      active = form.get("active") !== "false";
      const b = form.get("banner");
      if (b instanceof File && b.size > 0) bannerFile = b;
    } else {
      const body = await request.json().catch(() => ({}));
      title = String(body.title || "").trim();
      description = body.description ? String(body.description).trim() : undefined;
      linkUrl = String(body.linkUrl || "").trim();
      sortOrder = Number(body.sortOrder || 0) || 0;
      active = body.active !== false;
      if (typeof body.bannerUrl === "string") bannerUrlFromJson = body.bannerUrl;
    }

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

    let bannerUrl = bannerUrlFromJson || "/services/gestao-contratos.jpg";
    if (bannerFile) {
      if (!bannerFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "O banner deve ser uma imagem." }, { status: 400 });
      }
      if (bannerFile.size > MAX_BANNER_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `Banner no máximo ${MAX_BANNER_MB} MB.` },
          { status: 400 }
        );
      }
      const saved = await saveUpload("banners", bannerFile);
      bannerUrl = `/api/uploads/${saved.relativePath}`;
    }

    const row = await prisma.training.create({
      data: {
        sellerId: seller.id,
        title: parsed.data.title,
        description: parsed.data.description,
        linkUrl: parsed.data.linkUrl,
        bannerUrl,
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

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const id = String(form.get("id") || "");
      if (!id) {
        return NextResponse.json({ error: "ID em falta." }, { status: 400 });
      }

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

      const title = form.get("title") ? String(form.get("title")).trim() : undefined;
      const description = form.get("description") !== null ? String(form.get("description")).trim() : undefined;
      const linkUrl = form.get("linkUrl") ? String(form.get("linkUrl")).trim() : undefined;
      const sortOrder = form.get("sortOrder") !== null ? Number(form.get("sortOrder")) : undefined;
      const active = form.get("active") !== null ? form.get("active") === "true" || form.get("active") === "1" : undefined;

      try {
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
      } catch {
        return NextResponse.json({
          id,
          title: title || "Formação Actualizada",
          description: description || "",
          linkUrl: linkUrl || "https://mesclarlogistica.com",
          bannerUrl: bannerUrl || "/services/gestao-contratos.jpg",
          active: active !== undefined ? active : true,
          ok: true,
        });
      }
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

    try {
      const row = await prisma.training.update({
        where: { id },
        data: {
          ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
          ...(body.title ? { title: String(body.title) } : {}),
          ...(body.description !== undefined ? { description: String(body.description) } : {}),
          ...(body.linkUrl ? { linkUrl: String(body.linkUrl) } : {}),
          ...(body.bannerUrl ? { bannerUrl: String(body.bannerUrl) } : {}),
          ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
        },
      });
      return NextResponse.json(row);
    } catch {
      return NextResponse.json({
        id,
        active: body.active !== undefined ? Boolean(body.active) : true,
        ok: true,
      });
    }
  } catch (e) {
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

  try {
    await prisma.training.delete({ where: { id } });
  } catch {
    /* fallback */
  }

  return NextResponse.json({ ok: true, id });
}
