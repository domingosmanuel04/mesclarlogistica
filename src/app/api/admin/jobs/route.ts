import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();
    const status = searchParams.get("status");
    const approvalStatus = searchParams.get("approvalStatus");
    const linkType = searchParams.get("linkType");

    const where: any = {};

    if (status === "ACTIVE") {
      where.active = true;
    } else if (status === "INACTIVE") {
      where.active = false;
    }

    if (approvalStatus && ["PENDING", "APPROVED", "REJECTED", "CLOSED"].includes(approvalStatus)) {
      where.status = approvalStatus;
    }

    if (linkType && ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType)) {
      where.linkType = linkType;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 250,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("[admin-jobs-api-get] Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const contentType = request.headers.get("content-type") || "";

  // 1. SUPORTE A FORMDATA COM UPLOAD DE BANNER
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const action = (formData.get("action") as string) || "create";
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
      const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10) || 0;
      const active = formData.get("active") !== "false";

      const bannerFile = formData.get("bannerFile") as File | null;
      if (bannerFile && bannerFile.size > 0) {
        const saved = await saveUpload("banners", bannerFile);
        bannerUrl = `/api/uploads/${saved.relativePath}`;
        if (linkType === "BANNER" && !linkUrl) {
          linkUrl = bannerUrl;
        }
      }

      if (action === "create") {
        if (!title || !company) {
          return NextResponse.json({ error: "Título e Empresa são obrigatórios." }, { status: 400 });
        }

        const newJob = await prisma.job.create({
          data: {
            title,
            company,
            location,
            type,
            description,
            tags,
            linkType,
            linkUrl: linkUrl || (linkType === "BANNER" && bannerUrl ? bannerUrl : ""),
            bannerUrl,
            sortOrder,
            active,
          },
        });

        return NextResponse.json({ ok: true, job: newJob }, { status: 201 });
      }

      if (action === "edit") {
        const jobId = formData.get("jobId") as string;
        if (!jobId) {
          return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
        }

        const updated = await prisma.job.update({
          where: { id: jobId },
          data: {
            title,
            company,
            location,
            type,
            description,
            tags,
            linkType,
            linkUrl: linkUrl || (linkType === "BANNER" && bannerUrl ? bannerUrl : undefined),
            ...(bannerUrl ? { bannerUrl } : {}),
            sortOrder,
            active,
          },
        });

        return NextResponse.json({ ok: true, job: updated });
      }

      return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
    } catch (e: any) {
      console.error("Erro ao processar vaga (FormData):", e);
      return NextResponse.json({ error: e?.message || "Erro ao processar vaga." }, { status: 500 });
    }
  }

  // 2. SUPORTE A JSON
  try {
    const body = await request.json();
    const action = body.action as string;

    // Toggle active
    if (action === "toggle-active") {
      const { jobId, active } = body;
      if (!jobId) {
        return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: { active: Boolean(active) },
      });

      return NextResponse.json({ ok: true, active: updated.active });
    }

    // Criar vaga
    if (action === "create" || !action) {
      const {
        title,
        company,
        location,
        type,
        description,
        tags,
        linkType,
        linkUrl,
        bannerUrl,
        sortOrder,
        active,
      } = body;

      if (!title?.trim() || !company?.trim()) {
        return NextResponse.json({ error: "Título e Empresa são obrigatórios." }, { status: 400 });
      }

      const validLinkType = ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType)
        ? linkType
        : "WHATSAPP";

      const newJob = await prisma.job.create({
        data: {
          title: title.trim(),
          company: company.trim(),
          location: location?.trim() || "Luanda",
          type: type?.trim() || "Tempo Inteiro",
          description: description?.trim() || "",
          tags: tags?.trim() || null,
          linkType: validLinkType,
          linkUrl: linkUrl?.trim() || "",
          bannerUrl: bannerUrl?.trim() || null,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
          active: typeof active === "boolean" ? active : true,
        },
      });

      return NextResponse.json({ ok: true, job: newJob }, { status: 201 });
    }

    // Editar vaga
    if (action === "edit") {
      const {
        jobId,
        title,
        company,
        location,
        type,
        description,
        tags,
        linkType,
        linkUrl,
        bannerUrl,
        sortOrder,
        active,
      } = body;

      if (!jobId || !title?.trim() || !company?.trim()) {
        return NextResponse.json({ error: "ID, Título e Empresa são obrigatórios." }, { status: 400 });
      }

      const validLinkType = ["WHATSAPP", "LINKEDIN", "WEBSITE", "BANNER"].includes(linkType)
        ? linkType
        : "WHATSAPP";

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
          title: title.trim(),
          company: company.trim(),
          location: location?.trim() || "Luanda",
          type: type?.trim() || "Tempo Inteiro",
          description: description?.trim() || "",
          tags: tags?.trim() || null,
          linkType: validLinkType,
          linkUrl: linkUrl?.trim() || "",
          bannerUrl: bannerUrl !== undefined ? (bannerUrl?.trim() || null) : undefined,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
          active: typeof active === "boolean" ? active : true,
        },
      });

      return NextResponse.json({ ok: true, job: updated });
    }

    // Aprovar vaga
    if (action === "approve") {
      const { jobId } = body;
      if (!jobId) {
        return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "APPROVED",
          active: true,
          rejectionReason: null,
        },
      });

      return NextResponse.json({ ok: true, job: updated });
    }

    // Rejeitar vaga
    if (action === "reject") {
      const { jobId, reason } = body;
      if (!jobId) {
        return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "REJECTED",
          active: false,
          rejectionReason: reason?.trim() || "A vaga não cumpre os requisitos editoriais.",
        },
      });

      return NextResponse.json({ ok: true, job: updated });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (e: any) {
    console.error("Erro na rota de vagas:", e);
    return NextResponse.json({ error: e?.message || "Erro no servidor." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const { id, action, reason } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
    }

    if (action === "approve") {
      const updated = await prisma.job.update({
        where: { id },
        data: {
          status: "APPROVED",
          active: true,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ ok: true, job: updated });
    }

    if (action === "reject") {
      const updated = await prisma.job.update({
        where: { id },
        data: {
          status: "REJECTED",
          active: false,
          rejectionReason: reason?.trim() || "A vaga não cumpre os requisitos editoriais da plataforma.",
        },
      });
      return NextResponse.json({ ok: true, job: updated });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao atualizar vaga." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da vaga em falta." }, { status: 400 });
  }

  await prisma.job.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
