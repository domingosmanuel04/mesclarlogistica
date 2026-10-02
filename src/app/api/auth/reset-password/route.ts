import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const { token, password } = schema.parse(await request.json());
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
