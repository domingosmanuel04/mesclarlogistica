import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream, existsSync, copyFileSync, mkdirSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { resolveUploadPath } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ token: string }>;
}

function ensureDemoPdf(relativePath: string): string | null {
  const filePath = resolveUploadPath(relativePath);
  if (existsSync(filePath)) return filePath;

  const sample = path.join(process.cwd(), "public", "samples", "ebook-demo.pdf");
  if (!existsSync(sample)) return null;

  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    copyFileSync(sample, filePath);
    return filePath;
  } catch {
    return sample;
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { token } = await params;

  try {
    const download = await prisma.download.findUnique({
      where: { token },
      include: { book: true, order: true },
    });

    if (!download) {
      return NextResponse.json({ error: "Link inválido." }, { status: 403 });
    }

    if (download.expiresAt < new Date()) {
      return NextResponse.json({ error: "Link expirado." }, { status: 410 });
    }

    if (download.order.status !== "PAYMENT_APPROVED" && download.order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Compra não validada." }, { status: 403 });
    }

    const session = await auth();
    if (session?.user?.id && session.user.id !== download.userId) {
      return NextResponse.json({ error: "Link inválido para esta conta." }, { status: 403 });
    }

    const pdfRel = download.book.pdfPath || "ebooks/demo.pdf";
    const filePath = ensureDemoPdf(pdfRel);
    if (!filePath) {
      return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
    }

    await prisma.download.update({
      where: { id: download.id },
      data: { usedAt: new Date() },
    });

    const { readFile } = await import("fs/promises");
    const { applyPdfWatermark } = await import("@/lib/pdf-watermark");

    const rawBuffer = await readFile(filePath);
    const watermarked = await applyPdfWatermark(rawBuffer, {
      customerName: download.order.customerName || "Leitor Mesclar",
      customerEmail: download.order.customerEmail || "cliente@mesclar.ao",
      orderNumber: download.order.orderNumber,
    });

    const isInline = new URL(_request.url).searchParams.get("inline") === "true";
    const disposition = isInline
      ? `inline; filename="${download.book.title}.pdf"`
      : `attachment; filename="${download.book.title}.pdf"`;

    return new NextResponse(new Uint8Array(watermarked), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Serviço de download indisponível. Configure a base de dados." },
      { status: 503 }
    );
  }
}
