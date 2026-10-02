import { prisma } from "@/lib/prisma";
import type { Job, JobLinkType } from "@prisma/client";

export const INITIAL_SAMPLE_JOBS: {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  tags: string;
  linkType: JobLinkType;
  linkUrl: string;
  bannerUrl: string | null;
  sortOrder: number;
}[] = [
  {
    title: "Gestor de Armazém e Distribuição",
    company: "Operador Logístico 3PL",
    location: "Viana, Luanda",
    type: "Tempo Inteiro",
    description: "Coordenação de equipa de recepção, expedição, picking e controlo de inventário em armazém de produtos secos e refrigerados.",
    tags: "WMS, Inventário, Liderança",
    linkType: "WHATSAPP",
    linkUrl: "+244921522885",
    bannerUrl: null,
    sortOrder: 1,
  },
  {
    title: "Procurement Specialist / Comprador Sénior",
    company: "Grupo Industrial e Comercial",
    location: "Talatona, Luanda",
    type: "Tempo Inteiro",
    description: "Gestão do processo end-to-end de compras estratégicas, negociação de contratos e homologação de fornecedores nacionais e internacionais.",
    tags: "Sourcing, Contratos, Incoterms",
    linkType: "LINKEDIN",
    linkUrl: "https://www.linkedin.com/company/mesclar-logistica",
    bannerUrl: null,
    sortOrder: 2,
  },
  {
    title: "Supervisor de Frotas e Roteirização",
    company: "Distribuidora Nacional",
    location: "Cacuaco, Luanda",
    type: "Tempo Inteiro",
    description: "Gestão de manutenção preventiva e correctiva de pesados, controlo de combustível, tacógrafos e dimensionamento de rotas interprovinciais.",
    tags: "Frotas, Telemetria, Manutenção",
    linkType: "WEBSITE",
    linkUrl: "https://mesclar.ao",
    bannerUrl: null,
    sortOrder: 3,
  },
  {
    title: "Despachante / Técnico Aduaneiro",
    company: "Transitário Internacional",
    location: "Porto de Luanda / Maianga",
    type: "Tempo Inteiro",
    description: "Acompanhamento de desembaraço aduaneiro na AGT, DU, Pauta Aduaneira, regimes suspensivos e gestão de taxas portuárias.",
    tags: "AGT, Despacho, Comércio Externo",
    linkType: "BANNER",
    linkUrl: "/covers/supply-chain.jpg",
    bannerUrl: "/covers/supply-chain.jpg",
    sortOrder: 4,
  },
];

export async function getJobsWithInitialSeed(): Promise<Job[]> {
  try {
    const existing = await prisma.job.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (existing.length > 0) {
      return existing;
    }

    // Se estiver vazio, popula com os exemplos iniciais como APROVADOS
    for (const job of INITIAL_SAMPLE_JOBS) {
      await prisma.job.create({
        data: {
          ...job,
          status: "APPROVED",
          active: true,
        },
      });
    }

    return await prisma.job.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Erro ao obter vagas da base de dados:", error);
    return [];
  }
}
