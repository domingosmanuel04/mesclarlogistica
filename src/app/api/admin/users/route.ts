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

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        whatsapp: true,
        createdAt: true,
        updatedAt: true,
        seller: {
          select: {
            id: true,
            isActive: true,
            _count: { select: { books: true, orders: true } },
          },
        },
        author: {
          select: {
            id: true,
            slug: true,
            photoUrl: true,
            isValidated: true,
            specialty: true,
          },
        },
        _count: {
          select: {
            orders: true,
            downloads: true,
          },
        },
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
      },
      take: 250,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[admin-users-api-get] Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authz = await requireRoles(["ADMIN"]);
  if (isAuthError(authz)) return authz.error;

  try {
    const body = await request.json();
    const action = body.action as string;

    // 1. CRIAR NOVO USUÁRIO / PROFISSIONAL
    if (action === "create") {
      const parsed = z
        .object({
          name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
          email: z.string().email("Email inválido."),
          password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
          role: z.enum(["SELLER", "ADMIN", "CUSTOMER"]).default("SELLER"),
          phone: z.string().optional().nullable(),
          whatsapp: z.string().optional().nullable(),
          isActive: z.boolean().default(true),
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
          role: parsed.data.role,
          isActive: parsed.data.isActive ?? true,
          phone: parsed.data.phone?.trim() || null,
          whatsapp: parsed.data.whatsapp?.trim() || null,
        },
      });

      // Se for profissional (SELLER), cria o registo Seller e Author correspondente
      if (parsed.data.role === "SELLER") {
        await prisma.seller.create({
          data: {
            userId: newUser.id,
            bio: "Perfil profissional registado pela administração.",
            isActive: true,
          },
        });

        let slug = slugify(parsed.data.name);
        const slugExists = await prisma.author.findUnique({ where: { slug } });
        if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

        await prisma.author.create({
          data: {
            userId: newUser.id,
            name: parsed.data.name.trim(),
            slug,
            contactEmail: email,
            contactWhatsapp: parsed.data.whatsapp?.trim() || null,
            photoUrl: "/authors/carlos-mendes.jpg",
          },
        });
      }

      return NextResponse.json({ ok: true, user: newUser }, { status: 201 });
    }

    // 2. ACTIVAR / DESACTIVAR UTILIZADOR
    if (action === "toggle-active") {
      const { userId, isActive } = body;
      if (!userId) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

      if (userId === authz.session.user.id) {
        return NextResponse.json(
          { error: "Não pode desactivar a sua própria conta de administrador." },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: Boolean(isActive) },
      });

      // Sincroniza seller se existir
      await prisma.seller
        .updateMany({
          where: { userId },
          data: { isActive: Boolean(isActive) },
        })
        .catch(() => null);

      return NextResponse.json({ ok: true, isActive: updated.isActive });
    }

    // 3. TROCAR PALAVRA-PASSE
    if (action === "change-password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "A palavra-passe deve ter no mínimo 6 caracteres." },
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

    // 4. EDITAR DADOS DO UTILIZADOR
    if (action === "edit") {
      const { userId, name, email, role, phone, whatsapp, isActive } = body;
      if (!userId || !name || !email) {
        return NextResponse.json({ error: "Preencha o nome e email." }, { status: 400 });
      }

      const cleanEmail = String(email).toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Este email já pertence a outro utilizador." }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: String(name).trim(),
          email: cleanEmail,
          role: role || undefined,
          phone: phone ? String(phone).trim() : null,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
        },
      });

      // Se mudou para SELLER e não tem perfil Seller/Author, garante a criação
      if (updated.role === "SELLER") {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) {
          await prisma.seller.create({
            data: { userId, isActive: updated.isActive },
          });
        }
        const author = await prisma.author.findFirst({ where: { userId } });
        if (!author) {
          let slug = slugify(updated.name);
          const sExists = await prisma.author.findUnique({ where: { slug } });
          if (sExists) slug = `${slug}-${Date.now().toString(36)}`;
          await prisma.author.create({
            data: {
              userId,
              name: updated.name,
              slug,
              contactEmail: updated.email,
              contactWhatsapp: updated.whatsapp,
              photoUrl: "/authors/carlos-mendes.jpg",
            },
          });
        }
      }

      return NextResponse.json({ ok: true, user: updated });
    }

    // 5. ELIMINAR UTILIZADOR
    if (action === "delete") {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

      if (userId === authz.session.user.id) {
        return NextResponse.json(
          { error: "Não pode eliminar a sua própria conta de administrador." },
          { status: 400 }
        );
      }

      // Desassocia ou remove em cascata
      await prisma.author.updateMany({
        where: { userId },
        data: { userId: null },
      });
      await prisma.user.delete({ where: { id: userId } });

      return NextResponse.json({ ok: true });
    }

    // 6. ACESSAR O PAINEL DELE (IMPERSONAÇÃO SEGURA)
    if (action === "impersonate") {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: "ID do utilizador em falta." }, { status: 400 });

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

      // Gera um token de uso único com expiração em 60 segundos
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
        redirectUrl: target.role === "SELLER" ? "/profissional" : target.role === "ADMIN" ? "/admin" : "/conta",
      });
    }

    // 7. RENOVAR PAGAMENTO
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
        return NextResponse.json({ error: "Nenhum pedido ou pagamento encontrado para renovar." }, { status: 404 });
      }

      // Aprova ou renova o pedido e pagamento
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

      // Renova ou gera downloads com nova validade de 30 dias
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
          message: `O pagamento do seu pedido ${order.orderNumber} foi aprovado/renovado com sucesso pela administração.`,
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
    console.error("[admin-users-api] Error:", error);
    return NextResponse.json({ error: "Erro ao processar acção de utilizador." }, { status: 500 });
  }
}
