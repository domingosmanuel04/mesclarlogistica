"use client";

import { useState } from "react";
import type { MockBook } from "@/types";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/contexts/checkout-context";
import { useCart } from "@/contexts/cart-context";
import { Download, ShoppingCart, BookOpen, BookMarked } from "lucide-react";
import { downloadFreeEbookById } from "@/lib/free-download";

export function BookDetailActions({ book }: { book: MockBook }) {
  const { openCheckout } = useCheckout();
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);

  const addEbook = () => {
    addItem({
      bookId: book.id,
      slug: book.slug,
      title: book.title,
      authorName: book.authorName,
      coverUrl: book.coverUrl,
      productType: book.productType,
      selectedType: "EBOOK",
      unitPrice: book.priceEbook,
      sellerId: book.sellerId,
      sellerName: book.sellerName,
    });
  };

  const addPhysical = () => {
    addItem({
      bookId: book.id,
      slug: book.slug,
      title: book.title,
      authorName: book.authorName,
      coverUrl: book.coverUrl,
      productType: book.productType,
      selectedType: "PHYSICAL",
      unitPrice: book.pricePhysical ?? 0,
      sellerId: book.sellerId,
      sellerName: book.sellerName,
    });
  };

  async function handleFree() {
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
    <div className="mt-6 flex flex-wrap gap-3">
      {book.productType !== "PHYSICAL" && book.priceEbook === 0 && (
        <Button
          variant="success"
          leftIcon={Download}
          disabled={busy}
          onClick={() => void handleFree()}
        >
          {busy ? "A preparar..." : "Baixar gratuitamente"}
        </Button>
      )}
      {book.productType !== "PHYSICAL" && book.priceEbook > 0 && (
        <>
          <Button
            variant="gold"
            leftIcon={BookOpen}
            onClick={() => openCheckout({ book, selectedType: "EBOOK" })}
          >
            Comprar eBook
          </Button>
          <Button variant="secondary" leftIcon={ShoppingCart} onClick={addEbook}>
            Adicionar ao carrinho
          </Button>
        </>
      )}
      {(book.productType === "PHYSICAL" || book.productType === "BOTH") && (
        <>
          <Button
            variant="gold"
            leftIcon={BookMarked}
            onClick={() => openCheckout({ book, selectedType: "PHYSICAL" })}
          >
            Comprar livro físico
          </Button>
          <Button variant="secondary" leftIcon={ShoppingCart} onClick={addPhysical}>
            Carrinho (físico)
          </Button>
        </>
      )}
      {book.productType === "BOTH" && book.priceEbook > 0 && (
        <Button
          variant="outline"
          leftIcon={BookOpen}
          onClick={() => openCheckout({ book, selectedType: "EBOOK" })}
        >
          Quero o eBook
        </Button>
      )}
    </div>
  );
}
