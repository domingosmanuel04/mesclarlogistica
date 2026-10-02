import { NextResponse } from "next/server";
import { getAuthorBySlug } from "@/lib/catalog";
import { generateAuthorProfilePdf } from "@/lib/author-verification";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const author = await getAuthorBySlug(slug);

    if (!author) {
      return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    }

    const pdfBuffer = await generateAuthorProfilePdf(author);
    const isInline = new URL(request.url).searchParams.get("inline") === "true";
    const disposition = isInline
      ? `inline; filename="perfil-${slug}-validado.pdf"`
      : `attachment; filename="perfil-${slug}-validado.pdf"`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch (error) {
    console.error("[author-pdf-api] Error generating author PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF do perfil." }, { status: 500 });
  }
}
