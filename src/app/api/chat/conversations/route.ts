import { NextResponse } from "next/server";
import { requireSession, isAuthError } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const userId = authRes.session.user.id;

  try {
    // Buscar conversas onde o utilizador é user1 ou user2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            author: { select: { photoUrl: true } },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            author: { select: { photoUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Calcular contagem de não lidas e formatar resposta
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;

        const unreadCount = await prisma.chatMessage.count({
          where: {
            conversationId: conv.id,
            read: false,
            senderId: { not: userId },
          },
        });

        const lastMsg = conv.messages[0] || null;

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role,
            photoUrl: otherUser.author?.photoUrl || null,
          },
          lastMessageAt: conv.lastMessageAt,
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.content,
                attachmentUrl: lastMsg.attachmentUrl,
                senderId: lastMsg.senderId,
                read: lastMsg.read,
                createdAt: lastMsg.createdAt,
              }
            : null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (error: any) {
    console.error("Erro ao carregar conversas:", error);
    return NextResponse.json({ error: "Erro interno ao carregar conversas." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const currentUserId = authRes.session.user.id;

  try {
    const { recipientId } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: "Destinatário não especificado." }, { status: 400 });
    }

    if (recipientId === currentUserId) {
      return NextResponse.json({ error: "Não é possível iniciar conversa consigo mesmo." }, { status: 400 });
    }

    // Verificar se o destinatário existe
    const targetUser = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        author: { select: { photoUrl: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador destinatário não encontrado." }, { status: 404 });
    }

    // Buscar conversa existente (qualquer ordem de user1Id/user2Id)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: currentUserId },
        ],
      },
    });

    if (!conversation) {
      const [u1, u2] =
        currentUserId < recipientId ? [currentUserId, recipientId] : [recipientId, currentUserId];
      try {
        conversation = await prisma.conversation.create({
          data: {
            user1Id: u1,
            user2Id: u2,
            lastMessageAt: new Date(),
          },
        });
      } catch (createErr) {
        conversation = await prisma.conversation.findFirst({
          where: {
            OR: [
              { user1Id: currentUserId, user2Id: recipientId },
              { user1Id: recipientId, user2Id: currentUserId },
            ],
          },
        });

        if (!conversation) {
          throw createErr;
        }
      }
    }

    const formattedConversation = {
      id: conversation.id,
      otherUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        photoUrl: targetUser.author?.photoUrl || null,
      },
      lastMessageAt: conversation.lastMessageAt,
      lastMessage: null,
      unreadCount: 0,
    };

    return NextResponse.json({
      conversationId: conversation.id,
      conversation: formattedConversation,
    });
  } catch (error: any) {
    console.error("Erro ao criar/obter conversa:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao iniciar conversa." },
      { status: 500 }
    );
  }
}
