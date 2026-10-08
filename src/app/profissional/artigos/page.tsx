"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  category?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  readTime?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MeusArtigosPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seller/articles");
      if (!res.ok) {
        setArticles([]);
        return;
      }
      const data = await res.json().catch(() => []);
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar este artigo? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingId(id);
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/seller/articles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Erro ao eliminar o artigo.");
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao eliminar.");
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  }

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPublished = articles.filter((a) => a.status === "PUBLISHED").length;
  const totalDraft = articles.filter((a) => a.status === "DRAFT").length;
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);

  return (
    <DashboardShell
      title="Meus Artigos"
      subtitle="Faça a gestão dos seus artigos, publicações e análises especializadas"
      nav={sellerNav}
    >
      <div className="space-y-6">
        {/* Header & Ação de Criar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-mesclar-black">
              Artigos Publicados e Rascunhos
            </h1>
            <p className="text-xs text-mesclar-muted mt-0.5">
              Consulte, edite ou crie novos artigos para a plataforma de conteúdos da Mesclar Logística
            </p>
          </div>
          <Link href="/profissional/artigos/novo">
            <Button variant="gold" size="sm" leftIcon={PlusCircle} className="shadow-sm">
              Criar Artigo
            </Button>
          </Link>
        </div>

        {/* Resumo de Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold text-mesclar-muted">Total de Artigos</p>
            <p className="mt-1 text-2xl font-bold text-mesclar-black">{articles.length}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold text-emerald-700">Publicados</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{totalPublished}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold text-amber-700">Rascunhos</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{totalDraft}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold text-mesclar-gold-dark">Total Visualizações</p>
            <p className="mt-1 text-2xl font-bold text-mesclar-black">{totalViews}</p>
          </div>
        </div>

        {/* Barra de Filtro e Pesquisa */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por título ou categoria..."
              className="w-full rounded-xl border border-mesclar-border bg-white pl-10 pr-4 py-2 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Tabela de Artigos */}
        <div className="surface-card overflow-hidden">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-mesclar-gold" />
              <span className="ml-2 text-sm text-mesclar-muted">A carregar artigos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-mesclar-black">Nenhum artigo encontrado</h3>
              <p className="mt-1 max-w-sm text-xs text-mesclar-muted">
                {search
                  ? "Nenhum artigo corresponde à sua pesquisa."
                  : "Ainda não publicou nenhum artigo. Comece agora a redigir o seu primeiro artigo especializado!"}
              </p>
              {!search && (
                <div className="mt-5">
                  <Link href="/profissional/artigos/novo">
                    <Button variant="gold" size="sm" leftIcon={PlusCircle}>
                      Criar Primeiro Artigo
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-mesclar-border/80 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Artigo</th>
                    <th className="px-4 py-3.5">Categoria</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5">Data</th>
                    <th className="px-4 py-3.5">Visualizações</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mesclar-border/60">
                  {filtered.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-mesclar-border bg-slate-100">
                            <Image
                              src={article.coverUrl || "/services/gestao-contratos.jpg"}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized={Boolean(article.coverUrl?.startsWith("/api/"))}
                            />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <p className="font-semibold text-mesclar-black truncate">
                              {article.title}
                            </p>
                            <p className="text-xs text-slate-400 font-mono truncate">
                              /artigos/{article.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-600">
                        {article.category || "Geral"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            article.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                              : article.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20"
                          }`}
                        >
                          {article.status === "PUBLISHED"
                            ? "Publicado"
                            : article.status === "DRAFT"
                            ? "Rascunho"
                            : "Arquivado"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-AO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                        {article.views || 0}
                      </td>

                      {/* Botões Solicitados: Ver, Editar, Eliminar */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botão Ver */}
                          <Link
                            href={`/artigos/${article.slug}`}
                            target="_blank"
                            title="Ver artigo no site"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-mesclar-gold hover:text-mesclar-gold-dark hover:shadow-xs transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver</span>
                          </Link>

                          {/* Botão Editar */}
                          <Link
                            href={`/profissional/artigos/${article.id}/editar`}
                            title="Editar artigo"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-mesclar-black hover:text-black hover:shadow-xs transition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </Link>

                          {/* Botão Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDelete(article.id)}
                            disabled={isDeleting && deletingId === article.id}
                            title="Eliminar artigo"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
