import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WebReader } from "@/components/reader/web-reader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const download = await prisma.download.findUnique({
    where: { token },
    include: { book: true },
  });

  if (!download) return { title: "Leitor de eBook — Mesclar" };
  return {
    title: `Lendo: ${download.book.title} — Mesclar Logística`,
  };
}

export default async function ReaderPage({ params }: PageProps) {
  const { token } = await params;

  const download = await prisma.download.findUnique({
    where: { token },
    include: {
      book: { include: { author: true } },
      order: true,
    },
  });

  if (!download) {
    notFound();
  }

  // Check expiration
  if (download.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-mesclar-black">
          Link de Leitura Expirado
        </h1>
        <p className="mt-2 max-w-md text-sm text-mesclar-muted">
          Este link de leitura ultrapassou o período de validade. Entre em contacto com o suporte ou renove o seu acesso na sua conta.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/conta/ebooks">
            <Button variant="gold" leftIcon={ArrowLeft}>
              Voltar à Minha Conta
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check order status
  if (
    download.order.status !== "PAYMENT_APPROVED" &&
    download.order.status !== "COMPLETED"
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-mesclar-black">
          Acesso Pendente de Aprovação
        </h1>
        <p className="mt-2 max-w-md text-sm text-mesclar-muted">
          O pagamento deste pedido ainda está em validação. O leitor será libertado assim que o pagamento for confirmado.
        </p>
        <div className="mt-6">
          <Link href="/conta/pedidos">
            <Button variant="gold">Ver Meus Pedidos</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Optional: check user session if logged in
  const session = await auth();
  if (session?.user?.id && session.user.id !== download.userId) {
    redirect("/conta/ebooks");
  }

  return (
    <WebReader
      token={token}
      bookTitle={download.book.title}
      authorName={download.book.author?.name}
      orderNumber={download.order.orderNumber}
    />
  );
}
