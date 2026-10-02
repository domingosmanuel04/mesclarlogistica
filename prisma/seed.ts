import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const sellerHash = await bcrypt.hash("vendedor123", 12);
  const customerHash = await bcrypt.hash("cliente123", 12);

  await prisma.user.upsert({
    where: { email: "admin@mesclar.ao" },
    update: { passwordHash: adminHash, role: "ADMIN", registrationNumber: "MESC.AD0100" },
    create: {
      name: "Administrador Mesclar",
      email: "admin@mesclar.ao",
      registrationNumber: "MESC.AD0100",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "vendedor@mesclar.ao" },
    update: { passwordHash: sellerHash, role: "SELLER", name: "Mesclar Edições", registrationNumber: "MESC.ME0101" },
    create: {
      name: "Mesclar Edições",
      email: "vendedor@mesclar.ao",
      registrationNumber: "MESC.ME0101",
      passwordHash: sellerHash,
      role: "SELLER",
      phone: "+244 923 000 010",
      whatsapp: "+244 923 000 010",
    },
  });

  let seller = await prisma.seller.findUnique({ where: { userId: sellerUser.id } });
  if (!seller) {
    seller = await prisma.seller.create({
      data: {
        userId: sellerUser.id,
        bio: "Editora especializada em conteúdos logísticos.",
        bankAccounts: {
          create: {
            bankName: "BAI",
            accountHolder: "Mesclar Edições Lda",
            iban: "AO06004000000000000000000",
            accountNumber: "1234567890",
            isDefault: true,
          },
        },
      },
    });
  }

  const seller2User = await prisma.user.upsert({
    where: { email: "logistica@mesclar.ao" },
    update: {},
    create: {
      name: "Logística Press",
      email: "logistica@mesclar.ao",
      passwordHash: sellerHash,
      role: "SELLER",
    },
  });
  let seller2 = await prisma.seller.findUnique({ where: { userId: seller2User.id } });
  if (!seller2) {
    seller2 = await prisma.seller.create({
      data: {
        userId: seller2User.id,
        bio: "Publicações técnicas para a cadeia de abastecimento.",
        bankAccounts: {
          create: {
            bankName: "BFA",
            accountHolder: "Logística Press SA",
            iban: "AO06006000000000000000000",
            accountNumber: "9876543210",
            isDefault: true,
          },
        },
      },
    });
  }

  const seller3User = await prisma.user.upsert({
    where: { email: "supply@mesclar.ao" },
    update: {},
    create: {
      name: "Supply Chain Books",
      email: "supply@mesclar.ao",
      passwordHash: sellerHash,
      role: "SELLER",
    },
  });
  let seller3 = await prisma.seller.findUnique({ where: { userId: seller3User.id } });
  if (!seller3) {
    seller3 = await prisma.seller.create({
      data: {
        userId: seller3User.id,
        bio: "eBooks e manuais digitais de procurement e compras.",
        bankAccounts: {
          create: {
            bankName: "BIC",
            accountHolder: "Supply Chain Books",
            iban: "AO06005000000000000000000",
            accountNumber: "5555666677",
            isDefault: true,
          },
        },
      },
    });
  }

  await prisma.user.upsert({
    where: { email: "cliente@mesclar.ao" },
    update: { passwordHash: customerHash },
    create: {
      name: "Cliente Demo",
      email: "cliente@mesclar.ao",
      passwordHash: customerHash,
      role: "CUSTOMER",
      phone: "+244 923 111 222",
      whatsapp: "+244 923 111 222",
    },
  });

  const categoryDefs = [
    {
      name: "Logística",
      slug: "logistica",
      sortOrder: 1,
      subs: [
        { name: "Gestão Logística", slug: "gestao-logistica" },
        { name: "Transporte", slug: "transporte" },
        { name: "Distribuição", slug: "distribuicao" },
      ],
    },
    {
      name: "Procurement",
      slug: "procurement",
      sortOrder: 2,
      subs: [
        { name: "Procurement Estratégico", slug: "procurement-estrategico" },
        { name: "Sourcing", slug: "sourcing" },
        { name: "Gestão de Fornecedores", slug: "gestao-fornecedores" },
      ],
    },
    {
      name: "Compras",
      slug: "compras",
      sortOrder: 3,
      subs: [
        { name: "Compras Estratégicas", slug: "compras-estrategicas" },
        { name: "Gestão de Contratos", slug: "gestao-contratos" },
      ],
    },
    {
      name: "Importação",
      slug: "importacao",
      sortOrder: 4,
      subs: [
        { name: "Exportação", slug: "exportacao" },
        { name: "Comércio Internacional", slug: "comercio-internacional" },
        { name: "Despacho Aduaneiro", slug: "despacho-aduaneiro" },
      ],
    },
    {
      name: "Armazém",
      slug: "armazem",
      sortOrder: 5,
      subs: [
        { name: "Gestão de Armazéns", slug: "gestao-armazens" },
        { name: "Gestão de Inventário", slug: "gestao-inventario" },
      ],
    },
    {
      name: "Frotas",
      slug: "frotas",
      sortOrder: 6,
      subs: [{ name: "Gestão de Frotas", slug: "gestao-frotas" }],
    },
    {
      name: "Supply Chain",
      slug: "supply-chain",
      sortOrder: 7,
      subs: [
        { name: "Planejamento Logístico", slug: "planejamento-logistico" },
        { name: "Gestão de Estoque", slug: "gestao-estoque" },
      ],
    },
    {
      name: "Tecnologia Logística",
      slug: "tecnologia-logistica",
      sortOrder: 8,
      subs: [{ name: "IA aplicada à Logística", slug: "ia-logistica" }],
    },
  ];

  const catMap = new Map<string, { id: string; subIds: Map<string, string> }>();
  for (const c of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
    });
    const subIds = new Map<string, string>();
    for (const s of c.subs) {
      const sub = await prisma.subcategory.upsert({
        where: { slug: s.slug },
        update: { name: s.name, categoryId: cat.id },
        create: { name: s.name, slug: s.slug, categoryId: cat.id },
      });
      subIds.set(s.slug, sub.id);
    }
    catMap.set(c.slug, { id: cat.id, subIds });
  }

  const authorDefs = [
    {
      name: "Dr. Carlos Mendes",
      slug: "carlos-mendes",
      bio: "Especialista em supply chain com mais de 20 anos de experiência em operações portuárias e distribuição na África Austral.",
      specialty: "Supply Chain e Distribuição",
      photoUrl: "/authors/carlos-mendes.jpg",
      coverUrl: "/services/gestao-contratos.jpg",
      employmentStatus: "EMPLOYED" as const,
      academicStatus: "MASTERS" as const,
      professionalHistory:
        "2018–actual: Director de Logística — operador multimodal em Luanda.\n2012–2018: Coordenador de distribuição regional (SADC).\n2005–2012: Supervisor de operações portuárias.",
      softwareSkills: "SAP MM, Oracle WMS, Excel avançado, Power BI, TMS",
      technicalSkills:
        "Gestão de supply chain ponta a ponta, planeamento de demanda (S&OP), operações portuárias, logística internacional.",
      languages: "Português (nativo), Inglês (profissional), Francês (intermédio)",
      references: "Disponíveis sob pedido — operações e procurement.",
      contactEmail: "carlos.mendes@exemplo.ao",
      contactWhatsapp: "+244923000101",
      trainingCertifications:
        "• CIPS Level 4 — Procurement and Supply\n• Certificação Lean Six Sigma Green Belt\n• Formação em Gestão Portuária (APN)\n• Curso avançado de Supply Chain (APICS)",
      awardsRecognition:
        "• Prémio Excelência Logística Angola 2022\n• Reconhecimento SADC Supply Chain Leader 2020\n• Menção honrosa — Associação de Procurement de Angola",
      projects:
        "• Redesign da rede de distribuição Luanda–Benguela (2019–2021)\n• Implantação de WMS em 3 armazéns regionais\n• Optimização de rotas multimodal — porto e hinterland",
      additionalNotes: "Disponível para mentoring e palestras técnicas.",
    },
    {
      name: "Eng. Ana Paula Silva",
      slug: "ana-paula-silva",
      bio: "Consultora em procurement estratégico e negociação com fornecedores internacionais.",
      specialty: "Procurement e Compras",
      photoUrl: "/authors/ana-paula-silva.jpg",
      coverUrl: "/services/gestao-fornecedores.jpg",
      employmentStatus: "FREELANCER" as const,
      academicStatus: "POSTGRAD" as const,
      professionalHistory:
        "2020–actual: Consultora independente em procurement.\n2015–2020: Buyer sénior em multinacional de commodities.\n2010–2015: Analista de compras.",
      softwareSkills: "SAP Ariba, Coupa, Excel, MS Project",
      technicalSkills:
        "Procurement estratégico, negociação de fretes internacionais, homologação de fornecedores, análise de TCO.",
      languages: "Português, Inglês",
      references: "Clientes do sector extractivo e retalho.",
      contactEmail: "ana.silva@exemplo.ao",
      contactWhatsapp: "+244923000102",
      trainingCertifications:
        "• Certificação Internacional em Procurement e Compras (CIPS)\n• Negociação Estratégica Internacional e Gestão de Contratos\n• Strategic Sourcing e Gestão de Fornecedores Globais",
      additionalNotes: "Aceita projectos de 30–90 dias.",
    },
    {
      name: "Prof. João Baptista",
      slug: "joao-baptista",
      bio: "Académico e praticante em comércio internacional, importação e despacho aduaneiro.",
      specialty: "Comércio Internacional",
      photoUrl: "/authors/joao-baptista.jpg",
      coverUrl: "/services/governanca-compliance.jpg",
      employmentStatus: "EMPLOYED" as const,
      academicStatus: "BACHELOR" as const,
      professionalHistory:
        "Docente e consultor em despacho aduaneiro.\nEx-técnico de alfândegas.",
      softwareSkills: "Sistemas aduaneiros, Excel, Word",
      technicalSkills:
        "Despacho aduaneiro, regimes pautais, documentação de importação/exportação, conformidade aduaneira.",
      languages: "Português, Inglês",
      references: "Instituições de formação e despachantes.",
      contactEmail: "joao.baptista@exemplo.ao",
      contactWhatsapp: "+244923000103",
      trainingCertifications:
        "• Certificação de Despachante Aduaneiro Oficial\n• Legislação Pautal e Regimes Aduaneiros Especiais",
      additionalNotes: null,
    },
    {
      name: "Maria Fernandes",
      slug: "maria-fernandes",
      bio: "Gestora de armazéns e inventário, certificada em WMS e operações logísticas.",
      specialty: "Armazém e Inventário",
      photoUrl: "/authors/maria-fernandes.jpg",
      coverUrl: "/services/gestao-terceiros.jpg",
      employmentStatus: "ENTREPRENEUR" as const,
      academicStatus: "UNIVERSITY_ATTENDING" as const,
      professionalHistory:
        "Fundadora de solução de inventário para PMEs.\nAnteriormente supervisora de armazém em 3PL.",
      softwareSkills: "WMS, barcoding, Excel, ERP local",
      technicalSkills:
        "Gestão de armazém, controlo de inventário (FIFO/LIFO), auditoria de stocks, dimensionamento de layout e logística interna.",
      languages: "Português",
      references: "Operadores 3PL em Luanda.",
      contactEmail: "maria.fernandes@exemplo.ao",
      contactWhatsapp: "+244923000104",
      trainingCertifications:
        "• Certificação em WMS e Gestão de Armazéns\n• Curso Avançado de Gestão de Inventário e Stocks\n• Boas Práticas de Movimentação e Armazenagem (BPMA)",
      additionalNotes: "Aberta a parcerias comerciais.",
    },
    {
      name: "Ricardo Neto",
      slug: "ricardo-neto",
      bio: "Especialista em gestão de frotas, transporte rodoviário e otimização de rotas.",
      specialty: "Transporte e Frotas",
      photoUrl: "/authors/ricardo-neto.jpg",
      coverUrl: "/services/melhoria-processos.jpg",
      employmentStatus: "UNEMPLOYED" as const,
      academicStatus: "SECONDARY" as const,
      professionalHistory:
        "2016–2024: Supervisor de frota rodoviária.\n2012–2016: Técnico de manutenção e rotas.",
      softwareSkills: "Fleet management, GPS, Excel",
      technicalSkills:
        "Gestão e manutenção de frotas rodoviárias, roteirização, monitorização e rastreamento GPS, controlo de consumos.",
      languages: "Português, Inglês básico",
      references: "Transportadoras nacionais.",
      contactEmail: "ricardo.neto@exemplo.ao",
      contactWhatsapp: "+244923000105",
      trainingCertifications:
        "• Curso de Gestão de Frotas e Roteirização\n• Condução Defensiva e Eficiente para Pesados\n• Certificação em Telemetria e Monitorização Veicular",
      additionalNotes: "Disponível para contratação imediata.",
    },
  ];

  const authorMap = new Map<string, string>();
  for (const a of authorDefs) {
    const row = await prisma.author.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        bio: a.bio,
        specialty: a.specialty,
        photoUrl: a.photoUrl,
        coverUrl: a.coverUrl,
        employmentStatus: a.employmentStatus,
        academicStatus: a.academicStatus,
        professionalHistory: a.professionalHistory,
        softwareSkills: a.softwareSkills,
        technicalSkills: a.technicalSkills,
        languages: a.languages,
        references: a.references,
        contactEmail: a.contactEmail,
        contactWhatsapp: a.contactWhatsapp,
        trainingCertifications: a.trainingCertifications,
        awardsRecognition: a.awardsRecognition,
        projects: a.projects,
        additionalNotes: a.additionalNotes,
      },
      create: a,
    });
    authorMap.set(a.slug, row.id);
  }

  const books = [
    {
      slug: "manual-supply-chain-africa",
      title: "Manual de Supply Chain na África Austral",
      description:
        "Guia completo para profissionais que operam cadeias de abastecimento em mercados emergentes, com foco em Angola e região SADC.",
      summary: "Cap. 1: Introdução\nCap. 2: Redes de distribuição\nCap. 3: KPIs logísticos",
      author: "carlos-mendes",
      category: "supply-chain",
      productType: "BOTH" as const,
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
      sellerId: seller!.id,
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "manual-procurement-estrategico",
      title: "Manual Prático de Procurement Estratégico",
      description: "Guia completo para profissionais de compras e procurement.",
      summary: "Fundamentos do procurement\nSourcing estratégico\nContratos e SLAs",
      author: "ana-paula-silva",
      category: "procurement",
      subcategory: "procurement-estrategico",
      productType: "EBOOK" as const,
      priceEbook: 15000,
      coverUrl: "/covers/manual-procurement-estrategico.jpg",
      stockQuantity: 999,
      ratingAvg: 4.9,
      ratingCount: 256,
      salesCount: 1200,
      featured: true,
      sellerId: seller3!.id,
      keywords: ["procurement", "compras"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "importacao-exportacao-guia",
      title: "Importação e Exportação: Guia Prático",
      description: "Procedimentos, documentação e compliance para comércio internacional.",
      author: "joao-baptista",
      category: "importacao",
      productType: "PHYSICAL" as const,
      priceEbook: 0,
      pricePhysical: 18000,
      coverUrl: "/covers/importacao-exportacao-guia.jpg",
      stockQuantity: 30,
      ratingAvg: 4.6,
      ratingCount: 89,
      salesCount: 340,
      sellerId: seller2!.id,
      keywords: ["importação", "exportação"],
    },
    {
      slug: "gestao-armazens-wms",
      title: "Gestão de Armazéns e WMS",
      description: "Operações de armazém, layout, picking e sistemas WMS.",
      author: "maria-fernandes",
      category: "armazem",
      productType: "EBOOK" as const,
      priceEbook: 9500,
      coverUrl: "/covers/gestao-armazens-wms.jpg",
      stockQuantity: 999,
      ratingAvg: 4.7,
      ratingCount: 67,
      salesCount: 520,
      sellerId: seller!.id,
      keywords: ["armazém", "WMS"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "gestao-frotas-transporte",
      title: "Gestão de Frotas e Transporte Rodoviário",
      description: "Manutenção, rotas, custos e compliance na gestão de frotas.",
      author: "ricardo-neto",
      category: "frotas",
      productType: "BOTH" as const,
      priceEbook: 11000,
      pricePhysical: 22000,
      coverUrl: "/covers/gestao-frotas-transporte.jpg",
      stockQuantity: 20,
      ratingAvg: 4.5,
      ratingCount: 45,
      salesCount: 280,
      sellerId: seller2!.id,
      keywords: ["frotas", "transporte"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "kpi-logisticos",
      title: "KPIs Logísticos Essenciais",
      description: "eBook gratuito com indicadores-chave para medir performance logística.",
      author: "carlos-mendes",
      category: "logistica",
      productType: "EBOOK" as const,
      priceEbook: 0,
      coverUrl: "/covers/kpi-logisticos.jpg",
      stockQuantity: 999,
      ratingAvg: 4.4,
      ratingCount: 312,
      salesCount: 4500,
      sellerId: seller!.id,
      keywords: ["KPI", "logística"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "negociacao-fornecedores",
      title: "Negociação com Fornecedores",
      description: "Técnicas avançadas de negociação no contexto de procurement B2B.",
      author: "ana-paula-silva",
      category: "compras",
      productType: "EBOOK" as const,
      priceEbook: 8500,
      coverUrl: "/covers/negociacao-fornecedores.jpg",
      stockQuantity: 999,
      ratingAvg: 4.6,
      ratingCount: 78,
      salesCount: 410,
      sellerId: seller3!.id,
      keywords: ["negociação", "fornecedores"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "despacho-aduaneiro-basico",
      title: "Despacho Aduaneiro — Introdução",
      description: "eBook gratuito sobre fundamentos de despacho aduaneiro.",
      author: "joao-baptista",
      category: "importacao",
      productType: "EBOOK" as const,
      priceEbook: 0,
      coverUrl: "/covers/despacho-aduaneiro-basico.jpg",
      stockQuantity: 999,
      ratingAvg: 4.3,
      ratingCount: 156,
      salesCount: 2100,
      sellerId: seller2!.id,
      keywords: ["aduaneiro", "despacho"],
      pdfPath: "ebooks/demo.pdf",
    },
    {
      slug: "inventario-controle-estoque",
      title: "Controle de Inventário e Estoque",
      description: "Métodos ABC, EOQ e práticas de contagem para gestão de inventário.",
      author: "maria-fernandes",
      category: "supply-chain",
      productType: "PHYSICAL" as const,
      priceEbook: 0,
      pricePhysical: 16000,
      coverUrl: "/covers/inventario-controle-estoque.jpg",
      stockQuantity: 15,
      ratingAvg: 4.8,
      ratingCount: 34,
      salesCount: 95,
      sellerId: seller!.id,
      keywords: ["inventário", "estoque"],
    },
    {
      slug: "ia-logistica-futuro",
      title: "Inteligência Artificial na Logística",
      description: "Como IA e analytics transformam planejamento, rotas e previsão de demanda.",
      author: "ricardo-neto",
      category: "tecnologia-logistica",
      productType: "EBOOK" as const,
      priceEbook: 17500,
      coverUrl: "/covers/ia-logistica-futuro.jpg",
      stockQuantity: 999,
      ratingAvg: 4.9,
      ratingCount: 42,
      salesCount: 380,
      featured: true,
      sellerId: seller3!.id,
      keywords: ["IA", "logística"],
      pdfPath: "ebooks/demo.pdf",
    },
  ];

  for (const b of books) {
    const cat = catMap.get(b.category)!;
    await prisma.book.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        description: b.description,
        summary: b.summary,
        status: "PUBLISHED",
        productType: b.productType,
        priceEbook: b.priceEbook,
        pricePhysical: b.pricePhysical,
        coverUrl: b.coverUrl,
        stockQuantity: b.stockQuantity,
        ratingAvg: b.ratingAvg,
        ratingCount: b.ratingCount,
        salesCount: b.salesCount,
        featured: b.featured ?? false,
        keywords: b.keywords,
        pdfPath: b.pdfPath,
        sellerId: b.sellerId,
        authorId: authorMap.get(b.author)!,
        categoryId: cat.id,
        subcategoryId: b.subcategory ? cat.subIds.get(b.subcategory) : undefined,
      },
      create: {
        title: b.title,
        slug: b.slug,
        description: b.description,
        summary: b.summary,
        status: "PUBLISHED",
        productType: b.productType,
        priceEbook: b.priceEbook,
        pricePhysical: b.pricePhysical,
        coverUrl: b.coverUrl,
        stockQuantity: b.stockQuantity,
        ratingAvg: b.ratingAvg,
        ratingCount: b.ratingCount,
        salesCount: b.salesCount,
        featured: b.featured ?? false,
        keywords: b.keywords,
        pdfPath: b.pdfPath,
        publishYear: b.publishYear,
        sellerId: b.sellerId,
        authorId: authorMap.get(b.author)!,
        categoryId: cat.id,
        subcategoryId: b.subcategory ? cat.subIds.get(b.subcategory) : undefined,
      },
    });
  }

  const pickups = [
    {
      name: "Mesclar — Sede Luanda",
      address: "Rua dos Coqueiros, Ed. Logística, Loja 2",
      province: "Luanda",
      municipality: "Luanda",
      phone: "+244 923 000 001",
    },
    {
      name: "Ponto Benguela",
      address: "Av. 17 de Setembro, nº 120",
      province: "Benguela",
      municipality: "Benguela",
      phone: "+244 923 000 002",
    },
    {
      name: "Hub Huíla",
      address: "Complexo Comercial Lubango, Bloco B",
      province: "Huíla",
      municipality: "Lubango",
      phone: "+244 923 000 003",
    },
  ];

  for (const p of pickups) {
    const existing = await prisma.pickupPoint.findFirst({ where: { name: p.name } });
    if (!existing) await prisma.pickupPoint.create({ data: p });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      contactEmail: "contacto@mesclar.ao",
      contactWhatsapp: "+244921522885",
    },
    create: {
      id: "default",
      contactEmail: "contacto@mesclar.ao",
      contactWhatsapp: "+244921522885",
    },
  });

  await prisma.coupon.upsert({
    where: { code: "MESCLAR10" },
    update: { percentOff: 10, active: true, description: "10% demo" },
    create: {
      code: "MESCLAR10",
      description: "10% de desconto na primeira compra",
      percentOff: 10,
      minOrderTotal: 5000,
      maxUses: 1000,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FRETE0" },
    update: { amountOff: 2000, active: true },
    create: {
      code: "FRETE0",
      description: "2.000 Kz de desconto",
      amountOff: 2000,
      minOrderTotal: 10000,
    },
  });

  if (seller2) {
    await prisma.article.upsert({
      where: { slug: "gestao-estrategica-de-riscos-na-cadeia-de-abastecimento" },
      update: {},
      create: {
        title: "Gestão Estratégica de Riscos na Cadeia de Abastecimento: Lições para o Mercado Angolano",
        slug: "gestao-estrategica-de-riscos-na-cadeia-de-abastecimento",
        category: "Cadeia de Abastecimento (Supply Chain)",
        excerpt: "Análise profunda sobre a resiliência operacional, diversificação de fornecedores e previsibilidade de fluxos logísticos em economias emergentes.",
        content: `
          <p class="lead-text" style="font-size: 1.25rem; line-height: 1.75; color: #374151; margin-bottom: 1.5rem;">
            A volatilidade global recente e as dinâmicas cambiais colocaram a resiliência da cadeia de abastecimento no centro das prioridades da alta direção.
          </p>
          <div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <strong style="color: #854d0e;">Ponto Crítico:</strong>
            <p style="color: #713f12; margin-top: 4px;">A dependência exclusiva de fornecedores únicos ou rotas monopolizadas amplifica os custos em períodos de disrupção em mais de 38%.</p>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 1rem;">1. Mapeamento Multicamadas de Fornecedores</h2>
          <p style="line-height: 1.8; color: #4b5563; margin-bottom: 1rem;">
            Tradicionalmente, a gestão foca apenas no fornecedor direto (Tier 1). No entanto, as maiores falhas ocorrem frequentemente nos níveis secundários e terciários (Tier 2 e 3), onde matéria-prima e componentes sofrem estrangulamentos alfandegários ou de transporte.
          </p>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 1rem;">2. Estratégias Práticas de Mitigação</h2>
          <ul style="list-style-type: disc; padding-left: 1.5rem; line-height: 1.8; color: #4b5563; margin-bottom: 1.5rem;">
            <li><strong>Políticas de Double-Sourcing:</strong> Divisão de volumes entre pelo menos dois parceiros validados.</li>
            <li><strong>Digitalização de KPIs:</strong> Visibilidade em tempo real sobre inventários em trânsito e tempos de desalfandegamento.</li>
            <li><strong>Cláusulas Contratuais de Força Maior e SLAs:</strong> Alinhamento jurídico para salvaguardar operações essenciais.</li>
          </ul>
        `,
        coverUrl: "/services/melhoria-processos.jpg",
        tags: "Supply Chain, Riscos, Procurement, Angola",
        readTime: 6,
        status: "PUBLISHED",
        views: 142,
        sellerId: seller2.id,
        publishedAt: new Date(),
      },
    });

    await prisma.article.upsert({
      where: { slug: "melhores-praticas-de-procurement-e-auditoria-de-contratos" },
      update: {},
      create: {
        title: "Melhores Práticas de Procurement e Auditoria de Contratos Empresariais",
        slug: "melhores-praticas-de-procurement-e-auditoria-de-contratos",
        category: "Gestão de Contratos",
        excerpt: "Como evitar renovações automáticas onerosas e assegurar o cumprimento estrito dos SLAs estabelecidos entre contratante e fornecedor.",
        content: `
          <p class="lead-text" style="font-size: 1.25rem; line-height: 1.75; color: #374151; margin-bottom: 1.5rem;">
            A auditoria regular dos contratos de fornecimento é o pilar que garante sustentabilidade orçamental e conformidade regulatória.
          </p>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 1rem;">Faseamento do Ciclo de Vida Contratual</h2>
          <p style="line-height: 1.8; color: #4b5563; margin-bottom: 1rem;">
            Um processo maduro divide-se em três etapas imperativas: qualificação técnica do concorrente, formalização com metas quantificáveis e monitoramento mensal de entregáveis.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h4 style="font-weight: 600; margin-bottom: 8px; color: #0f172a;">Recomendação Mesclar</h4>
            <p style="color: #334155; line-height: 1.6;">Estabeleça gatilhos automáticos de revisão com antecedência mínima de 60 a 90 dias antes de qualquer termo de vigência.</p>
          </div>
        `,
        coverUrl: "/services/gestao-contratos.jpg",
        tags: "Contratos, Auditoria, Compras, Governança",
        readTime: 4,
        status: "PUBLISHED",
        views: 89,
        sellerId: seller2.id,
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seed Mesclar concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
