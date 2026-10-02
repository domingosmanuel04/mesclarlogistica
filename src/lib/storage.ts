import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

export type StorageKind =
  | "covers"
  | "ebooks"
  | "proofs"
  | "banners"
  | "profiles"
  | "articles"
  | "companies"
  | "webinars"
  | "chat";

const ALLOWED_EXTENSIONS: Record<StorageKind, string[]> = {
  covers: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  banners: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  profiles: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  articles: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  companies: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  webinars: [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
  chat: [
    ".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
    ".mp3", ".wav", ".ogg", ".m4a", ".webm", ".aac",
    ".mp4", ".mov", ".avi", ".mkv",
    ".zip", ".rar", ".7z", ".tar", ".gz"
  ],
  ebooks: [".pdf", ".epub"],
  proofs: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
};

export async function saveUpload(
  kind: StorageKind,
  file: File
): Promise<{ relativePath: string; fileName: string; mimeType: string }> {
  const ext = path.extname(file.name).toLowerCase() || "";
  const allowed = ALLOWED_EXTENSIONS[kind] || [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  if (!allowed.includes(ext)) {
    throw new Error(`Extensão de ficheiro '${ext}' não permitida para o tipo '${kind}'.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, kind);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, safeName);

  // Path traversal check
  const resolvedFullPath = path.resolve(fullPath);
  if (!resolvedFullPath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Erro de segurança: tentativa de navegação fora da pasta de uploads.");
  }

  await writeFile(fullPath, buffer);
  return {
    relativePath: path.join(kind, safeName),
    fileName: file.name,
    mimeType: file.type,
  };
}

export function resolveUploadPath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.resolve(UPLOAD_ROOT, normalized);
  if (!fullPath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Acesso negado: tentativa de travessia de directório.");
  }
  return fullPath;
}
