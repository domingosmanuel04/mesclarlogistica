import { NextResponse } from "next/server";
import { requireSession, isAuthError } from "@/lib/api-auth";
import { saveUpload, StorageKind } from "@/lib/storage";

export async function POST(request: Request) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kind = ((formData.get("kind") as string) || "articles") as StorageKind;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Ficheiro não fornecido ou vazio." }, { status: 400 });
    }

    // Validação básica de tipo
    const validKinds: StorageKind[] = [
      "covers",
      "ebooks",
      "proofs",
      "banners",
      "profiles",
      "articles",
      "companies",
      "webinars",
      "chat",
    ];
    const targetKind = validKinds.includes(kind) ? kind : "articles";

    const saved = await saveUpload(targetKind, file);
    const url = `/api/uploads/${saved.relativePath}`;

    return NextResponse.json({
      ok: true,
      url,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
    });
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao processar ficheiro." },
      { status: 500 }
    );
  }
}
