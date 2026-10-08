import { prisma } from "@/lib/prisma";
import type { Company } from "@prisma/client";

export async function getCompaniesWithInitialSeed(): Promise<Company[]> {
  try {
    return await prisma.company.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Erro ao obter empresas da base de dados:", error);
    return [];
  }
}
