import { prisma } from "@/lib/prisma";

export interface WebinarItem {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  linkUrl: string;
  speaker?: string | null;
  eventDate?: Date | null;
  active: boolean;
  sortOrder: number;
  seller?: {
    user: {
      name: string;
    };
  } | null;
}

const INITIAL_WEBINARS = [
  {
    title: "Masterclass: Otimização de Custos em Fretes Internacionais e Cabotagem",
    description:
      "Neste webinar prático, exploramos técnicas avançadas de consolidação de carga, negociação com armadores marítimos e aplicação de tarifas aduaneiras estratégicas em Angola e na África Austral.",
    bannerUrl: "/hero-global-logistics.jpg",
    linkUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    speaker: "Dr. Carlos Mendes — Especialista em Procurement Internacional",
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // Daqui a 5 dias
    sortOrder: 1,
    active: true,
  },
  {
    title: "Despacho Aduaneiro e a Janela Única Portuária: Desafios e Boas Práticas",
    description:
      "Uma análise detalhada sobre o funcionamento dos processos aduaneiros na Janela Única Portuária, desalfandegamento célere e redução de sobre-estadias (demurrage) no Porto de Luanda.",
    bannerUrl: "/hero-trade-network.jpg",
    linkUrl: "https://zoom.us",
    speaker: "Eng. Alberto Gaspar — Consultor em Despacho Aduaneiro",
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12), // Daqui a 12 dias
    sortOrder: 2,
    active: true,
  },
  {
    title: "Gestão Eficiente de Armazéns: Implantação de WMS e Redução de Perdas",
    description:
      "Apresentação prática de ferramentas WMS, controle de lotes, FIFO/FEFO e organização de layout físico para armazéns secos e refrigerados de alta rotação.",
    bannerUrl: "/hero-logistics.jpg",
    linkUrl: "https://meet.google.com",
    speaker: "Eng. Manuel Bento — Gestor de Operações Logísticas",
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    sortOrder: 3,
    active: true,
  },
];

export async function getWebinarsWithInitialSeed(): Promise<WebinarItem[]> {
  try {
    const existing = await prisma.webinar.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        seller: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (existing.length > 0) return existing;

    // Se estiver vazio, vincular a um seller existente ou criar registros iniciais
    const seller = await prisma.seller.findFirst();
    if (!seller) return [];

    await prisma.webinar.createMany({
      data: INITIAL_WEBINARS.map((w) => ({
        ...w,
        sellerId: seller.id,
      })),
    });

    return (await prisma.webinar.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        seller: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })) as WebinarItem[];
  } catch (error) {
    console.error("Erro ao carregar webinars com seed:", error);
    return [];
  }
}
