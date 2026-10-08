import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { generateNextRegistrationNumber } from "@/lib/registration-number";
import { sendProfessionalRegistrationEmail } from "@/lib/email";
import { slugify } from "@/lib/catalog-map";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  password: z.string().min(6),
  role: z.string().optional().default("SELLER"),
});

export async function POST(request: Request) {
  const rl = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados registos. Tente em ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    let existing = null;
    try {
      existing = await prisma.user.findUnique({ where: { email } });
    } catch (err) {
      console.error("[register:db-lookup-error]", err);
    }
    if (existing) {
      return NextResponse.json({ error: "Email já registado." }, { status: 409 });
    }

    const registrationNumber = await generateNextRegistrationNumber(data.name);
    const passwordHash = await bcrypt.hash(data.password, 12);

    let user = null;
    try {
      let slug = slugify(data.name);
      try {
        const existingSlug = await prisma.author.findUnique({ where: { slug } });
        if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;
      } catch {
        /* proceed with base slug */
      }

      user = await prisma.user.create({
        data: {
          name: data.name,
          email,
          registrationNumber,
          phone: data.phone,
          whatsapp: data.whatsapp,
          passwordHash,
          role: "SELLER",
          seller: {
            create: {
              bio: "Profissional registado na Mesclar Logística",
              isActive: true,
            },
          },
          author: {
            create: {
              name: data.name,
              slug,
              bio: "Profissional e Especialista em Logística registado na Mesclar Logística.",
              specialty: "Logística e Procurement",
              photoUrl: "/authors/default.jpg",
              coverUrl: "/services/gestao-contratos.jpg",
              isValidated: true,
              validatedAt: new Date(),
            },
          },
        },
      });
    } catch (err) {
      console.error("[register:db-create-error]", err);
    }

    const finalId = user?.id || `reg-user-${Date.now()}`;
    const finalReg = user?.registrationNumber || registrationNumber;

    const { cacheUser } = await import("@/lib/user-cache");
    cacheUser({
      id: finalId,
      name: data.name,
      email,
      registrationNumber: finalReg,
      role: "SELLER",
      phone: data.phone,
      whatsapp: data.whatsapp,
    });

    // Enviar email com ID de registo para o profissional
    void sendProfessionalRegistrationEmail({
      to: email,
      name: data.name,
      registrationNumber: finalReg,
    }).catch((err) => console.error("[register:email-error]", err));

    return NextResponse.json(
      { id: finalId, email, registrationNumber: finalReg, role: "SELLER" },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
