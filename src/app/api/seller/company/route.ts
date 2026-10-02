import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, getSellerForUser, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";

export async function GET(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  let seller = await getSellerForUser(authz.session.user.id);
  if (!seller && authz.session.user.role === "ADMIN") {
    seller = await prisma.seller.findFirst({ where: { userId: authz.session.user.id } }) || await prisma.seller.findFirst();
  }

  if (!seller) {
    return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(company || null);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  let seller = await getSellerForUser(authz.session.user.id);
  if (!seller && authz.session.user.role === "ADMIN") {
    seller = await prisma.seller.findFirst({ where: { userId: authz.session.user.id } }) || await prisma.seller.findFirst();
  }

  if (!seller) {
    return NextResponse.json({ error: "Perfil de profissional não encontrado." }, { status: 400 });
  }

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
      logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

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
    }

    if (!name || !category || !services) {
      return NextResponse.json(
        { error: "Nome da Empresa, Categoria e Serviços Principais são obrigatórios." },
        { status: 400 }
      );
    }

    // Check if seller already has a registered company
    const existing = await prisma.company.findFirst({
      where: { sellerId: seller.id },
    });

    if (existing) {
      const updated = await prisma.company.update({
        where: { id: existing.id },
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
          logoUrl: logoUrl || existing.logoUrl,
          status: "PENDING", // Actualizações voltam para PENDING para aprovação do admin
          rejectionReason: null,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.company.create({
      data: {
        sellerId: seller.id,
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
        status: "PENDING",
        certified: false,
        active: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao guardar dados da empresa:", err);
    return NextResponse.json({ error: err.message || "Erro ao guardar empresa." }, { status: 500 });
  }
}
