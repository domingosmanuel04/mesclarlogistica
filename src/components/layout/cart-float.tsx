"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function CartFloat() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho${itemCount ? ` com ${itemCount} itens` : ""}`}
      className="group fixed bottom-24 right-6 z-[89] flex h-14 w-14 items-center justify-center rounded-full bg-mesclar-gold text-mesclar-black shadow-[0_8px_28px_-4px_rgba(201,162,39,0.45)] ring-1 ring-mesclar-gold-dark/50 transition-transform duration-200 hover:scale-110 hover:bg-mesclar-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesclar-gold-dark sm:bottom-28 sm:right-8"
    >
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-mesclar-black px-1.5 text-[11px] font-black text-mesclar-gold shadow-md ring-2 ring-white">
          {itemCount}
        </span>
      )}
      <ShoppingCart className="relative h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-mesclar-black px-3 py-1.5 text-xs font-medium text-mesclar-gold-light opacity-0 shadow-lg ring-1 ring-mesclar-gold/30 transition-opacity group-hover:opacity-100 sm:block">
        {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? "item" : "itens"} no carrinho` : "Ver carrinho"}
      </span>
    </Link>
  );
}
