import type { MockAuthor, MockBook, MockCategory, MockPickupPoint } from "@/types";
import type {
  Author,
  Book,
  Category,
  PickupPoint,
  ProductType,
  Seller,
  Subcategory,
  User,
} from "@prisma/client";

type BookWithRelations = Book & {
  author: Author;
  category: Category;
  subcategory?: Subcategory | null;
  seller: Seller & { user: User };
};

const NEW_DAYS = 45;

export function mapBook(book: BookWithRelations): MockBook {
  const isNew =
    Date.now() - new Date(book.createdAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    description: book.description,
    summary: book.summary ?? undefined,
    authorId: book.authorId,
    authorName: book.author.name,
    categoryId: book.categoryId,
    categoryName: book.category.name,
    subcategoryName: book.subcategory?.name,
    productType: book.productType as ProductType,
    status: book.status,
    priceEbook: book.priceEbook,
    pricePhysical: book.pricePhysical ?? undefined,
    coverUrl: book.coverUrl || "/covers/default.jpg",
    stockQuantity: book.stockQuantity,
    ratingAvg: book.ratingAvg,
    ratingCount: book.ratingCount,
    salesCount: book.salesCount,
    isbn: book.isbn ?? undefined,
    publishYear: book.publishYear ?? undefined,
    publisher: book.publisher ?? undefined,
    keywords: book.keywords,
    featured: book.featured,
    isNew,
    sellerId: book.sellerId,
    sellerName: book.seller.user.name,
  };
}

export function mapAuthor(author: Author & { books?: { id: string }[] }): MockAuthor {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio ?? "",
    specialty: author.specialty ?? "",
    photoUrl: author.photoUrl || "/authors/carlos-mendes.jpg",
    coverUrl: author.coverUrl || "/services/gestao-contratos.jpg",
    bookIds: author.books?.map((b) => b.id) ?? [],
    employmentStatus: author.employmentStatus,
    academicStatus: author.academicStatus,
    academicHistory: author.academicHistory,
    professionalHistory: author.professionalHistory,
    softwareSkills: author.softwareSkills,
    technicalSkills: author.technicalSkills,
    languages: author.languages,
    references: author.references,
    contactEmail: author.contactEmail,
    contactWhatsapp: author.contactWhatsapp,
    trainingCertifications: author.trainingCertifications,
    awardsRecognition: author.awardsRecognition,
    projects: author.projects,
    additionalNotes: author.additionalNotes,
    userId: author.userId ?? null,
    isValidated: Boolean(author.isValidated),
    validatedAt: author.validatedAt ? author.validatedAt.toISOString() : null,
  };
}

export function mapCategory(
  category: Category & { subcategories: Subcategory[] }
): MockCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    subcategories: category.subcategories.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
    })),
  };
}

export function mapPickupPoint(p: PickupPoint): MockPickupPoint {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    province: p.province,
    municipality: p.municipality,
    phone: p.phone ?? "",
  };
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
