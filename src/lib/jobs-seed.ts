import { prisma } from "@/lib/prisma";
import type { Job } from "@prisma/client";

export async function getJobsWithInitialSeed(): Promise<Job[]> {
  try {
    return await prisma.job.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Erro ao obter vagas da base de dados:", error);
    return [];
  }
}
