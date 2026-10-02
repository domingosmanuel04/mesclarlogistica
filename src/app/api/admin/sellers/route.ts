import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRoles, isAuthError } from "@/lib/api-auth";
import { slugify } from "@/lib/catalog-map";
import { generateNextRegistrationNumber } from "@/lib/registration-number";

export async function GET(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();

  const sellers = await prisma.seller.findMany({
    where: q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
            { user: { whatsapp: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true,
              payment: {
                select: {
                  id: true,
                  approvedAt: true,
                },
              },
            },
          },
          _count: {
            select: {
              orders: true,
              downloads: true,
            },
          },
        },
      },
      _count: {
        select: {
          books: true,
          orders: true,
          trainings: true,
          articles: true,
        },
      },
      books: {
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          priceEbook: true,
          pricePhysical: true,
          productType: true,
        },
      },
      trainings: {
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          active: true,
        },
      },
    },
    take: 200,
  });

  // Anexa o perfil de autor correspondente
  const userIds = sellers.map((s) => s.userId);
  const authors = await prisma.author.findMany({
    where: { userId: { in: userIds } },
    select: {
      id: true,
      userId: true,
      name: true,
      slug: true,
      specialty: true,
      bio: true,
      photoUrl: true,
      isValidated: true,
      validatedAt: true,
    },
  });

  const authorMap = new Map(authors.map((a) => [a.userId, a]));

  const result = sellers.map((seller) => ({
    ...seller,
    author: seller.userId ? authorMap.get(seller.userId) || null : null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const action = body.action as string;

    // 1. CRIAR NOVO PROFISSIONAL
    if (action === "create") {
      const parsed = z
        .object({
          name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
          email: z.string().email("Email inválido."),
          password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
          phone: z.string().optional().nullable(),
          whatsapp: z.string().optional().nullable(),
          specialty: z.string().optional().nullable(),
          bio: z.string().optional().nullable(),
          isActive: z.boolean().default(true),
          isValidated: z.boolean().default(false),
        })
        .safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Dados inválidos." },
          { status: 400 }
        );
      }

      const email = parsed.data.email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Já existe uma conta registada com este email." },
          { status: 400 }
        );
      }

      const registrationNumber = await generateNextRegistrationNumber(parsed.data.name.trim());
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);

      const newUser = await prisma.user.create({
        data: {
          name: parsed.data.name.trim(),
          email,
          registrationNumber,
          passwordHash,
          role: "SELLER",
          isActive: parsed.data.isActive,
          phone: parsed.data.phone?.trim() || null,
          whatsapp: parsed.data.whatsapp?.trim() || null,
        },
      });

      const newSeller = await prisma.seller.create({
        data: {
          userId: newUser.id,
          bio: parsed.data.bio?.trim() || null,
          isActive: parsed.data.isActive,
        },
      });

      let slug = slugify(parsed.data.name);
      const slugExists = await prisma.author.findUnique({ where: { slug } });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

      const newAuthor = await prisma.author.create({
        data: {
          userId: newUser.id,
          name: parsed.data.name.trim(),
          slug,
          specialty: parsed.data.specialty?.trim() || "Profissional de Logística e Supply Chain",
          bio: parsed.data.bio?.trim() || null,
          contactEmail: email,
          contactWhatsapp: parsed.data.whatsapp?.trim() || null,
          photoUrl: "/authors/carlos-mendes.jpg",
          isValidated: parsed.data.isValidated,
          validatedAt: parsed.data.isValidated ? new Date() : null,
        },
      });

      return NextResponse.json(
        { ok: true, user: newUser, seller: newSeller, author: newAuthor },
        { status: 201 }
      );
    }

    // 2. ACTIVAR / DESACTIVAR PROFISSIONAL
    if (action === "toggle-active") {
      const { sellerId, userId, isActive } = body;
      const targetUserId = userId || (sellerId ? (await prisma.seller.findUnique({ where: { id: sellerId } }))?.userId : null);

      if (!targetUserId) {
        return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 400 });
      }

      if (targetUserId === authz.session.user.id) {
        return NextResponse.json(
          { error: "Não pode desactivar a sua própria conta." },
          { status: 400 }
        );
      }

      const activeVal = Boolean(isActive);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: activeVal },
      });

      await prisma.seller.updateMany({
        where: { userId: targetUserId },
        data: { isActive: activeVal },
      });

      return NextResponse.json({ ok: true, isActive: activeVal });
    }

    // 3. VALIDAR / REMOVER VALIDAÇÃO DE AUTOR
    if (action === "toggle-validate") {
      const { authorId, userId, isValidated } = body;
      let targetAuthorId = authorId;

      if (!targetAuthorId && userId) {
        const found = await prisma.author.findFirst({ where: { userId } });
        targetAuthorId = found?.id;
      }

      if (!targetAuthorId) {
        return NextResponse.json({ error: "Perfil de autor não encontrado." }, { status: 404 });
      }

      const validatedVal = Boolean(isValidated);
      const updated = await prisma.author.update({
        where: { id: targetAuthorId },
        data: {
          isValidated: validatedVal,
          validatedAt: validatedVal ? new Date() : null,
        },
      });

      return NextResponse.json({ ok: true, isValidated: updated.isValidated });
    }

    // 4. TROCAR PALAVRA-PASSE
    if (action === "change-password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "A nova palavra-passe deve ter no mínimo 6 caracteres." },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      return NextResponse.json({ ok: true });
    }

    // 5. EDITAR DADOS DO PROFISSIONAL
    if (action === "edit") {
      const { userId, sellerId, name, email, phone, whatsapp, specialty, bio, isActive, isValidated } = body;

      const targetUserId = userId || (sellerId ? (await prisma.seller.findUnique({ where: { id: sellerId } }))?.userId : null);
      if (!targetUserId || !name || !email) {
        return NextResponse.json({ error: "Preencha o nome e email." }, { status: 400 });
      }

      const cleanEmail = String(email).toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id: targetUserId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Este email já pertence a outra conta." }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          name: String(name).trim(),
          email: cleanEmail,
          phone: phone ? String(phone).trim() : null,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
        },
      });

      // Actualiza seller
      await prisma.seller.updateMany({
        where: { userId: targetUserId },
        data: {
          bio: bio ? String(bio).trim() : null,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
        },
      });

      // Actualiza author
      const existingAuthor = await prisma.author.findFirst({ where: { userId: targetUserId } });
      if (existingAuthor) {
        await prisma.author.update({
          where: { id: existingAuthor.id },
          data: {
            name: String(name).trim(),
            specialty: specialty ? String(specialty).trim() : existingAuthor.specialty,
            bio: bio ? String(bio).trim() : existingAuthor.bio,
            contactEmail: cleanEmail,
            contactWhatsapp: whatsapp ? String(whatsapp).trim() : existingAuthor.contactWhatsapp,
            isValidated: typeof isValidated === "boolean" ? isValidated : existingAuthor.isValidated,
            validatedAt: isValidated === true ? (existingAuthor.validatedAt || new Date()) : isValidated === false ? null : existingAuthor.validatedAt,
          },
        });
      } else {
        let slug = slugify(name);
        const sExists = await prisma.author.findUnique({ where: { slug } });
        if (sExists) slug = `${slug}-${Date.now().toString(36)}`;

        await prisma.author.create({
          data: {
            userId: targetUserId,
            name: String(name).trim(),
            slug,
            specialty: specialty ? String(specialty).trim() : "Profissional de Logística",
            bio: bio ? String(bio).trim() : null,
            contactEmail: cleanEmail,
            contactWhatsapp: whatsapp ? String(whatsapp).trim() : null,
            photoUrl: "/authors/carlos-mendes.jpg",
            isValidated: Boolean(isValidated),
            validatedAt: isValidated ? new Date() : null,
          },
        });
      }

      return NextResponse.json({ ok: true, user: updatedUser });
    }

    // 6. ELIMINAR PROFISSIONAL
    if (action === "delete") {
      const { userId, sellerId } = body;
      const targetUserId = userId || (sellerId ? (await prisma.seller.findUnique({ where: { id: sellerId } }))?.userId : null);

      if (!targetUserId) {
        return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 400 });
      }

      if (targetUserId === authz.session.user.id) {
        return NextResponse.json(
          { error: "Não pode eliminar a sua própria conta." },
          { status: 400 }
        );
      }

      // Desassocia autor e remove em cascata
      await prisma.author.updateMany({
        where: { userId: targetUserId },
        data: { userId: null },
      });

      await prisma.user.delete({ where: { id: targetUserId } });

      return NextResponse.json({ ok: true });
    }

    // 7. ACESSAR PAINEL DO PROFISSIONAL (IMPERSONATION)
    if (action === "impersonate") {
      const { userId, sellerId } = body;
      const targetUserId = userId || (sellerId ? (await prisma.seller.findUnique({ where: { id: sellerId } }))?.userId : null);

      if (!targetUserId) {
        return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 400 });
      }

      const target = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!target) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

      const impersonateToken = `imp_${randomUUID().replace(/-/g, "")}`;
      await prisma.user.update({
        where: { id: target.id },
        data: {
          resetToken: impersonateToken,
          resetTokenExpiry: new Date(Date.now() + 60 * 1000),
        },
      });

      return NextResponse.json({
        ok: true,
        impersonateToken,
        targetEmail: target.email,
        targetRole: target.role,
        redirectUrl: "/profissional",
      });
    }

    // 8. RENOVAR PAGAMENTO
    if (action === "renew-payment") {
      const { orderId, userId } = body;

      let order = null;
      if (orderId) {
        order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { book: true } }, user: true },
        });
      } else if (userId) {
        order = await prisma.order.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: { items: { include: { book: true } }, user: true },
        });
      }

      if (!order) {
        return NextResponse.json({ error: "Nenhum pedido encontrado para renovar." }, { status: 404 });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_APPROVED" },
      });

      await prisma.payment.upsert({
        where: { orderId: order.id },
        update: {
          approvedAt: new Date(),
          rejectionReason: null,
        },
        create: {
          orderId: order.id,
          amount: order.total,
          reference: `REN-${Date.now().toString(36).toUpperCase()}`,
          approvedAt: new Date(),
        },
      });

      for (const item of order.items) {
        if (item.productType === "EBOOK" || item.productType === "BOTH") {
          const token = randomUUID();
          await prisma.download.create({
            data: {
              userId: order.userId,
              bookId: item.bookId,
              orderId: order.id,
              token,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "PAYMENT_APPROVED",
          title: "Pagamento Renovado e Aprovado",
          message: `O pagamento do seu pedido ${order.orderNumber} foi renovado com sucesso pela administração.`,
          link: "/conta/ebooks",
        },
      });

      return NextResponse.json({
        ok: true,
        orderNumber: order.orderNumber,
        status: "PAYMENT_APPROVED",
      });
    }

    return NextResponse.json({ error: "Acção não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("[admin-sellers-api] Error:", error);
    return NextResponse.json({ error: "Erro ao processar acção de profissional." }, { status: 500 });
  }
}
