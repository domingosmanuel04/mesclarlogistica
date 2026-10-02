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

export const authors: MockAuthor[] = [
  {
    id: "auth-1",
    name: "Dr. Carlos Mendes",
    slug: "carlos-mendes",
    bio: "Especialista em supply chain com mais de 20 anos de experiência em operações portuárias e distribuição na África Austral.",
    specialty: "Supply Chain e Distribuição",
    photoUrl: "/authors/carlos-mendes.jpg",
    coverUrl: "/services/gestao-contratos.jpg",
    bookIds: ["book-1", "book-6"],
    employmentStatus: "EMPLOYED",
    academicStatus: "MASTERS",
    professionalHistory:
      "2018–actual: Director de Logística.\n2012–2018: Coordenador de distribuição regional.",
    softwareSkills: "SAP MM, Oracle WMS, Excel, Power BI",
    technicalSkills:
      "Gestão de supply chain ponta a ponta, planeamento de demanda (S&OP), operações portuárias, logística internacional.",
    languages: "Português, Inglês, Francês",
    references: "Disponíveis sob pedido.",
    contactEmail: "carlos.mendes@exemplo.ao",
    contactWhatsapp: "+244923000101",
    trainingCertifications:
      "• CIPS Level 4\n• Lean Six Sigma Green Belt\n• Formação em Gestão Portuária",
    awardsRecognition:
      "• Prémio Excelência Logística Angola 2022\n• SADC Supply Chain Leader 2020",
    additionalNotes: "Disponível para mentoring.",
  },
  {
    id: "auth-2",
    name: "Eng. Ana Paula Silva",
    slug: "ana-paula-silva",
    bio: "Consultora em procurement estratégico e negociação com fornecedores internacionais.",
    specialty: "Procurement e Compras",
    photoUrl: "/authors/ana-paula-silva.jpg",
    bookIds: ["book-2", "book-7"],
    employmentStatus: "FREELANCER",
    academicStatus: "POSTGRAD",
    professionalHistory: "Consultora independente em procurement desde 2020.",
    softwareSkills: "SAP Ariba, Coupa, Excel",
    technicalSkills:
      "Procurement estratégico, negociação de fretes internacionais, homologação de fornecedores, análise de TCO.",
    languages: "Português, Inglês",
    references: "Clientes do sector extractivo.",
    contactEmail: "ana.silva@exemplo.ao",
    contactWhatsapp: "+244923000102",
    trainingCertifications:
      "• Certificação Internacional em Procurement e Compras (CIPS)\n• Negociação Estratégica Internacional e Gestão de Contratos\n• Strategic Sourcing e Gestão de Fornecedores Globais",
    additionalNotes: null,
  },
  {
    id: "auth-3",
    name: "Prof. João Baptista",
    slug: "joao-baptista",
    bio: "Académico e praticante em comércio internacional, importação e despacho aduaneiro.",
    specialty: "Comércio Internacional",
    photoUrl: "/authors/joao-baptista.jpg",
    bookIds: ["book-3", "book-8"],
    employmentStatus: "EMPLOYED",
    academicStatus: "BACHELOR",
    professionalHistory: "Docente e consultor em despacho aduaneiro.",
    softwareSkills: "Sistemas aduaneiros, Excel",
    technicalSkills:
      "Despacho aduaneiro, regimes pautais, documentação de importação/exportação, conformidade aduaneira.",
    languages: "Português, Inglês",
    references: "Instituições de formação.",
    contactEmail: "joao.baptista@exemplo.ao",
    contactWhatsapp: "+244923000103",
    trainingCertifications:
      "• Certificação de Despachante Aduaneiro Oficial\n• Legislação Pautal e Regimes Aduaneiros Especiais",
    additionalNotes: null,
  },
  {
    id: "auth-4",
    name: "Maria Fernandes",
    slug: "maria-fernandes",
    bio: "Gestora de armazéns e inventário, certificada em WMS e operações logísticas.",
    specialty: "Armazém e Inventário",
    photoUrl: "/authors/maria-fernandes.jpg",
    bookIds: ["book-4", "book-9"],
    employmentStatus: "ENTREPRENEUR",
    academicStatus: "UNIVERSITY_ATTENDING",
    professionalHistory: "Fundadora de solução de inventário para PMEs.",
    softwareSkills: "WMS, Excel, ERP",
    technicalSkills:
      "Gestão de armazém, controlo de inventário (FIFO/LIFO), auditoria de stocks, dimensionamento de layout e logística interna.",
    languages: "Português",
    references: "Operadores 3PL.",
    contactEmail: "maria.fernandes@exemplo.ao",
    contactWhatsapp: "+244923000104",
    trainingCertifications:
      "• Certificação em WMS e Gestão de Armazéns\n• Curso Avançado de Gestão de Inventário e Stocks\n• Boas Práticas de Movimentação e Armazenagem (BPMA)",
    additionalNotes: null,
  },
  {
    id: "auth-5",
    name: "Ricardo Neto",
    slug: "ricardo-neto",
    bio: "Especialista em gestão de frotas, transporte rodoviário e otimização de rotas.",
    specialty: "Transporte e Frotas",
    photoUrl: "/authors/ricardo-neto.jpg",
    bookIds: ["book-5", "book-10"],
    employmentStatus: "UNEMPLOYED",
    academicStatus: "SECONDARY",
    professionalHistory: "Supervisor de frota rodoviária (2016–2024).",
    softwareSkills: "Fleet management, GPS, Excel",
    technicalSkills:
      "Gestão e manutenção de frotas rodoviárias, roteirização, monitorização e rastreamento GPS, controlo de consumos.",
    languages: "Português, Inglês básico",
    references: "Transportadoras nacionais.",
    contactEmail: "ricardo.neto@exemplo.ao",
    contactWhatsapp: "+244923000105",
    trainingCertifications:
      "• Curso de Gestão de Frotas e Roteirização\n• Condução Defensiva e Eficiente para Pesados\n• Certificação em Telemetria e Monitorização Veicular",
    additionalNotes: "Disponível para contratação.",
  },
];

export const sellers: MockSeller[] = [
  {
    id: "seller-1",
    name: "Mesclar Edições",
    bio: "Editora especializada em conteúdos logísticos.",
    bookCount: 4,
    bank: {
      bankName: "BAI",
      accountHolder: "Mesclar Edições Lda",
      iban: "AO06004000000000000000000",
      accountNumber: "1234567890",
    },
  },
  {
    id: "seller-2",
    name: "Logística Press",
    bio: "Publicações técnicas para profissionais da cadeia de abastecimento.",
    bookCount: 3,
    bank: {
      bankName: "BFA",
      accountHolder: "Logística Press SA",
      iban: "AO06006000000000000000000",
      accountNumber: "9876543210",
    },
  },
  {
    id: "seller-3",
    name: "Supply Chain Books",
    bio: "eBooks e manuais digitais de procurement e compras.",
    bookCount: 3,
    bank: {
      bankName: "BIC",
      accountHolder: "Supply Chain Books",
      iban: "AO06005000000000000000000",
      accountNumber: "5555666677",
    },
  },
];

const cover = (seed: number) =>
  `/covers/default.jpg`;

export const books: MockBook[] = [
  {
    id: "book-1",
    slug: "manual-supply-chain-africa",
    title: "Manual de Supply Chain na África Austral",
    description:
      "Guia completo para profissionais que operam cadeias de abastecimento em mercados emergentes, com foco em Angola e região SADC.",
    summary: "Cap. 1: Introdução\nCap. 2: Redes de distribuição\nCap. 3: KPIs logísticos\nCap. 4: Tecnologia",
    authorId: "auth-1",
    authorName: "Dr. Carlos Mendes",
    categoryId: "cat-supply",
    categoryName: "Supply Chain",
    productType: "BOTH",
    status: "PUBLISHED",
    priceEbook: 12000,
    pricePhysical: 25000,
    coverUrl: "/covers/manual-supply-chain-africa.jpg",
    stockQuantity: 45,
    ratingAvg: 4.8,
    ratingCount: 124,
    salesCount: 890,
    publishYear: 2024,
    keywords: ["supply chain", "África", "distribuição"],
    featured: true,
    sellerId: "seller-1",
    sellerName: "Mesclar Edições",
  },
  {
    id: "book-2",
    slug: "manual-procurement-estrategico",
    title: "Manual Prático de Procurement Estratégico",
    description: "Guia completo para profissionais de compras e procurement. Metodologias, negociação e gestão de fornecedores.",
    summary: "Fundamentos do procurement\nSourcing estratégico\nContratos e SLAs",
    authorId: "auth-2",
    authorName: "Eng. Ana Paula Silva",
    categoryId: "cat-procurement",
    categoryName: "Procurement",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 15000,
    coverUrl: "/covers/manual-procurement-estrategico.jpg",
    stockQuantity: 999,
    ratingAvg: 4.9,
    ratingCount: 256,
    salesCount: 1200,
    featured: true,
    sellerId: "seller-3",
    sellerName: "Supply Chain Books",
  },
  {
    id: "book-3",
    slug: "importacao-exportacao-guia",
    title: "Importação e Exportação: Guia Prático",
    description: "Procedimentos, documentação e compliance para comércio internacional.",
    authorId: "auth-3",
    authorName: "Prof. João Baptista",
    categoryId: "cat-importacao",
    categoryName: "Importação",
    productType: "PHYSICAL",
    status: "PUBLISHED",
    priceEbook: 0,
    pricePhysical: 18000,
    coverUrl: "/covers/importacao-exportacao-guia.jpg",
    stockQuantity: 30,
    ratingAvg: 4.6,
    ratingCount: 89,
    salesCount: 340,
    sellerId: "seller-2",
    sellerName: "Logística Press",
  },
  {
    id: "book-4",
    slug: "gestao-armazens-wms",
    title: "Gestão de Armazéns e WMS",
    description: "Operações de armazém, layout, picking e sistemas WMS para máxima eficiência.",
    authorId: "auth-4",
    authorName: "Maria Fernandes",
    categoryId: "cat-armazem",
    categoryName: "Armazém",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 9500,
    coverUrl: "/covers/gestao-armazens-wms.jpg",
    stockQuantity: 999,
    ratingAvg: 4.7,
    ratingCount: 67,
    salesCount: 520,
    isNew: true,
    sellerId: "seller-1",
    sellerName: "Mesclar Edições",
  },
  {
    id: "book-5",
    slug: "gestao-frotas-transporte",
    title: "Gestão de Frotas e Transporte Rodoviário",
    description: "Manutenção, rotas, custos e compliance na gestão de frotas comerciais.",
    authorId: "auth-5",
    authorName: "Ricardo Neto",
    categoryId: "cat-frotas",
    categoryName: "Frotas",
    productType: "BOTH",
    status: "PUBLISHED",
    priceEbook: 11000,
    pricePhysical: 22000,
    coverUrl: "/covers/gestao-frotas-transporte.jpg",
    stockQuantity: 20,
    ratingAvg: 4.5,
    ratingCount: 45,
    salesCount: 280,
    sellerId: "seller-2",
    sellerName: "Logística Press",
  },
  {
    id: "book-6",
    slug: "kpi-logisticos",
    title: "KPIs Logísticos Essenciais",
    description: "eBook gratuito com indicadores-chave para medir performance logística.",
    authorId: "auth-1",
    authorName: "Dr. Carlos Mendes",
    categoryId: "cat-logistica",
    categoryName: "Logística",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 0,
    coverUrl: "/covers/kpi-logisticos.jpg",
    stockQuantity: 999,
    ratingAvg: 4.4,
    ratingCount: 312,
    salesCount: 4500,
    sellerId: "seller-1",
    sellerName: "Mesclar Edições",
  },
  {
    id: "book-7",
    slug: "negociacao-fornecedores",
    title: "Negociação com Fornecedores",
    description: "Técnicas avançadas de negociação no contexto de procurement B2B.",
    authorId: "auth-2",
    authorName: "Eng. Ana Paula Silva",
    categoryId: "cat-compras",
    categoryName: "Compras",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 8500,
    coverUrl: "/covers/negociacao-fornecedores.jpg",
    stockQuantity: 999,
    ratingAvg: 4.6,
    ratingCount: 78,
    salesCount: 410,
    sellerId: "seller-3",
    sellerName: "Supply Chain Books",
  },
  {
    id: "book-8",
    slug: "despacho-aduaneiro-basico",
    title: "Despacho Aduaneiro — Introdução",
    description: "eBook gratuito sobre fundamentos de despacho aduaneiro e documentação.",
    authorId: "auth-3",
    authorName: "Prof. João Baptista",
    categoryId: "cat-importacao",
    categoryName: "Importação",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 0,
    coverUrl: "/covers/despacho-aduaneiro-basico.jpg",
    stockQuantity: 999,
    ratingAvg: 4.3,
    ratingCount: 156,
    salesCount: 2100,
    sellerId: "seller-2",
    sellerName: "Logística Press",
  },
  {
    id: "book-9",
    slug: "inventario-controle-estoque",
    title: "Controle de Inventário e Estoque",
    description: "Métodos ABC, EOQ e práticas de contagem para gestão de inventário.",
    authorId: "auth-4",
    authorName: "Maria Fernandes",
    categoryId: "cat-supply",
    categoryName: "Supply Chain",
    productType: "PHYSICAL",
    status: "PUBLISHED",
    pricePhysical: 16000,
    priceEbook: 0,
    coverUrl: "/covers/inventario-controle-estoque.jpg",
    stockQuantity: 15,
    ratingAvg: 4.8,
    ratingCount: 34,
    salesCount: 95,
    isNew: true,
    sellerId: "seller-1",
    sellerName: "Mesclar Edições",
  },
  {
    id: "book-10",
    slug: "ia-logistica-futuro",
    title: "Inteligência Artificial na Logística",
    description: "Como IA e analytics transformam planejamento, rotas e previsão de demanda.",
    authorId: "auth-5",
    authorName: "Ricardo Neto",
    categoryId: "cat-tech",
    categoryName: "Tecnologia Logística",
    productType: "EBOOK",
    status: "PUBLISHED",
    priceEbook: 17500,
    coverUrl: "/covers/ia-logistica-futuro.jpg",
    stockQuantity: 999,
    ratingAvg: 4.9,
    ratingCount: 42,
    salesCount: 380,
    featured: true,
    sellerId: "seller-3",
    sellerName: "Supply Chain Books",
  },
];

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
    (b) =>
      (b.productType === "EBOOK" || b.productType === "BOTH") && b.priceEbook === 0
  );
}

export function getPremiumEbooks(): MockBook[] {
  return getPublishedBooks().filter(
    (b) =>
      (b.productType === "EBOOK" || b.productType === "BOTH") && b.priceEbook > 0
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
