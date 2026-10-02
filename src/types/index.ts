export type ProductType = "EBOOK" | "PHYSICAL" | "BOTH";

export type BookStatus = "PENDING" | "PUBLISHED" | "REJECTED" | "CHANGES_REQUESTED";

export type EmploymentStatus =
  | "EMPLOYED"
  | "UNEMPLOYED"
  | "FREELANCER"
  | "ENTREPRENEUR";

export type AcademicStatus =
  | "SECONDARY"
  | "UNIVERSITY_ATTENDING"
  | "BACHELOR"
  | "POSTGRAD"
  | "MASTERS";

export interface MockAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string;
  specialty: string;
  photoUrl: string;
  coverUrl?: string | null;
  bookIds: string[];
  employmentStatus?: EmploymentStatus | null;
  academicStatus?: AcademicStatus | null;
  academicHistory?: string | null;
  professionalHistory?: string | null;
  softwareSkills?: string | null;
  technicalSkills?: string | null;
  languages?: string | null;
  references?: string | null;
  contactEmail?: string | null;
  contactWhatsapp?: string | null;
  trainingCertifications?: string | null;
  awardsRecognition?: string | null;
  projects?: string | null;
  additionalNotes?: string | null;
  userId?: string | null;
  isValidated?: boolean;
  validatedAt?: string | Date | null;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

export interface MockBook {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary?: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  subcategoryName?: string;
  productType: ProductType;
  status: BookStatus;
  priceEbook: number;
  pricePhysical?: number;
  coverUrl: string;
  stockQuantity: number;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  isbn?: string;
  publishYear?: number;
  publisher?: string;
  keywords?: string[];
  featured?: boolean;
  isNew?: boolean;
  sellerId: string;
  sellerName: string;
}

export interface MockSeller {
  id: string;
  name: string;
  bio: string;
  bookCount: number;
  bank: {
    bankName: string;
    accountHolder: string;
    iban: string;
    expressPhone?: string | null;
    accountNumber: string;
  };
}

export interface MockPickupPoint {
  id: string;
  name: string;
  address: string;
  province: string;
  municipality: string;
  phone: string;
}

export interface CartItem {
  bookId: string;
  slug: string;
  title: string;
  authorName: string;
  coverUrl: string;
  productType: ProductType;
  selectedType: "EBOOK" | "PHYSICAL";
  unitPrice: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
}
