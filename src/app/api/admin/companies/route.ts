import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const status = searchParams.get("status");
  const certified = searchParams.get("certified");

  const where: any = {};

  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status;
  }

  if (certified === "true") {
    where.certified = true;
  } else if (certified === "false") {
    where.certified = false;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { services: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(companies);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let category = "";
    let location = "Luanda";
    let coverage = "Nacional";
    let services = "";
    let description = "";
    let email = "";
    let phone = "";
    let whatsapp = "";
    let website = "";
    let logoUrl: string | null = null;
    let certified = false;
    let active = true;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string)?.trim() || "";
      category = (formData.get("category") as string)?.trim() || "";
      location = (formData.get("location") as string)?.trim() || "Luanda";
      coverage = (formData.get("coverage") as string)?.trim() || "Nacional";
      services = (formData.get("services") as string)?.trim() || "";
      description = (formData.get("description") as string)?.trim() || "";
      email = (formData.get("email") as string)?.trim() || "";
      phone = (formData.get("phone") as string)?.trim() || "";
      whatsapp = (formData.get("whatsapp") as string)?.trim() || "";
      website = (formData.get("website") as string)?.trim() || "";
      certified = formData.get("certified") === "true";
      active = formData.get("active") !== "false";

      const logoFile = formData.get("logoFile") as File | null;
      if (logoFile && logoFile.size > 0) {
        const saved = await saveUpload("companies", logoFile);
        logoUrl = `/api/uploads/${saved.relativePath}`;
      }
    } else {
      const body = await request.json();
      name = (body.name || "").trim();
      category = (body.category || "").trim();
      location = (body.location || "Luanda").trim();
      coverage = (body.coverage || "Nacional").trim();
      services = (body.services || "").trim();
      description = (body.description || "").trim();
      email = (body.email || "").trim();
      phone = (body.phone || "").trim();
      whatsapp = (body.whatsapp || "").trim();
      website = (body.website || "").trim();
      logoUrl = body.logoUrl || null;
      certified = Boolean(body.certified);
      active = body.active !== false;
    }

    if (!name || !category || !services) {
      return NextResponse.json(
        { error: "Nome da Empresa, Categoria e Serviços Principais são obrigatórios." },
        { status: 400 }
      );
    }

    const created = await prisma.company.create({
      data: {
        name,
        category,
        location,
        coverage,
        services,
        description: description || null,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        website: website || null,
        logoUrl,
        certified,
        status: "APPROVED", // Criação directa pelo Admin já nasce aprovada
        active,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao criar empresa pelo admin:", err);
    return NextResponse.json({ error: err.message || "Erro ao criar empresa." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const id = formData.get("id") as string;
      if (!id) return NextResponse.json({ error: "ID da empresa em falta." }, { status: 400 });

      const existing = await prisma.company.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

      let logoUrl = (formData.get("logoUrl") as string)?.trim() || existing.logoUrl;
      const logoFile = formData.get("logoFile") as File | null;
      if (logoFile && logoFile.size > 0) {
        const saved = await saveUpload("companies", logoFile);
        logoUrl = `/api/uploads/${saved.relativePath}`;
      }

      const updated = await prisma.company.update({
        where: { id },
        data: {
          name: (formData.get("name") as string)?.trim() || existing.name,
          category: (formData.get("category") as string)?.trim() || existing.category,
          location: (formData.get("location") as string)?.trim() || existing.location,
          coverage: (formData.get("coverage") as string)?.trim() || existing.coverage,
          services: (formData.get("services") as string)?.trim() || existing.services,
          description: (formData.get("description") as string)?.trim() ?? existing.description,
          email: (formData.get("email") as string)?.trim() ?? existing.email,
          phone: (formData.get("phone") as string)?.trim() ?? existing.phone,
          whatsapp: (formData.get("whatsapp") as string)?.trim() ?? existing.whatsapp,
          website: (formData.get("website") as string)?.trim() ?? existing.website,
          logoUrl,
          certified: formData.has("certified") ? formData.get("certified") === "true" : existing.certified,
          active: formData.has("active") ? formData.get("active") === "true" : existing.active,
        },
      });

      return NextResponse.json(updated);
    }

    const body = await request.json();
    const { id, action, reason, certified, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da empresa em falta." }, { status: 400 });
    }

    if (action === "approve") {
      const updated = await prisma.company.update({
        where: { id },
        data: {
          status: "APPROVED",
          active: true,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ ok: true, company: updated });
    }

    if (action === "reject") {
      const updated = await prisma.company.update({
        where: { id },
        data: {
          status: "REJECTED",
          active: false,
          rejectionReason: reason?.trim() || "A empresa não cumpre os requisitos do directório oficial.",
        },
      });
      return NextResponse.json({ ok: true, company: updated });
    }

    if (action === "toggle-certified") {
      const updated = await prisma.company.update({
        where: { id },
        data: { certified: Boolean(certified) },
      });
      return NextResponse.json({ ok: true, certified: updated.certified });
    }

    if (action === "toggle-active") {
      const updated = await prisma.company.update({
        where: { id },
        data: { active: Boolean(active) },
      });
      return NextResponse.json({ ok: true, active: updated.active });
    }

    // Generic update
    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.category ? { category: body.category.trim() } : {}),
        ...(body.location ? { location: body.location.trim() } : {}),
        ...(body.coverage ? { coverage: body.coverage.trim() } : {}),
        ...(body.services ? { services: body.services.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
        ...(body.email !== undefined ? { email: body.email?.trim() || null } : {}),
        ...(body.phone !== undefined ? { phone: body.phone?.trim() || null } : {}),
        ...(body.whatsapp !== undefined ? { whatsapp: body.whatsapp?.trim() || null } : {}),
        ...(body.website !== undefined ? { website: body.website?.trim() || null } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
        ...(typeof certified === "boolean" ? { certified } : {}),
        ...(typeof active === "boolean" ? { active } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Erro ao atualizar empresa pelo admin:", err);
    return NextResponse.json({ error: err.message || "Erro ao atualizar empresa." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da empresa em falta." }, { status: 400 });
  }

  await prisma.company.delete({ where: { id } });

  return NextResponse.json({ ok: true, message: "Empresa eliminada com sucesso." });
}
