"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Search, Check } from "lucide-react";
import type { MockCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FiltersDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("recent");
  const [categories, setCategories] = useState<MockCategory[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void fetch("/api/catalog?kind=categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("categoria", category);
    if (type !== "all") params.set("tipo", type);
    if (price !== "all") params.set("preco", price);
    if (sort !== "recent") params.set("sort", sort);
    setOpen(false);
    router.push(`/ebooks?${params.toString()}`);
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setType("all");
    setPrice("all");
    setSort("recent");
  }

  const panel =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100]">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Fechar filtros"
              onClick={() => setOpen(false)}
            />
            <aside
              className="fixed top-0 right-0 bottom-0 flex h-dvh min-h-screen w-full max-w-md flex-col bg-white shadow-2xl animate-[slide-in-right_0.28s_ease-out]"
              role="dialog"
              aria-modal
              aria-label="Filtros da plataforma"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-mesclar-border px-5 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-dark">
                    Plataforma
                  </p>
                  <h2 className="text-lg font-bold">Filtros</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-mesclar-border hover:bg-mesclar-cream/50"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6">
                <div>
                  <label className="text-sm font-semibold">Pesquisar</label>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mesclar-muted" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Título, autor, palavra-chave..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">Categoria</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={category === "all"} onClick={() => setCategory("all")} label="Todas" />
                    {categories.map((c) => (
                      <Chip
                        key={c.id}
                        active={category === c.slug}
                        onClick={() => setCategory(c.slug)}
                        label={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">Tipo</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={type === "all"} onClick={() => setType("all")} label="Todos" />
                    <Chip active={type === "ebook"} onClick={() => setType("ebook")} label="eBook" />
                    <Chip
                      active={type === "physical"}
                      onClick={() => setType("physical")}
                      label="Livro físico"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">Preço</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={price === "all"} onClick={() => setPrice("all")} label="Qualquer" />
                    <Chip active={price === "gratis"} onClick={() => setPrice("gratis")} label="Gratuitos" />
                    <Chip active={price === "premium"} onClick={() => setPrice("premium")} label="Premium" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">Ordenar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={sort === "recent"} onClick={() => setSort("recent")} label="Mais recentes" />
                    <Chip active={sort === "vendas"} onClick={() => setSort("vendas")} label="Mais vendidos" />
                    <Chip
                      active={sort === "avaliados"}
                      onClick={() => setSort("avaliados")}
                      label="Mais avaliados"
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-mesclar-border bg-mesclar-cream/40 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <Button variant="secondary" className="flex-1" onClick={clearFilters}>
                  Limpar
                </Button>
                <Button variant="gold" className="flex-1" leftIcon={Check} onClick={applyFilters}>
                  Aplicar filtros
                </Button>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-10 items-center gap-2 rounded-full border border-mesclar-border bg-mesclar-cream/40 px-4 text-sm text-mesclar-muted transition hover:border-mesclar-gold/40 hover:text-mesclar-black"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden lg:inline">Filtros</span>
      </button>
      {panel}
    </>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-xs font-semibold transition-all",
        active
          ? "bg-mesclar-black text-mesclar-gold-light shadow-sm"
          : "border border-mesclar-border bg-white text-mesclar-muted hover:border-mesclar-gold/40"
      )}
    >
      {label}
    </button>
  );
}
