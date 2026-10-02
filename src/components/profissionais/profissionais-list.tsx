"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { employmentLabel, academicLabel } from "@/lib/professional";
import type { MockAuthor } from "@/types";
import {
  GraduationCap,
  CheckCircle2,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type AuthorWithBookCount = MockAuthor & {
  bookCount: number;
};

const ITEMS_PER_PAGE = 6;

export function ProfissionaisList({ authors }: { authors: AuthorWithBookCount[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authors;
    const q = searchQuery.toLowerCase();
    return authors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.specialty?.toLowerCase().includes(q) ||
        a.bio?.toLowerCase().includes(q) ||
        a.technicalSkills?.toLowerCase().includes(q)
    );
  }, [authors, searchQuery]);

  const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE) || 1;

  // Reset para a página 1 ao pesquisar
  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  const paginatedAuthors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAuthors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAuthors, currentPage]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredAuthors.length);

  return (
    <div className="space-y-8">
      {/* Barra de Controlo e Pesquisa */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-mesclar-border/80 bg-white p-4 sm:p-6 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mesclar-muted" />
          <input
            type="text"
            placeholder="Pesquisar por nome, especialidade ou competência..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-mesclar-border bg-mesclar-surface/50 pl-10 pr-9 py-2.5 text-xs text-mesclar-black placeholder:text-mesclar-muted focus:border-mesclar-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mesclar-muted hover:text-mesclar-black"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <p className="text-xs font-semibold text-mesclar-muted">
            {filteredAuthors.length > 0 ? (
              <>
                A mostrar <strong className="text-mesclar-black">{startIdx}–{endIdx}</strong> de{" "}
                <strong className="text-mesclar-black">{filteredAuthors.length}</strong> profissionais
              </>
            ) : (
              "Nenhum profissional encontrado"
            )}
          </p>
          <Link href="/profissional/perfil-profissional">
            <Button variant="gold" size="sm">
              Criar / Atualizar Meu Perfil
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Cards (6 por página) */}
      {paginatedAuthors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedAuthors.map((author) => {
            const empStatus = employmentLabel(author.employmentStatus);
            const acadStatus = academicLabel(author.academicStatus);

            return (
              <Link
                key={author.id}
                href={`/autores/${author.slug}`}
                className="surface-card surface-card-hover group flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-mesclar-gold/50"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-mesclar-border group-hover:ring-mesclar-gold/50 transition-colors shadow-sm">
                      <Image
                        src={author.photoUrl || "/placeholder-author.jpg"}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-mesclar-black truncate group-hover:text-mesclar-gold-dark transition-colors">
                          {author.name}
                        </h3>
                        {author.isValidated && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-mesclar-gold" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-mesclar-gold-dark mt-0.5 line-clamp-1">
                        {author.specialty || "Profissional de Logística"}
                      </p>
                      {acadStatus && (
                        <p className="text-[11px] text-mesclar-muted mt-1 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 shrink-0 text-mesclar-muted" />
                          <span className="truncate">{acadStatus}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {empStatus && (
                      <span className="rounded-full bg-mesclar-black px-2.5 py-0.5 text-[10px] font-semibold text-mesclar-gold-light">
                        {empStatus}
                      </span>
                    )}
                    {author.technicalSkills && (
                      <span className="rounded-full bg-mesclar-cream px-2.5 py-0.5 text-[10px] font-semibold text-mesclar-gold-dark truncate max-w-[180px]">
                        {author.technicalSkills.split(",")[0]?.trim()}
                      </span>
                    )}
                  </div>

                  {author.bio && (
                    <p className="mt-3 text-xs leading-relaxed text-mesclar-muted line-clamp-2">
                      {author.bio}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-mesclar-border/60 pt-4 text-xs font-medium text-mesclar-muted">
                  <span>{author.bookCount} publicação(ões)</span>
                  <span className="flex items-center gap-1 font-semibold text-mesclar-gold-dark group-hover:translate-x-1 transition-transform">
                    Ver currículo <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="surface-card rounded-3xl p-12 text-center space-y-3">
          <Users className="mx-auto h-12 w-12 text-mesclar-muted opacity-50" />
          <h3 className="text-base font-bold text-mesclar-black">Nenhum profissional encontrado</h3>
          <p className="text-xs text-mesclar-muted max-w-sm mx-auto">
            Não foram encontrados profissionais para os termos digitados. Tente pesquisar por outro nome ou área.
          </p>
          <Button variant="outline" size="sm" onClick={() => handleSearchChange("")}>
            Limpar pesquisa
          </Button>
        </div>
      )}

      {/* Controlos de Paginação (Inicial 6 itens por página) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-mesclar-border/60">
          <p className="text-xs font-medium text-mesclar-muted">
            Página <strong className="text-mesclar-black">{currentPage}</strong> de{" "}
            <strong className="text-mesclar-black">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-mesclar-border bg-white px-3 py-1.5 text-xs font-semibold text-mesclar-black shadow-xs transition hover:bg-mesclar-cream hover:border-mesclar-gold/50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pg);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition ${
                    currentPage === pg
                      ? "bg-mesclar-gold text-mesclar-black shadow-sm"
                      : "border border-mesclar-border bg-white text-mesclar-black hover:border-mesclar-gold/50 hover:bg-mesclar-cream"
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-mesclar-border bg-white px-3 py-1.5 text-xs font-semibold text-mesclar-black shadow-xs transition hover:bg-mesclar-cream hover:border-mesclar-gold/50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Seguinte
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
