import { NextResponse } from "next/server";
import { listCategories, listPickupPoints, getPublishedBooks } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  if (kind === "categories") {
    return NextResponse.json(await listCategories());
  }
  if (kind === "pickup-points") {
    return NextResponse.json(await listPickupPoints());
  }

  const books = await getPublishedBooks({
    q: searchParams.get("q") ?? undefined,
    categorySlug: searchParams.get("category") ?? undefined,
    productType: (searchParams.get("type") as "EBOOK" | "PHYSICAL") || undefined,
    physicalOnly: searchParams.get("physical") === "1",
    freeOnly: searchParams.get("free") === "1",
  });
  return NextResponse.json(books);
}
