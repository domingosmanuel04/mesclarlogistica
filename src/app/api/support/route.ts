import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRoles, isAuthError } from "@/lib/api-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const rl = rateLimit(`support:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados tickets. Tente mais tarde." }, { status: 429 });
  }

  try {
    const data = schema.parse(await request.json());
    const authz = await requireSession();
    const userId = !isAuthError(authz) ? authz.session.user.id : undefined;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "ORDER_CREATED" as const,
          title: "Novo ticket de suporte",
          message: `${data.subject} — ${data.name}`,
          link: "/admin/suporte",
        })),
      });
    }

    await sendEmail({
      to: data.email,
      template: "welcome",
      subject: `Mesclar suporte: ${data.subject}`,
      data: {
        message: "Recebemos o seu pedido. Responderemos em breve.",
      },
    });

    return NextResponse.json({ id: ticket.id, ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar ticket." }, { status: 500 });
  }
}

export async function GET() {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;
  const rows = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;
  const body = await request.json();
  const row = await prisma.supportTicket.update({
    where: { id: body.id },
    data: { status: body.status || "CLOSED" },
  });
  return NextResponse.json(row);
}
