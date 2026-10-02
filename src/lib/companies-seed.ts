import { prisma } from "@/lib/prisma";
import type { Company } from "@prisma/client";

export const INITIAL_SAMPLE_COMPANIES = [
  {
    name: "TransLog Angola 3PL",
    category: "Operador Logístico e Armazenagem",
    location: "Viana Park, Luanda",
    coverage: "Nacional (18 Províncias)",
    services: "Armazenagem com temperatura controlada, Cross-docking, Distribuição capilar",
    description: "Operador logístico de referência para bens de consumo de rotação rápida, farmacêuticos e cadeia de frio.",
    certified: true,
    email: "comercial@translog.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 1,
  },
  {
    name: "Atlantic Cargo Transitários",
    category: "Transitário Internacional e Despacho",
    location: "Porto de Luanda / Maianga",
    coverage: "Internacional (Marítimo e Aéreo)",
    services: "Frete Marítimo FCL/LCL, Carga Aérea Express, Desembaraço Aduaneiro AGT",
    description: "Agenciamento de frete internacional e desembaraço alfandegário nos principais corredores de importação e exportação.",
    certified: true,
    email: "operacoes@atlanticcargo.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 2,
  },
  {
    name: "Frota Express Transporte Pesado",
    category: "Transporte Rodoviário de Cargas",
    location: "Cacuaco / Estrada de Catete",
    coverage: "Corredor do Lobito e Luanda-Norte",
    services: "Porta-contentores, Carga Geral e Granel, Rastreio por Satélite 24/7",
    description: "Frota moderna de cavalos mecânicos e semirreboques para distribuição interprovincial em Angola.",
    certified: true,
    email: "contacto@frotaexpress.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 3,
  },
  {
    name: "Porto Seco e Logística Integrada",
    category: "Parque de Contentores e Armazém",
    location: "Viana / Luanda Sul",
    coverage: "Grande Luanda e Interiores",
    services: "Estacionamento de pesados, Consolidação de carga, Segurança armada",
    description: "Plataforma logística e entreposto aduaneiro com espaço para estiva e parqueamento de contentores.",
    certified: false,
    email: "info@portoseco.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 4,
  },
  {
    name: "EquipLog Soluções de Armazém",
    category: "Fornecedor de Equipamentos e Paletes",
    location: "Talatona, Luanda",
    coverage: "Angola",
    services: "Empilhadores e Porta-paletes, Racks e Estanteria industrial, Manutenção autorizada",
    description: "Venda, aluguer e assistência técnica a frotas de movimentação de cargas e armazenamento em altura.",
    certified: true,
    email: "vendas@equiplog.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 5,
  },
  {
    name: "Kwanza Customs Aduanas e Consultoria",
    category: "Despachante Aduaneiro Oficial",
    location: "Avenida 4 de Fevereiro, Luanda",
    coverage: "Porto e Aeroporto de Luanda",
    services: "Declaração Única Aduaneira (DU), Regimes Especiais e Isenções, Consultoria Pauta",
    description: "Consultoria aduaneira e representação perante a AGT para desembaraço rápido de mercadorias.",
    certified: true,
    email: "aduana@kwanzacustoms.ao",
    whatsapp: "+244921522885",
    phone: "+244 921 522 885",
    sortOrder: 6,
  },
];

export async function getCompaniesWithInitialSeed(): Promise<Company[]> {
  try {
    const existing = await prisma.company.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (existing.length > 0) {
      return existing;
    }

    // Se a tabela estiver vazia, popula com o directório inicial como APROVADO
    for (const c of INITIAL_SAMPLE_COMPANIES) {
      await prisma.company.create({
        data: {
          ...c,
          status: "APPROVED",
          active: true,
        },
      });
    }

    return await prisma.company.findMany({
      where: { active: true, status: "APPROVED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Erro ao obter empresas da base de dados:", error);
    return [];
  }
}
