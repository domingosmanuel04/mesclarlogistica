import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { slugify } from "@/lib/catalog-map";
import { saveUpload } from "@/lib/storage";

const fieldsSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  employmentStatus: z
    .enum(["EMPLOYED", "UNEMPLOYED", "FREELANCER", "ENTREPRENEUR"])
    .nullable()
    .optional(),
  academicStatus: z
    .enum(["SECONDARY", "UNIVERSITY_ATTENDING", "BACHELOR", "POSTGRAD", "MASTERS"])
    .nullable()
    .optional(),
  academicHistory: z.string().optional().nullable(),
  professionalHistory: z.string().optional().nullable(),
  softwareSkills: z.string().optional().nullable(),
  technicalSkills: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  references: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactWhatsapp: z.string().optional().nullable(),
  trainingCertifications: z.string().optional().nullable(),
  awardsRecognition: z.string().optional().nullable(),
  projects: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
});

export async function GET() {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const author = await prisma.author.findFirst({
    where: { userId: authz.session.user.id },
  });
  return NextResponse.json(author);
}

export async function PUT(request: Request) {
  const authz = await requireRoles(["SELLER", "ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const contentType = request.headers.get("content-type") || "";
    let raw: Record<string, string> = {};
    let coverFile: File | null = null;
    let photoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      for (const [k, v] of form.entries()) {
        if (k === "cover" && v instanceof File && v.size > 0) coverFile = v;
        else if (k === "photo" && v instanceof File && v.size > 0) photoFile = v;
        else if (typeof v === "string") raw[k] = v;
      }
    } else {
      raw = (await request.json()) as Record<string, string>;
    }

    const emptyToNull = (v?: string) => (!v || v === "" || v === "null" ? null : v);
    const data = fieldsSchema.parse({
      ...raw,
      employmentStatus: emptyToNull(raw.employmentStatus),
      academicStatus: emptyToNull(raw.academicStatus),
      contactEmail: emptyToNull(raw.contactEmail),
    });

    const userId = authz.session.user.id;
    let coverUrl: string | undefined;
    let photoUrl: string | undefined;

    if (coverFile) {
      if (!coverFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "A capa deve ser uma imagem." }, { status: 400 });
      }
      const saved = await saveUpload("profiles", coverFile);
      coverUrl = `/api/uploads/${saved.relativePath}`;
    }
    if (photoFile) {
      if (!photoFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "A foto deve ser uma imagem." }, { status: 400 });
      }
      const saved = await saveUpload("profiles", photoFile);
      photoUrl = `/api/uploads/${saved.relativePath}`;
    }

    let author = await prisma.author.findFirst({ where: { userId } });
    const payload = {
      name: data.name,
      specialty: data.specialty,
      bio: data.bio,
      employmentStatus: data.employmentStatus ?? null,
      academicStatus: data.academicStatus ?? null,
      academicHistory: data.academicHistory,
      professionalHistory: data.professionalHistory,
      softwareSkills: data.softwareSkills,
      technicalSkills: data.technicalSkills,
      languages: data.languages,
      references: data.references,
      contactEmail: data.contactEmail,
      contactWhatsapp: data.contactWhatsapp,
      trainingCertifications: data.trainingCertifications,
      awardsRecognition: data.awardsRecognition,
      projects: data.projects,
      additionalNotes: data.additionalNotes,
      ...(coverUrl ? { coverUrl } : {}),
      ...(photoUrl ? { photoUrl } : {}),
    };

    if (!author) {
      let slug = slugify(data.name);
      const exists = await prisma.author.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;
      author = await prisma.author.create({
        data: {
          userId,
          slug,
          photoUrl: photoUrl || "/authors/carlos-mendes.jpg",
          coverUrl: coverUrl || "/services/gestao-contratos.jpg",
          isValidated: false,
          validatedAt: null,
          ...payload,
          employmentStatus: data.employmentStatus ?? undefined,
          academicStatus: data.academicStatus ?? undefined,
        },
      });
    } else {
      author = await prisma.author.update({
        where: { id: author.id },
        data: {
          ...payload,
        },
      });
    }

    return NextResponse.json(author);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erro ao guardar perfil." }, { status: 500 });
  }
}
