import { NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { resolveUploadPath } from "@/lib/storage";

interface Params {
  params: Promise<{ path: string[] }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { path: parts } = await params;
  const relative = parts.join("/");
  const filePath = resolveUploadPath(relative);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
  const ext = path.extname(filePath).toLowerCase();
  const type =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : "application/octet-stream";

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;
  return new NextResponse(webStream, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
  });
}
