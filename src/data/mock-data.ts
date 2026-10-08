import type {
  MockAuthor,
  MockBook,
  MockCategory,
  MockPickupPoint,
  MockSeller,
} from "@/types";

export const categories: MockCategory[] = [
  {
    id: "cat-logistica",
    name: "Logística",
    slug: "logistica",
    subcategories: [
      { id: "sub-gestao", name: "Gestão Logística", slug: "gestao-logistica" },
      { id: "sub-transporte", name: "Transporte", slug: "transporte" },
      { id: "sub-distribuicao", name: "Distribuição", slug: "distribuicao" },
    ],
  },
  {
    id: "cat-procurement",
    name: "Procurement",
    slug: "procurement",
    subcategories: [
      { id: "sub-estrategico", name: "Procurement Estratégico", slug: "procurement-estrategico" },
      { id: "sub-sourcing", name: "Sourcing", slug: "sourcing" },
      { id: "sub-fornecedores", name: "Gestão de Fornecedores", slug: "gestao-fornecedores" },
    ],
  },
  {
    id: "cat-compras",
    name: "Compras",
    slug: "compras",
    subcategories: [
      { id: "sub-compras-est", name: "Compras Estratégicas", slug: "compras-estrategicas" },
      { id: "sub-contratos", name: "Gestão de Contratos", slug: "gestao-contratos" },
    ],
  },
  {
    id: "cat-importacao",
    name: "Importação",
    slug: "importacao",
    subcategories: [
      { id: "sub-export", name: "Exportação", slug: "exportacao" },
      { id: "sub-comercio", name: "Comércio Internacional", slug: "comercio-internacional" },
      { id: "sub-aduaneiro", name: "Despacho Aduaneiro", slug: "despacho-aduaneiro" },
    ],
  },
  {
    id: "cat-armazem",
    name: "Armazém",
    slug: "armazem",
    subcategories: [
      { id: "sub-wms", name: "Gestão de Armazéns", slug: "gestao-armazens" },
      { id: "sub-inventario", name: "Gestão de Inventário", slug: "gestao-inventario" },
    ],
  },
  {
    id: "cat-frotas",
    name: "Frotas",
    slug: "frotas",
    subcategories: [
      { id: "sub-gestao-frota", name: "Gestão de Frotas", slug: "gestao-frotas" },
    ],
  },
  {
    id: "cat-supply",
    name: "Supply Chain",
    slug: "supply-chain",
    subcategories: [
      { id: "sub-planejamento", name: "Planejamento Logístico", slug: "planejamento-logistico" },
      { id: "sub-estoque", name: "Gestão de Estoque", slug: "gestao-estoque" },
    ],
  },
  {
    id: "cat-tech",
    name: "Tecnologia Logística",
    slug: "tecnologia-logistica",
    subcategories: [
      { id: "sub-ia", name: "IA aplicada à Logística", slug: "ia-logistica" },
    ],
  },
];

// Removidos todos os autores, vendedores e livros fictícios/mock
export const authors: MockAuthor[] = [];
export const sellers: MockSeller[] = [];
export const books: MockBook[] = [];

export const pickupPoints: MockPickupPoint[] = [
  {
    id: "pickup-1",
    name: "Mesclar — Sede Luanda",
    address: "Rua dos Coqueiros, Ed. Logística, Loja 2",
    province: "Luanda",
    municipality: "Luanda",
    phone: "+244 923 000 001",
  },
  {
    id: "pickup-2",
    name: "Ponto Benguela",
    address: "Av. 17 de Setembro, nº 120",
    province: "Benguela",
    municipality: "Benguela",
    phone: "+244 923 000 002",
  },
  {
    id: "pickup-3",
    name: "Hub Huíla",
    address: "Complexo Comercial Lubango, Bloco B",
    province: "Huíla",
    municipality: "Lubango",
    phone: "+244 923 000 003",
  },
];

export function getPublishedBooks(): MockBook[] {
  return books.filter((b) => b.status === "PUBLISHED");
}

export function getBookBySlug(slug: string): MockBook | undefined {
  return books.find((b) => b.slug === slug && b.status === "PUBLISHED");
}

export function getAuthorBySlug(slug: string): MockAuthor | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getBooksByAuthor(authorId: string): MockBook[] {
  return getPublishedBooks().filter((b) => b.authorId === authorId);
}

export function getFreeEbooks(): MockBook[] {
  return getPublishedBooks().filter(
    (b) => (b.productType === "EBOOK" || b.productType === "BOTH") && b.priceEbook === 0
  );
}

export function getPremiumEbooks(): MockBook[] {
  return getPublishedBooks().filter(
    (b) => (b.productType === "EBOOK" || b.productType === "BOTH") && b.priceEbook > 0
  );
}

export function getBestsellers(): MockBook[] {
  return [...getPublishedBooks()].sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
}

export function getNewBooks(): MockBook[] {
  return getPublishedBooks().filter((b) => b.isNew);
}

export function getFeaturedBooks(): MockBook[] {
  return getPublishedBooks().filter((b) => b.featured);
}

export const filterLabels: Record<string, string> = {
  all: "Todos",
  logistica: "Logística",
  procurement: "Procurement",
  compras: "Compras",
  importacao: "Importação",
  armazem: "Armazém",
  frotas: "Frotas",
  "supply-chain": "Supply Chain",
  transporte: "Transporte",
  "gestao-estoque": "Gestão de Estoque",
  "comercio-internacional": "Comércio Internacional",
};
