import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

const MAX_BANNER_MB = 6;

/**
 * Público: lista de webinars activos.
 * Profissional/Admin: ?mine=1 lista os próprios webinars.
 */
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

    const rows = await prisma.webinar.findMany({
      where: seller ? { sellerId: seller.id } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rows);
  }

  const rows = await prisma.webinar.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      seller: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
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
      return NextResponse.json(
        { error: "Perfil de profissional em falta." },
        { status: 400 }
      );
    }

    const form = await request.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const linkUrl = String(form.get("linkUrl") || "").trim();
    const speaker = String(form.get("speaker") || "").trim() || undefined;
    const eventDateStr = form.get("eventDate") ? String(form.get("eventDate")) : undefined;
    const sortOrder = Number(form.get("sortOrder") || 0) || 0;
    const active = form.get("active") !== "false";

    const parsed = z
      .object({
        title: z.string().min(3, "Título deve ter pelo menos 3 caracteres."),
        description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres."),
        linkUrl: z.string().url("Link inválido. Insira um URL completo (ex: https://...)."),
        speaker: z.string().optional(),
        sortOrder: z.number().int(),
        active: z.boolean(),
      })
      .safeParse({ title, description, linkUrl, speaker, sortOrder, active });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const banner = form.get("banner");
    if (!(banner instanceof File) || banner.size === 0) {
      return NextResponse.json({ error: "Envie a imagem do banner do webinar." }, { status: 400 });
    }
    if (!banner.type.startsWith("image/")) {
      return NextResponse.json({ error: "O banner deve ser uma imagem válida." }, { status: 400 });
    }
    if (banner.size > MAX_BANNER_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Banner no máximo ${MAX_BANNER_MB} MB.` },
        { status: 400 }
      );
    }

    const saved = await saveUpload("webinars", banner);
    const eventDate = eventDateStr ? new Date(eventDateStr) : null;

    const row = await prisma.webinar.create({
      data: {
        sellerId: seller.id,
        title: parsed.data.title,
        description: parsed.data.description,
        linkUrl: parsed.data.linkUrl,
        speaker: parsed.data.speaker,
        eventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate : null,
        bannerUrl: `/api/uploads/${saved.relativePath}`,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar webinar." }, { status: 500 });
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

      const existing = await prisma.webinar.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Webinar não encontrado." }, { status: 404 });
      }
      if (seller && existing.sellerId !== seller.id) {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      }

      const title = form.get("title") ? String(form.get("title")).trim() : undefined;
      const description = form.get("description") !== null ? String(form.get("description")).trim() : undefined;
      const linkUrl = form.get("linkUrl") ? String(form.get("linkUrl")).trim() : undefined;
      const speaker = form.get("speaker") !== null ? String(form.get("speaker")).trim() : undefined;
      const eventDateRaw = form.get("eventDate");
      const eventDate =
        eventDateRaw && String(eventDateRaw).trim() !== ""
          ? new Date(String(eventDateRaw))
          : null;
      const sortOrder = form.get("sortOrder") !== null ? Number(form.get("sortOrder")) : undefined;
      const active =
        form.get("active") !== null
          ? form.get("active") === "true" || form.get("active") === "1"
          : undefined;

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
        const saved = await saveUpload("webinars", banner);
        bannerUrl = `/api/uploads/${saved.relativePath}`;
      }

      const updated = await prisma.webinar.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(linkUrl ? { linkUrl } : {}),
          ...(speaker !== undefined ? { speaker } : {}),
          ...(eventDateRaw !== undefined
            ? { eventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate : null }
            : {}),
          ...(bannerUrl ? { bannerUrl } : {}),
          ...(sortOrder !== undefined && !isNaN(sortOrder) ? { sortOrder } : {}),
          ...(active !== undefined ? { active } : {}),
        },
      });

      return NextResponse.json(updated);
    }

    // 2. SUPORTE A JSON (ex.: alternar active / sortOrder)
    const body = z
      .object({
        id: z.string(),
        active: z.boolean().optional(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        linkUrl: z.string().url().optional(),
        speaker: z.string().optional(),
        bannerUrl: z.string().optional(),
        sortOrder: z.number().int().optional(),
      })
      .parse(await request.json());

    const existing = await prisma.webinar.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: "Webinar não encontrado." }, { status: 404 });
    }
    if (seller && existing.sellerId !== seller.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const row = await prisma.webinar.update({
      where: { id: body.id },
      data: {
        active: body.active,
        title: body.title,
        description: body.description,
        linkUrl: body.linkUrl,
        speaker: body.speaker,
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
    return NextResponse.json({ error: "Erro ao actualizar webinar." }, { status: 500 });
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

  const existing = await prisma.webinar.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Webinar não encontrado." }, { status: 404 });
  }
  if (seller && existing.sellerId !== seller.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.webinar.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
