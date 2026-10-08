import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Limpando dados mock da base de dados ===");

  try {
    // 1. Apagar tabelas dependentes
    await prisma.download.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.review.deleteMany().catch(() => {});
    await prisma.order.deleteMany().catch(() => {});
    await prisma.address.deleteMany().catch(() => {});
    await prisma.supportTicket.deleteMany().catch(() => {});
    await prisma.chatMessage.deleteMany().catch(() => {});
    await prisma.conversation.deleteMany().catch(() => {});

    // 2. Apagar conteúdos publicados
    await prisma.book.deleteMany().catch(() => {});
    await prisma.article.deleteMany().catch(() => {});
    await prisma.job.deleteMany().catch(() => {});
    await prisma.company.deleteMany().catch(() => {});
    await prisma.webinar.deleteMany().catch(() => {});
    await prisma.training.deleteMany().catch(() => {});
    await prisma.bankAccount.deleteMany().catch(() => {});

    // 3. Apagar perfis e autores
    await prisma.author.deleteMany().catch(() => {});
    await prisma.seller.deleteMany().catch(() => {});

    // 4. Apagar utilizadores não-admin
    await prisma.user.deleteMany({
      where: {
        AND: [
          { email: { not: "admin@mesclar.ao" } },
          { registrationNumber: { not: "MESC.AD0100" } },
        ],
      },
    }).catch(() => {});
  } catch (err) {
    console.warn("Aviso durante limpeza de dados:", err);
  }

  // 5. Garantir a existência do único utilizador ADMINISTRADOR
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mesclar.ao" },
    update: {
      name: "Administrador Mesclar",
      passwordHash: adminHash,
      role: "ADMIN",
      registrationNumber: "MESC.AD0100",
      isActive: true,
    },
    create: {
      name: "Administrador Mesclar",
      email: "admin@mesclar.ao",
      registrationNumber: "MESC.AD0100",
      passwordHash: adminHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`✅ Utilizador Admin criado/atualizado: ${admin.email} (ID: ${admin.registrationNumber})`);

  // 6. Criar Categorias Base para a Plataforma
  const baseCategories = [
    { name: "Logística e Procurement", slug: "logistica-procurement", description: "Gestão estratégica de compras, contratação e cadeia de suprimentos." },
    { name: "Operações e Transporte", slug: "operacoes-transporte", description: "Transporte rodoviário, marítimo, aéreo e roteirização de frotas." },
    { name: "Cadeia de Abastecimento", slug: "cadeia-abastecimento", description: "Planeamento de procura, inventários e inteligência de supply chain." },
    { name: "Comércio Internacional", slug: "comercio-internacional", description: "Despacho aduaneiro, Incoterms, Pauta Aduaneira e processos de importação/exportação." },
    { name: "Armazenagem e Distribuição", slug: "armazenagem-distribuicao", description: "Gestão de armazéns, WMS, movimentação de cargas e acondicionamento." },
  ];

  for (const cat of baseCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }

  console.log("✅ Categorias base atualizadas com sucesso.");
  console.log("=== Limpeza e Inicialização Concluídas ===");
}

main()
  .catch((e) => {
    console.error("Erro durante execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
