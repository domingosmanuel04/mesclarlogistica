import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(jobs);
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao obter vagas." }, { status: 500 });
  }
}
