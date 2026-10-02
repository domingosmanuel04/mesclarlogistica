import { NextResponse } from "next/server";
import { requireSession, isAuthError } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const userId = authRes.session.user.id;
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId é obrigatório." }, { status: 400 });
  }

  try {
    // Verificar se o utilizador pertence a esta conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada ou acesso negado." }, { status: 404 });
    }

    // Marcar como lidas todas as mensagens da outra pessoa
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        read: false,
        senderId: { not: userId },
      },
      data: { read: true },
    });

    // Obter mensagens da conversa
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            author: { select: { photoUrl: true } },
          },
        },
      },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderPhoto: m.sender.author?.photoUrl || null,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      read: m.read,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ messages: formatted });
  } catch (error: any) {
    console.error("Erro ao carregar mensagens:", error);
    return NextResponse.json({ error: "Erro ao carregar histórico do chat." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const senderId = authRes.session.user.id;

  try {
    const { conversationId, content, attachmentUrl } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId é obrigatório." }, { status: 400 });
    }

    if (!content?.trim() && !attachmentUrl) {
      return NextResponse.json({ error: "A mensagem não pode estar vazia." }, { status: 400 });
    }

    // Verificar se o utilizador faz parte da conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: senderId }, { user2Id: senderId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada ou acesso negado." }, { status: 404 });
    }

    // Criar mensagem
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        content: content ? content.trim() : "",
        attachmentUrl: attachmentUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            author: { select: { photoUrl: true } },
          },
        },
      },
    });

    // Atualizar data da última mensagem na conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      message: {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        senderName: newMessage.sender.name,
        senderPhoto: newMessage.sender.author?.photoUrl || null,
        content: newMessage.content,
        attachmentUrl: newMessage.attachmentUrl,
        read: newMessage.read,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json({ error: "Erro ao enviar a mensagem." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authRes = await requireSession();
  if (isAuthError(authRes)) return authRes.error;

  const userId = authRes.session.user.id;

  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId é obrigatório." }, { status: 400 });
    }

    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        read: false,
        senderId: { not: userId },
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return NextResponse.json({ error: "Erro ao atualizar estado de leitura." }, { status: 500 });
  }
}
