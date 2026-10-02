import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";
  const category = searchParams.get("categoria") || "";
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip,
        include: {
          seller: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  author: {
                    select: {
                      id: true,
                      slug: true,
                      photoUrl: true,
                      specialty: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Erro ao listar artigos públicos:", err);
    return NextResponse.json({ error: "Erro ao procurar artigos." }, { status: 500 });
  }
}
