import { prisma } from "@/lib/prisma";
import { mapAuthor, mapBook, mapCategory, mapPickupPoint } from "@/lib/catalog-map";
import type { MockAuthor, MockBook, MockCategory, MockPickupPoint } from "@/types";
import type { Prisma, ProductType } from "@prisma/client";
import {
  authors as mockAuthors,
  books as mockBooks,
  categories as mockCategories,
  getPublishedBooks as mockPublished,
  getBookBySlug as mockGetBySlug,
  getAuthorBySlug as mockAuthorBySlug,
  getBooksByAuthor as mockBooksByAuthor,
  getFreeEbooks as mockFree,
  getPremiumEbooks as mockPremium,
  getBestsellers as mockBestsellers,
  getNewBooks as mockNew,
  getFeaturedBooks as mockFeatured,
  pickupPoints as mockPickups,
} from "@/data/mock-data";

const bookInclude = {
  author: true,
  category: true,
  subcategory: true,
  seller: { include: { user: true } },
} satisfies Prisma.BookInclude;

async function dbAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function listCategories(): Promise<MockCategory[]> {
  if (!(await dbAvailable())) return mockCategories;
  try {
    const rows = await prisma.category.findMany({
      include: { subcategories: { orderBy: { name: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
    return rows.length ? rows.map(mapCategory) : mockCategories;
  } catch (err) {
    console.error("Error in listCategories:", err);
    return mockCategories;
  }
}

export async function listPickupPoints(): Promise<MockPickupPoint[]> {
  if (!(await dbAvailable())) return mockPickups;
  try {
    const rows = await prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return rows.length ? rows.map(mapPickupPoint) : mockPickups;
  } catch (err) {
    console.error("Error in listPickupPoints:", err);
    return mockPickups;
  }
}

export async function getPublishedBooks(filters?: {
  q?: string;
  categorySlug?: string;
  productType?: ProductType | "EBOOK" | "PHYSICAL" | "BOTH";
  freeOnly?: boolean;
  physicalOnly?: boolean;
}): Promise<MockBook[]> {
  if (!(await dbAvailable())) {
    let list = mockPublished();
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }
    if (filters?.categorySlug && filters.categorySlug !== "all") {
      list = list.filter(
        (b) =>
          b.categoryName.toLowerCase().replace(/\s+/g, "-") === filters.categorySlug ||
          mockCategories.find((c) => c.id === b.categoryId)?.slug === filters.categorySlug
      );
    }
    if (filters?.physicalOnly) {
      list = list.filter((b) => b.productType === "PHYSICAL" || b.productType === "BOTH");
    }
    if (filters?.freeOnly) {
      list = list.filter((b) => b.priceEbook === 0);
    }
    if (filters?.productType === "EBOOK") {
      list = list.filter((b) => b.productType === "EBOOK" || b.productType === "BOTH");
    }
    return list;
  }

  try {
    const where: Prisma.BookWhereInput = { status: "PUBLISHED" };

    if (filters?.q) {
      where.OR = [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { author: { name: { contains: filters.q, mode: "insensitive" } } },
        { keywords: { has: filters.q } },
      ];
    }
    if (filters?.categorySlug && filters.categorySlug !== "all") {
      where.category = { slug: filters.categorySlug };
    }
    if (filters?.physicalOnly) {
      where.productType = { in: ["PHYSICAL", "BOTH"] };
    }
    if (filters?.productType === "EBOOK") {
      where.productType = { in: ["EBOOK", "BOTH"] };
    }
    if (filters?.freeOnly) {
      where.priceEbook = 0;
      where.productType = { in: ["EBOOK", "BOTH"] };
    }

    const rows = await prisma.book.findMany({
      where,
      include: bookInclude,
      orderBy: [{ featured: "desc" }, { salesCount: "desc" }],
    });
    return rows.length ? rows.map(mapBook) : mockPublished();
  } catch (err) {
    console.error("Error in getPublishedBooks:", err);
    return mockPublished();
  }
}

export async function getBookBySlug(slug: string): Promise<MockBook | null> {
  if (!(await dbAvailable())) return mockGetBySlug(slug) ?? null;
  try {
    const row = await prisma.book.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: bookInclude,
    });
    if (!row) return mockGetBySlug(slug) ?? null;
    return mapBook(row);
  } catch (err) {
    console.error("Error in getBookBySlug:", err);
    return mockGetBySlug(slug) ?? null;
  }
}

export async function getAuthorBySlug(slug: string): Promise<MockAuthor | null> {
  const cleanSlug = slug.trim().toLowerCase();
  if (await dbAvailable()) {
    try {
      const row = await prisma.author.findFirst({
        where: {
          OR: [{ slug: cleanSlug }, { id: cleanSlug }],
        },
        include: { books: { select: { id: true } } },
      });
      if (row) return mapAuthor(row);
    } catch {
      // fallback to mock
    }
  }
  return (
    mockAuthorBySlug(cleanSlug) ??
    mockAuthors.find(
      (m) => m.slug.toLowerCase() === cleanSlug || m.id.toLowerCase() === cleanSlug
    ) ??
    null
  );
}

export async function getBooksByAuthor(authorId: string): Promise<MockBook[]> {
  if (!(await dbAvailable())) return mockBooksByAuthor(authorId);
  try {
    const rows = await prisma.book.findMany({
      where: { authorId, status: "PUBLISHED" },
      include: bookInclude,
    });
    return rows.length ? rows.map(mapBook) : mockBooksByAuthor(authorId);
  } catch {
    return mockBooksByAuthor(authorId);
  }
}

export async function getFreeEbooks(): Promise<MockBook[]> {
  const list = await getPublishedBooks({ freeOnly: true, productType: "EBOOK" });
  return list.length ? list : mockFree();
}

export async function getPremiumEbooks(): Promise<MockBook[]> {
  if (!(await dbAvailable())) return mockPremium();
  try {
    const rows = await prisma.book.findMany({
      where: {
        status: "PUBLISHED",
        productType: { in: ["EBOOK", "BOTH"] },
        priceEbook: { gt: 0 },
      },
      include: bookInclude,
      orderBy: { salesCount: "desc" },
    });
    return rows.length ? rows.map(mapBook) : mockPremium();
  } catch (err) {
    console.error("Error in getPremiumEbooks:", err);
    return mockPremium();
  }
}

export async function getBestsellers(): Promise<MockBook[]> {
  const list = await getPublishedBooks();
  return [...list].sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
}

export async function getNewBooks(): Promise<MockBook[]> {
  const list = await getPublishedBooks();
  const newer = list.filter((b) => b.isNew);
  return newer.length ? newer : mockNew();
}

export async function getFeaturedBooks(): Promise<MockBook[]> {
  if (!(await dbAvailable())) return mockFeatured();
  try {
    const rows = await prisma.book.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: bookInclude,
      orderBy: { salesCount: "desc" },
    });
    return rows.length ? rows.map(mapBook) : mockFeatured();
  } catch (err) {
    console.error("Error in getFeaturedBooks:", err);
    return mockFeatured();
  }
}

export async function listAuthors(): Promise<MockAuthor[]> {
  let dbAuthorList: MockAuthor[] = [];
  if (await dbAvailable()) {
    try {
      const rows = await prisma.author.findMany({
        include: { books: { select: { id: true } } },
        orderBy: { updatedAt: "desc" },
      });
      dbAuthorList = rows.map(mapAuthor);
    } catch {
      dbAuthorList = [];
    }
  }

  // Colocar os profissionais da BD (mais recentes primeiro) no topo, seguidos dos restantes perfis de demonstração
  const dbSlugs = new Set(dbAuthorList.map((a) => a.slug.toLowerCase()));
  const dbIds = new Set(dbAuthorList.map((a) => a.id.toLowerCase()));

  const extraMocks = mockAuthors.filter(
    (m) => !dbSlugs.has(m.slug.toLowerCase()) && !dbIds.has(m.id.toLowerCase())
  );

  return [...dbAuthorList, ...extraMocks];
}

export async function getSellerBank(sellerId: string) {
  if (!(await dbAvailable())) {
    const fromMock = mockBooks.find((b) => b.sellerId === sellerId);
    return {
      bankName: "BAI",
      accountHolder: fromMock?.sellerName ?? "Mesclar",
      iban: "AO06004000000000000000000",
      expressPhone: "+244 921 522 885",
      accountNumber: "1234567890",
    };
  }
  try {
    const bank = await prisma.bankAccount.findFirst({
      where: { sellerId },
      orderBy: { isDefault: "desc" },
      include: {
        seller: {
          include: {
            user: { select: { phone: true, whatsapp: true } },
          },
        },
      },
    });
    if (!bank) {
      return {
        bankName: "BAI",
        accountHolder: "Mesclar Edições",
        iban: "AO06004000000000000000000",
        expressPhone: "+244 921 522 885",
        accountNumber: "1234567890",
      };
    }
    const expressPhone =
      bank.expressPhone ||
      bank.seller?.user?.phone ||
      bank.seller?.user?.whatsapp ||
      "+244 921 522 885";

    return {
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      iban: bank.iban,
      expressPhone,
      accountNumber: bank.accountNumber,
    };
  } catch (err) {
    console.error("Error in getSellerBank:", err);
    return {
      bankName: "BAI",
      accountHolder: "Mesclar Edições",
      iban: "AO06004000000000000000000",
      expressPhone: "+244 921 522 885",
      accountNumber: "1234567890",
    };
  }
}

export { mockCategories as filterCategoriesFallback };
