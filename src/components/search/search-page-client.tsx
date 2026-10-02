"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MockBook, MockCategory } from "@/types";
import { BookGrid } from "@/components/books/book-grid";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");
  const [allBooks, setAllBooks] = useState<MockBook[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/catalog").then((r) => r.json()),
      fetch("/api/catalog?kind=categories").then((r) => r.json()),
    ]).then(([books, cats]) => {
      setAllBooks(Array.isArray(books) ? books : []);
      setCategories(Array.isArray(cats) ? cats : []);
    });
  }, []);

  const results = useMemo(() => {
    let list = [...allBooks];
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(lower) ||
          b.authorName.toLowerCase().includes(lower) ||
          b.description.toLowerCase().includes(lower) ||
          (b.keywords ?? []).some((k) => k.toLowerCase().includes(lower))
      );
    }
    if (category !== "all") {
      const cat = categories.find((c) => c.slug === category);
      if (cat) list = list.filter((b) => b.categoryId === cat.id);
    }
    if (type === "ebook") list = list.filter((b) => b.productType !== "PHYSICAL");
    if (type === "physical") list = list.filter((b) => b.productType !== "EBOOK");

    if (sort === "vendas") list.sort((a, b) => b.salesCount - a.salesCount);
    if (sort === "avaliados") list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    return list;
  }, [allBooks, categories, q, category, type, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar livros..."
        className="w-full rounded-xl border border-mesclar-border px-4 py-3"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="all">Todos os tipos</option>
          <option value="ebook">eBook</option>
          <option value="physical">Físico</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="recent">Recentes</option>
          <option value="vendas">Mais vendidos</option>
          <option value="avaliados">Melhor avaliados</option>
        </select>
      </div>
      <p className="mt-6 mb-4 text-sm text-mesclar-muted">{results.length} resultado(s)</p>
      <BookGrid books={results} columns={3} />
    </div>
  );
}
