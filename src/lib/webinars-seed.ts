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

export async function getWebinarsWithInitialSeed(): Promise<WebinarItem[]> {
  try {
    return await prisma.webinar.findMany({
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
  } catch (error) {
    console.error("Erro ao carregar webinars:", error);
    return [];
  }
}
