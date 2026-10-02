import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(kwanza: number): string {
  if (kwanza === 0) return "Grátis";
  return `Kz ${kwanza.toLocaleString("pt-AO")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber(seq: number): string {
  return `MES-${String(seq).padStart(6, "0")}`;
}

export function productTypeLabel(
  type: "EBOOK" | "PHYSICAL" | "BOTH"
): string {
  switch (type) {
    case "EBOOK":
      return "eBook";
    case "PHYSICAL":
      return "Livro físico";
    case "BOTH":
      return "eBook + Físico";
    default:
      return type;
  }
}
