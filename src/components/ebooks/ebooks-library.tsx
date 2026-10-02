"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { filterLabels } from "@/data/mock-data";
import type { MockBook, MockCategory } from "@/types";
import { BookGrid } from "@/components/books/book-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

const filterSlugs = [
  "all",
  "logistica",
  "procurement",
  "compras",
  "importacao",
  "armazem",
  "frotas",
  "supply-chain",
  "transporte",
  "gestao-estoque",
  "comercio-internacional",
];

export function EbooksLibrary() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("categoria") ?? "all");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [allBooks, setAllBooks] = useState<MockBook[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [page, setPage] = useState(1);
  const type = searchParams.get("tipo") ?? "all";
  const price = searchParams.get("preco") ?? "all";
  const sort = searchParams.get("sort") ?? "recent";

  useEffect(() => {
    setFilter(searchParams.get("categoria") ?? "all");
    setQuery(searchParams.get("q") ?? "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/catalog").then((r) => r.json()),
      fetch("/api/catalog?kind=categories").then((r) => r.json()),
    ]).then(([books, cats]) => {
      setAllBooks(Array.isArray(books) ? books : []);
      setCategories(Array.isArray(cats) ? cats : []);
    });
  }, []);

  const books = useMemo(() => {
    let list = [...allBooks];

    if (type === "ebook") {
      list = list.filter((b) => b.productType === "EBOOK" || b.productType === "BOTH");
    } else if (type === "physical") {
      list = list.filter((b) => b.productType === "PHYSICAL" || b.productType === "BOTH");
    } else {
      list = list.filter((b) => b.productType === "EBOOK" || b.productType === "BOTH");
    }

    if (filter !== "all") {
      const cat = categories.find((c) => c.slug === filter);
      if (cat) list = list.filter((b) => b.categoryId === cat.id);
      else list = list.filter((b) => b.categoryName.toLowerCase().includes(filter.replace(/-/g, " ")));
    }

    if (price === "gratis") {
      list = list.filter((b) => b.priceEbook === 0);
    } else if (price === "premium") {
      list = list.filter((b) => b.priceEbook > 0);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.keywords ?? []).some((k) => k.toLowerCase().includes(q))
      );
    }

    if (sort === "vendas") list.sort((a, b) => b.salesCount - a.salesCount);
    if (sort === "avaliados") list.sort((a, b) => b.ratingAvg - a.ratingAvg);

    return list;
  }, [allBooks, categories, filter, query, type, price, sort]);

  useEffect(() => {
    setPage(1);
  }, [filter, query, type, price, sort]);

  const pageCount = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const paged = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mesclar-muted" />
        <input
          type="search"
          placeholder="Pesquisar livros..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field py-3.5 pl-12"
        />
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {filterSlugs.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => setFilter(slug)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-200",
              filter === slug
                ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/40 shadow-md"
                : "border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] text-mesclar-muted dark:text-slate-300 hover:border-mesclar-gold/50 hover:text-mesclar-black dark:hover:text-white"
            )}
          >
            {filterLabels[slug] ?? slug}
          </button>
        ))}
      </div>

      <p className="mb-6 text-sm text-mesclar-muted dark:text-slate-400">
        <span className="font-semibold text-mesclar-black dark:text-white">{books.length}</span> título
        {books.length !== 1 ? "s" : ""} encontrado{books.length !== 1 ? "s" : ""}
        {pageCount > 1 ? ` · página ${page} de ${pageCount}` : ""}
      </p>

      <BookGrid books={paged} columns={3} />

      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-mesclar-muted">
            {page} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Seguinte
          </Button>
        </div>
      )}
    </div>
  );
}
