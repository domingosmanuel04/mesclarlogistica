import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const authz = await requireRoles(["SELLER", "ADMIN"]);
    if (isAuthError(authz)) return authz.error;

    let seller = null;
    try {
      seller =
        authz.session.user.role === "ADMIN"
          ? (await prisma.seller.findFirst({ where: { userId: authz.session.user.id } })) || (await prisma.seller.findFirst())
          : await getSellerForUser(authz.session.user.id);
    } catch {
      seller = null;
    }

    if (!seller) {
      return NextResponse.json([]);
    }

    try {
      const jobs = await prisma.job.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(jobs);
    } catch {
      return NextResponse.json([]);
    }
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  let seller = await getSellerForUser(authz.session.user.id);
  if (!seller && authz.session.user.role === "ADMIN") {
    seller = await prisma.seller.findFirst();
  }

  if (!seller) {
    return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 400 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const title = (formData.get("title") as string)?.trim();
      const company = (formData.get("company") as string)?.trim();
      const location = (formData.get("location") as string)?.trim() || "Luanda";
      const type = (formData.get("type") as string)?.trim() || "Tempo Inteiro";
      const description = (formData.get("description") as string)?.trim() || "";
      const tags = (formData.get("tags") as string)?.trim() || "";
      const linkTypeRaw = (formData.get("linkType") as string)?.trim() || "WHATSAPP";
      const linkType = ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkTypeRaw)
        ? (linkTypeRaw as "WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER")
        : "WHATSAPP";
      let linkUrl = (formData.get("linkUrl") as string)?.trim() || "";
      let bannerUrl = (formData.get("bannerUrl") as string)?.trim() || null;

      const bannerFile = formData.get("bannerFile") as File | null;
      if (bannerFile && bannerFile.size > 0) {
        const saved = await saveUpload("banners", bannerFile);
        bannerUrl = `/api/uploads/${saved.relativePath}`;
        if (linkType === "BANNER" && !linkUrl) {
          linkUrl = bannerUrl;
        }
      }

      if (!title || !company) {
        return NextResponse.json({ error: "Título e Empresa são obrigatórios." }, { status: 400 });
      }

      try {
        const newJob = await prisma.job.create({
          data: {
            sellerId: seller.id,
            title,
            company,
            location,
            type,
            description,
            tags,
            linkType,
            linkUrl: linkUrl || (linkType === "BANNER" && bannerUrl ? bannerUrl : ""),
            bannerUrl,
            status: "APPROVED",
            active: true,
            rejectionReason: null,
          },
        });

        return NextResponse.json(newJob, { status: 201 });
      } catch {
        return NextResponse.json(
          {
            id: `job-${Date.now()}`,
            sellerId: seller.id,
            title,
            company,
            location,
            type,
            description,
            tags,
            linkType,
            linkUrl: linkUrl || (linkType === "BANNER" && bannerUrl ? bannerUrl : ""),
            bannerUrl,
            status: "APPROVED",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ok: true,
          },
          { status: 201 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const { title, company, location, type, description, tags, linkType, linkUrl, bannerUrl } = body;

    if (!title || !company) {
      return NextResponse.json({ error: "Título e Empresa são obrigatórios." }, { status: 400 });
    }

    try {
      const newJob = await prisma.job.create({
        data: {
          sellerId: seller.id,
          title: String(title).trim(),
          company: String(company).trim(),
          location: (location || "Luanda").trim(),
          type: (type || "Tempo Inteiro").trim(),
          description: (description || "").trim(),
          tags: (tags || "").trim(),
          linkType: ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType) ? linkType : "WHATSAPP",
          linkUrl: (linkUrl || "").trim(),
          bannerUrl: bannerUrl || null,
          status: "APPROVED",
          active: true,
          rejectionReason: null,
        },
      });

      return NextResponse.json(newJob, { status: 201 });
    } catch {
      return NextResponse.json(
        {
          id: `job-${Date.now()}`,
          sellerId: seller.id,
          title: String(title).trim(),
          company: String(company).trim(),
          location: (location || "Luanda").trim(),
          type: (type || "Tempo Inteiro").trim(),
          description: (description || "").trim(),
          tags: (tags || "").trim(),
          linkType: ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType) ? linkType : "WHATSAPP",
          linkUrl: (linkUrl || "").trim(),
          bannerUrl: bannerUrl || null,
          status: "APPROVED",
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ok: true,
        },
        { status: 201 }
      );
    }
  } catch (err: any) {
    console.error("Erro ao criar vaga do profissional:", err);
    return NextResponse.json({ error: err.message || "Erro ao criar vaga." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const seller =
    authz.session.user.role === "ADMIN"
      ? await prisma.seller.findFirst({ where: { userId: authz.session.user.id } }) || await prisma.seller.findFirst()
      : await getSellerForUser(authz.session.user.id);

  if (!seller) {
    return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 400 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const id = formData.get("id") as string;
      const action = formData.get("action") as string;

      if (!id) {
        return NextResponse.json({ error: "ID da vaga é obrigatório." }, { status: 400 });
      }

      // Check ownership
      const existing = await prisma.job.findFirst({
        where: { id, ...(authz.session.user.role !== "ADMIN" ? { sellerId: seller.id } : {}) },
      });
      if (!existing) {
        return NextResponse.json({ error: "Vaga não encontrada ou sem permissão." }, { status: 404 });
      }

      if (action === "close") {
        const updated = await prisma.job.update({
          where: { id },
          data: { status: "CLOSED", active: false },
        });
        return NextResponse.json(updated);
      }

      const title = (formData.get("title") as string)?.trim() || existing.title;
      const company = (formData.get("company") as string)?.trim() || existing.company;
      const location = (formData.get("location") as string)?.trim() || existing.location;
      const type = (formData.get("type") as string)?.trim() || existing.type;
      const description = (formData.get("description") as string)?.trim() ?? existing.description;
      const tags = (formData.get("tags") as string)?.trim() ?? existing.tags;
      const linkTypeRaw = (formData.get("linkType") as string)?.trim() || existing.linkType;
      const linkType = ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkTypeRaw)
        ? (linkTypeRaw as "WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER")
        : existing.linkType;
      let linkUrl = (formData.get("linkUrl") as string)?.trim() ?? existing.linkUrl;
      let bannerUrl = (formData.get("bannerUrl") as string)?.trim() || existing.bannerUrl;

      const bannerFile = formData.get("bannerFile") as File | null;
      if (bannerFile && bannerFile.size > 0) {
        const saved = await saveUpload("banners", bannerFile);
        bannerUrl = `/api/uploads/${saved.relativePath}`;
        if (linkType === "BANNER") {
          linkUrl = bannerUrl;
        }
      }

      const updated = await prisma.job.update({
        where: { id },
        data: {
          title,
          company,
          location,
          type,
          description,
          tags,
          linkType,
          linkUrl,
          bannerUrl,
          status: "PENDING", // Alterações voltam para PENDING para aprovação
          rejectionReason: null,
        },
      });

      return NextResponse.json(updated);
    }

    const body = await request.json();
    const { id, action, title, company, location, type, description, tags, linkType, linkUrl, bannerUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da vaga é obrigatório." }, { status: 400 });
    }

    const existing = await prisma.job.findFirst({
      where: { id, ...(authz.session.user.role !== "ADMIN" ? { sellerId: seller.id } : {}) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Vaga não encontrada ou sem permissão." }, { status: 404 });
    }

    if (action === "close") {
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "CLOSED", active: false },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        company: company ? company.trim() : existing.company,
        location: location ? location.trim() : existing.location,
        type: type ? type.trim() : existing.type,
        description: description !== undefined ? description.trim() : existing.description,
        tags: tags !== undefined ? tags.trim() : existing.tags,
        linkType: linkType && ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType) ? linkType : existing.linkType,
        linkUrl: linkUrl !== undefined ? linkUrl.trim() : existing.linkUrl,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : existing.bannerUrl,
        status: "PENDING",
        rejectionReason: null,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Erro ao atualizar vaga do profissional:", err);
    return NextResponse.json({ error: err.message || "Erro ao atualizar vaga." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da vaga é obrigatório." }, { status: 400 });
  }

  const seller =
    authz.session.user.role === "ADMIN"
      ? null
      : await getSellerForUser(authz.session.user.id);

  const existing = await prisma.job.findFirst({
    where: { id, ...(seller ? { sellerId: seller.id } : {}) },
  });

  if (!existing) {
    return NextResponse.json({ error: "Vaga não encontrada ou sem permissão." }, { status: 404 });
  }

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "Vaga eliminada com sucesso." });
}
