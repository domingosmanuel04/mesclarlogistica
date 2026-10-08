import { prisma } from "@/lib/prisma";
import { mapAuthor, mapBook, mapCategory, mapPickupPoint } from "@/lib/catalog-map";
import type { MockAuthor, MockBook, MockCategory, MockPickupPoint } from "@/types";
import type { Prisma, ProductType } from "@prisma/client";
import {
  categories as mockCategories,
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
    return rows.map(mapBook);
  } catch (err) {
    console.error("Error in getPublishedBooks:", err);
    return [];
  }
}

export async function getBookBySlug(slug: string): Promise<MockBook | null> {
  try {
    const row = await prisma.book.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: bookInclude,
    });
    return row ? mapBook(row) : null;
  } catch (err) {
    console.error("Error in getBookBySlug:", err);
    return null;
  }
}

export async function getAuthorBySlug(slug: string): Promise<MockAuthor | null> {
  const cleanSlug = slug.trim().toLowerCase();
  try {
    const row = await prisma.author.findFirst({
      where: {
        OR: [{ slug: cleanSlug }, { id: cleanSlug }],
      },
      include: { books: { select: { id: true } } },
    });
    return row ? mapAuthor(row) : null;
  } catch {
    return null;
  }
}

export async function getBooksByAuthor(authorId: string): Promise<MockBook[]> {
  try {
    const rows = await prisma.book.findMany({
      where: { authorId, status: "PUBLISHED" },
      include: bookInclude,
    });
    return rows.map(mapBook);
  } catch {
    return [];
  }
}

export async function getFreeEbooks(): Promise<MockBook[]> {
  return await getPublishedBooks({ freeOnly: true, productType: "EBOOK" });
}

export async function getPremiumEbooks(): Promise<MockBook[]> {
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
    return rows.map(mapBook);
  } catch (err) {
    console.error("Error in getPremiumEbooks:", err);
    return [];
  }
}

export async function getBestsellers(): Promise<MockBook[]> {
  const list = await getPublishedBooks();
  return [...list].sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
}

export async function getNewBooks(): Promise<MockBook[]> {
  const list = await getPublishedBooks();
  return list.filter((b) => b.isNew);
}

export async function getFeaturedBooks(): Promise<MockBook[]> {
  try {
    const rows = await prisma.book.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: bookInclude,
      orderBy: { salesCount: "desc" },
    });
    return rows.map(mapBook);
  } catch (err) {
    console.error("Error in getFeaturedBooks:", err);
    return [];
  }
}

export async function listAuthors(): Promise<MockAuthor[]> {
  try {
    const rows = await prisma.author.findMany({
      include: { books: { select: { id: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapAuthor);
  } catch {
    return [];
  }
}

export async function getSellerBank(sellerId: string) {
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
