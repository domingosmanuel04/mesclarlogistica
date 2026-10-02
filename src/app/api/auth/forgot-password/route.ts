import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return ok (no email enumeration)
    if (user) {
      const token = randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const base = process.env.NEXTAUTH_URL ?? "http://localhost:3020";
      await sendEmail({
        to: user.email,
        template: "password_reset",
        data: { resetUrl: `${base}/redefinir-senha?token=${token}` },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Se o email existir, enviámos um link de recuperação.",
    });
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
}
