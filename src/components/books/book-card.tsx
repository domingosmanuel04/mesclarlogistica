"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, ArrowUpRight, Eye, ShoppingCart, Download } from "lucide-react";
import type { MockBook } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { stripHtml } from "@/lib/html-utils";
import { Button } from "@/components/ui/button";
import { productTypeLabel } from "@/contexts/cart-context";
import { useCheckout } from "@/contexts/checkout-context";
import { downloadFreeEbookById } from "@/lib/free-download";

interface BookCardProps {
  book: MockBook;
  className?: string;
  /** Free eBooks: show only Baixar and trigger PDF download */
  downloadOnly?: boolean;
}

function displayPrice(book: MockBook): number {
  if (book.productType === "PHYSICAL") return book.pricePhysical ?? 0;
  return book.priceEbook;
}

export function BookCard({ book, className, downloadOnly }: BookCardProps) {
  const { openCheckout } = useCheckout();
  const [busy, setBusy] = useState(false);
  const price = displayPrice(book);
  const isFree =
    downloadOnly ||
    ((book.productType === "EBOOK" || book.productType === "BOTH") && book.priceEbook === 0);

  async function handleFreeDownload() {
    setBusy(true);
    try {
      await downloadFreeEbookById(book.id, book.slug);
    } catch {
      window.location.href = "/samples/ebook-demo.pdf";
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={cn(
        "surface-card surface-card-hover group flex h-full flex-col overflow-hidden",
        className
      )}
    >
      <Link
        href={`/livros/${book.slug}`}
        className="relative mx-auto mt-5 aspect-[3/4] w-[72%] overflow-hidden rounded-lg bg-mesclar-cream shadow-md ring-1 ring-black/5"
      >
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 40vw, 18vw"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-mesclar-black/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-mesclar-gold-light backdrop-blur-sm">
            {productTypeLabel(book.productType)}
          </span>
          {isFree && (
            <span className="rounded-full bg-mesclar-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-mesclar-black">
              Grátis
            </span>
          )}
        </div>
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-mesclar-black opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mesclar-gold-dark">
          {book.categoryName}
        </p>
        <Link href={`/livros/${book.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-mesclar-black transition-colors group-hover:text-mesclar-gold-dark">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-mesclar-muted">{book.authorName}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mesclar-muted/90">
          {stripHtml(book.description)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i <= Math.round(book.ratingAvg)
                    ? "fill-mesclar-gold text-mesclar-gold"
                    : "fill-mesclar-border text-mesclar-border"
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-mesclar-black">{book.ratingAvg.toFixed(1)}</span>
          <span className="text-mesclar-muted">· {book.salesCount} vendas</span>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-mesclar-border/80 pt-4">
          {downloadOnly || isFree ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-mesclar-gold-dark">Grátis</span>
                <Link href={`/livros/${book.slug}`}>
                  <Button variant="secondary" size="sm" leftIcon={Eye}>
                    Detalhes
                  </Button>
                </Link>
              </div>
              <Button
                variant="success"
                size="md"
                className="w-full"
                leftIcon={Download}
                disabled={busy}
                onClick={() => void handleFreeDownload()}
              >
                {busy ? "A preparar..." : "Baixar"}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-mesclar-muted">Preço</p>
                <p className="text-lg font-bold tracking-tight text-mesclar-black">
                  {formatPrice(price)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/livros/${book.slug}`}>
                  <Button variant="secondary" size="sm" leftIcon={Eye}>
                    Detalhes
                  </Button>
                </Link>
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={ShoppingCart}
                  onClick={() =>
                    openCheckout({
                      book,
                      selectedType: book.productType === "PHYSICAL" ? "PHYSICAL" : "EBOOK",
                    })
                  }
                >
                  Comprar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
